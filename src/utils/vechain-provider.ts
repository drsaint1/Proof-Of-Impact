import { Interface } from 'ethers';

/**
 * VeChain Provider using Connex (injected by VeWorld)
 */

export class VeChainProvider {
  private connex: any;
  private account: string;

  constructor(connex: any, account: string) {
    this.connex = connex;
    this.account = account;
  }

  /**
   * Send a transaction using Connex
   */
  async sendTransaction(to: string, data: string, value?: string): Promise<any> {
    try {
      if (!this.connex || !this.connex.vendor) {
        throw new Error(`Connex vendor not available. Make sure VeWorld extension is installed and connected.`);
      }

      const clause = {
        to,
        value: value || '0x0',
        data,
      };

      // Request transaction signature
      const response = await this.connex.vendor
        .sign('tx', [clause])
        .signer(this.account)
        .gas(1000000) // High gas limit for complex transactions
        .request();

      if (!response || !response.txid) {
        throw new Error('Transaction was rejected or cancelled');
      }

      return {
        hash: response.txid,
        wait: async () => {
          // Poll for transaction receipt
          let attempts = 0;
          const maxAttempts = 30;

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
              const receipt = await this.connex.thor.transaction(response.txid).getReceipt();
              if (receipt) {
                if (receipt.reverted) {
                  throw new Error('Transaction reverted on chain');
                }
                return {
                  status: 1,
                  hash: response.txid,
                  ...receipt
                };
              }
            } catch (err) {
              // Waiting for transaction to be mined
            }

            attempts++;
          }

          throw new Error('Transaction timeout - please check VeChain explorer');
        },
      };
    } catch (error: any) {
      // Better error messages
      if (error.message === 'No response returned' || error.message?.includes('rejected')) {
        throw new Error('Transaction was rejected or cancelled by user');
      }
      throw error;
    }
  }

  getAddress(): string {
    return this.account;
  }

  getConnex(): any {
    return this.connex;
  }
}

export function createVeChainContract(
  address: string,
  abi: any[],
  provider: VeChainProvider
): any {
  const contract: any = {};
  const iface = new Interface(abi);
  const connex = provider.getConnex();

  abi.forEach((item: any) => {
    if (item.type === 'function') {
      contract[item.name] = async (...args: any[]) => {
        if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
          try {
            if (!connex || !connex.thor) {
              throw new Error(`Connex not properly initialized. Thor: ${!!connex?.thor}, Vendor: ${!!connex?.vendor}`);
            }
            const method = connex.thor.account(address).method(item);
            const result = await method.call(...args);

            if (result && result.decoded) {
              const decoded = result.decoded;

              const convertToStruct = (obj: any, outputs: any[]): any => {
                if (!obj || typeof obj !== 'object') return obj;

                if (Array.isArray(obj)) {
                  return obj.map(item => convertToStruct(item, outputs));
                }

                const keys = Object.keys(obj);
                const isNumericKeys = keys.every(key => !isNaN(Number(key)));

                if (isNumericKeys && outputs && outputs[0]?.components) {
                  const struct: any = {};
                  outputs[0].components.forEach((component: any, index: number) => {
                    struct[component.name] = obj[index.toString()];
                  });
                  return struct;
                } else if (isNumericKeys) {
                  return keys.sort((a, b) => Number(a) - Number(b)).map(key => obj[key]);
                }

                return obj;
              };

              if (typeof decoded === 'object' && !Array.isArray(decoded)) {
                const keys = Object.keys(decoded);

                if (keys.length === 1 && keys[0] === '0') {
                  const value = decoded['0'];

                  if (Array.isArray(value)) {
                    const outputs = item.outputs;
                    if (outputs && outputs[0]?.type === 'tuple[]') {
                      return value.map((structObj: any) => {
                        const converted: any = {};
                        outputs[0].components.forEach((component: any, index: number) => {
                          converted[component.name] = structObj[index.toString()];
                        });
                        return converted;
                      });
                    }
                  }

                  return value;
                }

                const isArrayLike = keys.every(key => !isNaN(Number(key)));
                if (isArrayLike) {
                  return keys.map(key => decoded[key]);
                }
              }

              return decoded;
            } else if (result && result.data !== undefined) {
              return result.data;
            }

            return [];
          } catch (error) {
            throw error;
          }
        } else {
          const data = iface.encodeFunctionData(item.name, args);
          const tx = await provider.sendTransaction(address, data);
          return tx;
        }
      };
    }
  });

  contract.getAddress = () => address;

  return contract;
}

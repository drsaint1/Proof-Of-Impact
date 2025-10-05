// Augment the Window interface to include VeWorld properties
import '@vechain/vechain-kit';

declare global {
  interface Window {
    vechain?: {
      newConnex?: (options: { node: string; network: string }) => Promise<any>;
      newConnexSigner?: (genesisId: string) => any;
      isInAppBrowser?: boolean;
    } & any;
  }
}

export {};

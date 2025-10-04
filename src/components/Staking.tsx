import { useState, useEffect } from 'react';
import { BrowserProvider, parseEther, formatEther, Interface } from 'ethers';
import { TrendingUp, Lock, Unlock, Gift, DollarSign } from 'lucide-react';
import { getContracts } from '../utils/contracts';
import { useToast } from '../hooks/useToast';
import MockB3TRABI from '../contracts/MockB3TR.json';

interface StakingProps {
  connex: any;
  account: string;
}

export default function Staking({ connex, account }: StakingProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [pendingReward, setPendingReward] = useState<string>('0');
  const [stakeInput, setStakeInput] = useState('');
  const [unstakeInput, setUnstakeInput] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [account]);

  const loadData = async () => {
    try {
      const { b3trToken, stakingPool } = await getContracts(connex, account);

      // Load B3TR balance
      const bal = await b3trToken.balanceOf(account);
      setBalance(formatEther(bal));

      // Load staking info
      const stakeInfo = await stakingPool.getStakeInfo(account);
      setStakedAmount(formatEther(stakeInfo[0]));
      setPendingReward(formatEther(stakeInfo[2]));
    } catch (error) {
    }
  };

  const handleStake = async () => {
    if (!stakeInput || parseFloat(stakeInput) <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { b3trToken, stakingPool } = await getContracts(connex, account);
      const amount = parseEther(stakeInput);
      const stakingAddress = await stakingPool.getAddress();

      // Check current allowance
      const currentAllowance = await b3trToken.allowance(account, stakingAddress);

      // Build clauses for multi-clause transaction
      const clauses = [];
      const tokenInterface = new Interface(MockB3TRABI.abi);

      // If allowance is insufficient, add approve clause
      if (BigInt(currentAllowance) < BigInt(amount)) {
        const maxApproval = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const approveData = tokenInterface.encodeFunctionData('approve', [stakingAddress, maxApproval]);

        clauses.push({
          to: import.meta.env.VITE_MOCKB3TR_ADDRESS,
          value: '0x0',
          data: approveData
        });
      }

      // Add stake clause
      const stakingInterface = new Interface([
        {
          "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
          "name": "stake",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]);
      const stakeData = stakingInterface.encodeFunctionData('stake', [amount]);

      clauses.push({
        to: import.meta.env.VITE_STAKING_POOL_ADDRESS,
        value: '0x0',
        data: stakeData
      });

      // Execute multi-clause transaction
      toast.info('Processing transaction...');
      const response = await connex.vendor
        .sign('tx', clauses)
        .signer(account)
        .gas(500000) // Increased gas limit for multi-clause transaction
        .request();

      if (!response || !response.txid) {
        throw new Error('Transaction was rejected or cancelled');
      }

      // Wait for transaction to be mined
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts && !receipt) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          receipt = await connex.thor.transaction(response.txid).getReceipt();
        } catch (err) {
        }
        attempts++;
      }

      if (!receipt) {
        throw new Error('Transaction timeout');
      }

      if (receipt.reverted) {
        throw new Error('Transaction reverted');
      }

      toast.success(`Successfully staked ${stakeInput} B3TR!`);
      setStakeInput('');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeInput || parseFloat(unstakeInput) <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { stakingPool } = await getContracts(connex, account);
      const amount = parseEther(unstakeInput);

      const tx = await (stakingPool as any).unstake(amount);
      await tx.wait();

      toast.success(`Successfully unstaked ${unstakeInput} B3TR!`);
      setUnstakeInput('');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unstake');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      const { stakingPool } = await getContracts(connex, account);

      const tx = await (stakingPool as any).claimRewards();
      await tx.wait();

      toast.success('Successfully claimed rewards!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim rewards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Stake B3TR Tokens</h2>
        <p className="text-gray-600">Earn passive rewards by staking your B3TR tokens</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-600">Available</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{parseFloat(balance).toFixed(2)}</p>
          <p className="text-sm text-gray-600">B3TR Balance</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-sm font-semibold text-primary-600">Staked</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{parseFloat(stakedAmount).toFixed(2)}</p>
          <p className="text-sm text-gray-600">B3TR Staked</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Gift className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-yellow-600">Rewards</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{parseFloat(pendingReward).toFixed(4)}</p>
          <p className="text-sm text-gray-600">Pending B3TR</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stake Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-lg mr-3">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Stake Tokens</h3>
              <p className="text-sm text-gray-600">Lock B3TR to earn rewards</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Stake</label>
            <div className="relative">
              <input
                type="number"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => setStakeInput(balance)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
              >
                MAX
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(balance).toFixed(2)} B3TR</p>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700">APY:</span>
              <span className="font-bold text-primary-600">10%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Estimated Daily Earnings:</span>
              <span className="font-semibold text-gray-900">
                {stakeInput ? (parseFloat(stakeInput) * 0.1 / 365).toFixed(4) : '0.0000'} B3TR
              </span>
            </div>
          </div>

          <button
            onClick={handleStake}
            disabled={loading || !stakeInput || parseFloat(stakeInput) <= 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Staking...' : 'Stake B3TR'}
          </button>
        </div>

        {/* Unstake Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-3 rounded-lg mr-3">
              <Unlock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Unstake Tokens</h3>
              <p className="text-sm text-gray-600">Withdraw your staked B3TR</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Unstake</label>
            <div className="relative">
              <input
                type="number"
                value={unstakeInput}
                onChange={(e) => setUnstakeInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={() => setUnstakeInput(stakedAmount)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                MAX
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Staked: {parseFloat(stakedAmount).toFixed(2)} B3TR</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Pending Rewards:</span>
              <span className="text-lg font-bold text-yellow-600">{parseFloat(pendingReward).toFixed(4)} B3TR</span>
            </div>
            <button
              onClick={handleClaimRewards}
              disabled={loading || parseFloat(pendingReward) <= 0}
              className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Gift className="mr-2 h-4 w-4" />
              Claim Rewards
            </button>
          </div>

          <button
            onClick={handleUnstake}
            disabled={loading || !unstakeInput || parseFloat(unstakeInput) <= 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Unstaking...' : 'Unstake B3TR'}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start">
          <TrendingUp className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">How Staking Works</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Stake your B3TR tokens to earn 10% APY rewards</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Rewards are calculated in real-time based on your staked amount</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>You can unstake your tokens at any time without penalties</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Rewards are automatically claimed when you stake or unstake</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

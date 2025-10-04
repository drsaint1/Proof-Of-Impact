import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { Droplet, Wallet, CheckCircle, Loader } from 'lucide-react';
import { getContracts } from '../utils/contracts';
import { useToast } from '../hooks/useToast';

interface FaucetProps {
  connex: any;
  account: string;
}

export default function Faucet({ connex, account }: FaucetProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [lastClaim, setLastClaim] = useState<number>(0);
  const [canClaim, setCanClaim] = useState(true);

  const COOLDOWN_TIME = 60 * 60; // 1 hour in seconds
  const FAUCET_AMOUNT = '10000'; // 10000 B3TR per claim

  useEffect(() => {
    if (!connex || !account) return;
    loadBalance();
    checkCooldown();
  }, [connex, account]);

  const loadBalance = async () => {
    try {
      const { b3trToken } = await getContracts(connex, account);
      const bal = await b3trToken.balanceOf(account);
      setBalance(formatEther(bal));
    } catch (error) {
    }
  };

  const checkCooldown = () => {
    const lastClaimTime = localStorage.getItem(`faucet_${account}`);
    if (lastClaimTime) {
      const timeSince = Math.floor(Date.now() / 1000) - parseInt(lastClaimTime);
      setLastClaim(timeSince);
      setCanClaim(timeSince >= COOLDOWN_TIME);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const { b3trToken } = await getContracts(connex, account);

      // Call faucet function
      const tx = await (b3trToken as any).faucet();
      await tx.wait();

      // Update cooldown
      localStorage.setItem(`faucet_${account}`, Math.floor(Date.now() / 1000).toString());
      setCanClaim(false);
      setLastClaim(0);

      // Reload balance
      await loadBalance();

      toast.success(`Successfully claimed ${FAUCET_AMOUNT} B3TR tokens!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim tokens');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    const remaining = COOLDOWN_TIME - lastClaim;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-full">
              <Droplet className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">B3TR Token Faucet</h1>
          <p className="text-xl text-gray-600">Get free B3TR tokens for testing</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Balance Display */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your B3TR Balance</p>
                <p className="text-4xl font-bold text-gray-900">{parseFloat(balance).toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">B3TR Tokens</p>
              </div>
              <div className="bg-white rounded-full p-4">
                <Wallet className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Connected Wallet */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Connected Wallet</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>

          {/* Faucet Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Amount per claim:</span>
              <span className="text-xl font-bold text-green-600">{FAUCET_AMOUNT} B3TR</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Cooldown period:</span>
              <span className="text-lg font-semibold text-purple-600">1 hour</span>
            </div>
          </div>

          {/* Claim Button */}
          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-6 w-6 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Droplet className="mr-2 h-6 w-6" />
                  Claim {FAUCET_AMOUNT} B3TR Tokens
                </>
              )}
            </button>
          ) : (
            <div className="w-full p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 text-center">
              <p className="text-orange-800 font-semibold mb-2">Cooldown Active</p>
              <p className="text-orange-600">
                You can claim again in <span className="font-bold">{getTimeRemaining()}</span>
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">How to use the faucet:</h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">1.</span>
                <span>Connect your VeWorld wallet (already connected ✓)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">2.</span>
                <span>Click "Claim B3TR Tokens" to receive {FAUCET_AMOUNT} B3TR</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">3.</span>
                <span>Wait 1 hour before claiming again</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">4.</span>
                <span>Use tokens to create opportunities (NGOs) or stake for rewards</span>
              </li>
            </ol>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Note:</span> These are testnet tokens for development purposes only.
              They have no real-world value and are used exclusively for testing ProofOfImpact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

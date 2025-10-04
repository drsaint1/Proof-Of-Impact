import React, { useState, useEffect } from 'react';
import { parseEther, formatEther, Interface } from 'ethers';
import { Zap, Users, DollarSign, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import FeeDelegationABI from '../contracts/FeeDelegationManager.json';

interface FeeDelegationPanelProps {
  connex: any;
  account: string;
  feeDelegationAddress: string;
}

export default function FeeDelegationPanel({ connex, account, feeDelegationAddress }: FeeDelegationPanelProps) {
  const toast = useToast();
  const [deposit, setDeposit] = useState<string>('0');
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [newVolunteer, setNewVolunteer] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const MINIMUM_DEPOSIT = '10'; // 10 VET minimum

  useEffect(() => {
    if (!connex) return;
    loadDelegationInfo();
  }, [connex, account, feeDelegationAddress]);

  const loadDelegationInfo = async () => {
    try {
      const getNGODepositMethod = FeeDelegationABI.abi.find((x: any) => x.name === 'getNGODeposit');
      const getNGOVolunteersMethod = FeeDelegationABI.abi.find((x: any) => x.name === 'getNGOVolunteers');

      // Get NGO deposit
      const depositResult = await connex.thor
        .account(feeDelegationAddress)
        .method(getNGODepositMethod)
        .call(account);

      setDeposit(formatEther(depositResult.decoded[0] || 0n));

      // Get sponsored volunteers
      const volunteersResult = await connex.thor
        .account(feeDelegationAddress)
        .method(getNGOVolunteersMethod)
        .call(account);

      setVolunteers(volunteersResult.decoded[0] || []);
    } catch (error) {
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < parseFloat(MINIMUM_DEPOSIT)) {
      toast.error(`Minimum deposit is ${MINIMUM_DEPOSIT} VET`);
      return;
    }

    setLoading(true);
    try {
      const depositMethod = FeeDelegationABI.abi.find((x: any) => x.name === 'depositForSponsorship');

      const clause = connex.thor
        .account(feeDelegationAddress)
        .method(depositMethod)
        .value(parseEther(depositAmount).toString())
        .asClause();

      const tx = connex.vendor.sign('tx', [clause])
        .signer(account)
        .gas(200000)
        .comment(`Deposit ${depositAmount} VET for fee sponsorship`);

      const result = await tx.request();

      toast.success(`Successfully deposited ${depositAmount} VET!`);
      setDepositAmount('');
      await loadDelegationInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVolunteer = async () => {
    if (!newVolunteer || newVolunteer.length !== 42 || !newVolunteer.startsWith('0x')) {
      toast.error('Please enter a valid address');
      return;
    }

    setLoading(true);
    try {
      const addVolunteerMethod = FeeDelegationABI.abi.find((x: any) => x.name === 'addVolunteer');

      const clause = connex.thor
        .account(feeDelegationAddress)
        .method(addVolunteerMethod)
        .asClause(newVolunteer);

      const tx = connex.vendor.sign('tx', [clause])
        .signer(account)
        .gas(300000)
        .comment('Add volunteer to fee sponsorship');

      const result = await tx.request();

      toast.success(`Volunteer ${newVolunteer.slice(0, 8)}... added!`);
      setNewVolunteer('');
      await loadDelegationInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add volunteer');
    } finally {
      setLoading(false);
    }
  };


  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(deposit)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const withdrawMethod = FeeDelegationABI.abi.find((x: any) => x.name === 'withdraw');

      const clause = connex.thor
        .account(feeDelegationAddress)
        .method(withdrawMethod)
        .asClause(parseEther(withdrawAmount).toString());

      const tx = connex.vendor.sign('tx', [clause])
        .signer(account)
        .gas(200000)
        .comment(`Withdraw ${withdrawAmount} VET`);

      const result = await tx.request();

      toast.success(`Successfully withdrew ${withdrawAmount} VET`);
      setWithdrawAmount('');
      await loadDelegationInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Fee Delegation Manager</h2>
        </div>
        <p className="text-green-100">
          Sponsor your volunteers' gas fees so they can submit proofs without needing VET
        </p>
      </div>

      {/* Balance Display */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm">Your Sponsorship Balance</p>
            <p className="text-3xl font-bold text-green-600">{deposit} VET</p>
          </div>
          <DollarSign className="h-12 w-12 text-green-200" />
        </div>
        <p className="text-sm text-gray-500">
          Minimum deposit: {MINIMUM_DEPOSIT} VET
        </p>
      </div>

      {/* Deposit Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Deposit VET for Sponsorship
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder={`Min ${MINIMUM_DEPOSIT} VET`}
            className="flex-1 border rounded-lg px-4 py-2"
            disabled={loading}
            step="0.1"
            min={MINIMUM_DEPOSIT}
          />
          <button
            onClick={handleDeposit}
            disabled={loading || !depositAmount}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Deposit
          </button>
        </div>
      </div>

      {/* Add Volunteer Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Add Volunteer
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newVolunteer}
            onChange={(e) => setNewVolunteer(e.target.value)}
            placeholder="0x..."
            className="flex-1 border rounded-lg px-4 py-2 font-mono text-sm"
            disabled={loading}
          />
          <button
            onClick={handleAddVolunteer}
            disabled={loading || !newVolunteer || parseFloat(deposit) < parseFloat(MINIMUM_DEPOSIT)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Add
          </button>
        </div>
        {parseFloat(deposit) < parseFloat(MINIMUM_DEPOSIT) && (
          <p className="text-sm text-red-600 mt-2">
            Please deposit at least {MINIMUM_DEPOSIT} VET to add volunteers
          </p>
        )}
      </div>

      {/* Sponsored Volunteers List */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Sponsored Volunteers ({volunteers.length})
        </h3>
        {volunteers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No volunteers added yet</p>
        ) : (
          <div className="space-y-2">
            {volunteers.map((volunteer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm">{volunteer}</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Withdraw VET
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
            className="flex-1 border rounded-lg px-4 py-2"
            disabled={loading}
            step="0.1"
            max={deposit}
          />
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || parseFloat(deposit) === 0}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Withdraw
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">🎯 How Fee Delegation Works</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Deposit VET:</strong> You deposit VET into the contract to cover gas fees</li>
          <li>• <strong>Add Volunteers:</strong> Add volunteer addresses who will receive free transactions</li>
          <li>• <strong>Automatic Sponsorship:</strong> When volunteers submit proofs, gas fees are paid from your deposit</li>
          <li>• <strong>Credit System:</strong> Each volunteer gets 1000 VTHO credit that recovers over time</li>
          <li>• <strong>Withdraw Anytime:</strong> You can withdraw unused VET at any time</li>
        </ul>
      </div>
    </div>
  );
}

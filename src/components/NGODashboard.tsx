import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'ethers';
import { Plus, MapPin, Users, DollarSign, Zap } from 'lucide-react';
import { getContracts } from '../utils/contracts';
import FeeDelegationPanel from './FeeDelegationPanel';
import { useToast } from '../hooks/useToast';
import { getImageUrl } from '../utils/ipfs';
import { categories } from './CategoryFilter';

interface NGODashboardProps {
  connex: any;
  account: string;
}

interface Opportunity {
  id: bigint;
  title: string;
  description: string;
  rewardAmount: bigint;
  maxVolunteers: bigint;
  currentVolunteers: bigint;
  status: number;
}

interface Submission {
  opportunityId: bigint;
  volunteer: string;
  ipfsHash: string;
  latitude: bigint;
  longitude: bigint;
  timestamp: bigint;
  status: number;
  submittedAt: bigint;
}

export default function NGODashboard({ connex, account }: NGODashboardProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'opportunities' | 'submissions' | 'feeDelegation'>('opportunities');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<Array<{opp: Opportunity, sub: Submission, subIndex: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [feeDelegationAddress, setFeeDelegationAddress] = useState<string>('');

  const [formData, setFormData] = useState({
    title: 'Beach Cleanup - Marina Bay',
    description: 'Join us for a community beach cleanup event at Marina Bay. Help remove plastic waste and protect marine life. All materials provided. Family-friendly event!',
    proofRequirements: 'Take a photo showing collected trash bags with the beach/ocean in background. GPS location must be within 1km of Marina Bay.',
    rewardAmount: '50',
    maxVolunteers: '20',
    latitude: '1.2804',
    longitude: '103.8520',
    radiusMeters: '1000',
    category: 'environmental',
  });

  useEffect(() => {
    loadOpportunities();
    loadPendingSubmissions();
    loadFeeDelegationAddress();
  }, []);

  const loadFeeDelegationAddress = async () => {
    try {
      setFeeDelegationAddress(import.meta.env.VITE_FEE_DELEGATION_ADDRESS || '');
    } catch (error) {
    }
  };

  const loadOpportunities = async () => {
    try {
      const { opportunityContract } = await getContracts(connex, account);
      let allOpps = [];
      try {
        allOpps = await opportunityContract.getAllOpportunities();
      } catch (err) {
      }
      const filtered = allOpps.filter((opp: Opportunity) =>
        opp.id > 0n
      );
      setOpportunities(filtered);
    } catch (error) {
    }
  };

  const loadPendingSubmissions = async () => {
    try {
      const { opportunityContract } = await getContracts(connex, account);
      const allOpps = await opportunityContract.getAllOpportunities();

      const pending: Array<{opp: Opportunity, sub: Submission, subIndex: number}> = [];

      for (const opp of allOpps) {
        if (!opp || !opp.id || opp.id.toString() === '0') continue;

        try {
          const submissions = await opportunityContract.getOpportunitySubmissions(opp.id);

          for (let i = 0; i < submissions.length; i++) {
            const sub = submissions[i];
            // Status 0 = Pending
            if (Number(sub.status) === 0) {
              pending.push({ opp, sub, subIndex: i });
            }
          }
        } catch (err) {
        }
      }

      setPendingSubmissions(pending);
    } catch (error) {
    }
  };

  const handleVerifySubmission = async (oppId: bigint, subIndex: number, approved: boolean) => {
    setLoading(true);
    try {
      const { opportunityContract } = await getContracts(connex, account);

      toast.info(`${approved ? 'Approving' : 'Rejecting'} submission...`);

      const tx = await opportunityContract.verifySubmission(oppId, subIndex, approved);
      await tx.wait();

      toast.success(`Submission ${approved ? 'approved' : 'rejected'} successfully!`);

      // Reload both lists
      await loadPendingSubmissions();
      await loadOpportunities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify submission');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { b3trToken, opportunityContract } = await getContracts(connex, account);

      const rewardAmount = parseEther(formData.rewardAmount);
      const maxVolunteers = BigInt(formData.maxVolunteers);
      const totalRequired = parseEther('100') + (rewardAmount * maxVolunteers);

      const balance = await b3trToken.balanceOf(account);

      if (balance < totalRequired) {
        toast.error(`Insufficient balance. You have ${(Number(balance) / 1e18).toFixed(2)} B3TR but need ${(Number(totalRequired) / 1e18).toFixed(2)} B3TR. Please claim tokens from the faucet first.`);
        setLoading(false);
        return;
      }

      // Use multi-clause transaction (approve + create in one transaction)
      toast.info('Please approve the transaction in VeWorld...');

      // Get contract addresses
      const b3trAddress = b3trToken.getAddress();
      const opportunityAddress = opportunityContract.getAddress();

      // Import ABIs
      const MockB3TRABI = await import('../contracts/MockB3TR.json');
      const OpportunityContractABI = await import('../contracts/OpportunityContract.json');
      const { Interface } = await import('ethers');

      // Create interfaces
      const b3trInterface = new Interface(MockB3TRABI.abi);
      const opportunityInterface = new Interface(OpportunityContractABI.abi);

      // Encode approve function call
      const approveData = b3trInterface.encodeFunctionData('approve', [
        opportunityAddress,
        totalRequired
      ]);

      // Encode createOpportunity function call
      // Prefix title with category for filtering
      const categoryPrefix = `[${formData.category}]`;
      const titleWithCategory = `${categoryPrefix} ${formData.title}`;

      const createData = opportunityInterface.encodeFunctionData('createOpportunity', [
        titleWithCategory,
        formData.description,
        formData.proofRequirements,
        rewardAmount,
        maxVolunteers,
        Math.floor(parseFloat(formData.latitude) * 1e6),
        Math.floor(parseFloat(formData.longitude) * 1e6),
        BigInt(formData.radiusMeters)
      ]);

      // Create multi-clause transaction
      const clauses = [
        {
          to: b3trAddress,
          value: '0x0',
          data: approveData
        },
        {
          to: opportunityAddress,
          value: '0x0',
          data: createData
        }
      ];

      // Send as single transaction with multiple clauses
      const response = await connex.vendor
        .sign('tx', clauses)
        .signer(account)
        .gas(800000) // Increased gas limit for multi-clause transaction
        .request();

      if (!response || !response.txid) {
        throw new Error('Transaction was rejected or cancelled');
      }

      // Wait for transaction confirmation
      toast.info('Waiting for transaction confirmation...');
      let attempts = 0;
      const maxAttempts = 30;
      let receipt = null;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          receipt = await connex.thor.transaction(response.txid).getReceipt();
          if (receipt) {
            if (receipt.reverted) {
              throw new Error('Transaction reverted on chain');
            }
            break;
          }
        } catch (err) {
          // Still waiting
        }
        attempts++;
      }

      if (!receipt) {
        throw new Error('Transaction timeout - please check VeChain explorer');
      }

      toast.success('Opportunity created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        proofRequirements: '',
        rewardAmount: '',
        maxVolunteers: '',
        latitude: '',
        longitude: '',
        radiusMeters: '1000',
        category: 'environmental',
      });
      loadOpportunities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">NGO Dashboard</h2>
            <p className="text-gray-600 mt-1">Create and manage environmental opportunities</p>
          </div>
          {activeTab === 'opportunities' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Opportunity
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'opportunities'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Opportunities
            </div>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'submissions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pending Submissions
              {pendingSubmissions.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingSubmissions.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('feeDelegation')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'feeDelegation'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Fee Delegation
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">NEW</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feeDelegation' && feeDelegationAddress && (
        <FeeDelegationPanel
          connex={connex}
          account={account}
          feeDelegationAddress={feeDelegationAddress}
        />
      )}

      {activeTab === 'opportunities' && showCreateForm && (
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">New Opportunity</h3>
          <form onSubmit={handleCreateOpportunity} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Beach Cleanup Initiative"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reward Amount (B3TR per volunteer)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rewardAmount}
                  onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Volunteers
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxVolunteers}
                  onChange={(e) => setFormData({ ...formData, maxVolunteers: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Help us clean Miami Beach this weekend..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proof Requirements
              </label>
              <textarea
                required
                rows={3}
                value={formData.proofRequirements}
                onChange={(e) => setFormData({ ...formData, proofRequirements: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Photo showing before/after, GPS location within beach area"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="25.7617"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="-80.1918"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                Required stake: <span className="font-bold">100 B3TR</span> +
                <span className="font-bold"> {formData.rewardAmount || '0'}</span> ×
                <span className="font-bold"> {formData.maxVolunteers || '0'}</span> =
                <span className="text-green-600 font-bold text-lg ml-2">
                  {formData.rewardAmount && formData.maxVolunteers
                    ? (100 + parseFloat(formData.rewardAmount) * parseInt(formData.maxVolunteers)).toFixed(2)
                    : '100'} B3TR
                </span>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
          <div
            key={opp.id.toString()}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{opp.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                Number(opp.status) === 0 ? 'bg-green-100 text-green-800' :
                Number(opp.status) === 1 ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {Number(opp.status) === 0 ? 'Active' : Number(opp.status) === 1 ? 'Completed' : 'Cancelled'}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{opp.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-700">
                <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                <span className="font-semibold">{formatEther(opp.rewardAmount)} B3TR</span> per volunteer
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="h-4 w-4 mr-2 text-green-600" />
                {opp.currentVolunteers.toString()} / {opp.maxVolunteers.toString()} volunteers
              </div>
            </div>

            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(Number(opp.currentVolunteers) / Number(opp.maxVolunteers)) * 100}%`,
                }}
              />
            </div>
          </div>
          ))}

          {opportunities.length === 0 && !showCreateForm && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg col-span-2">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Opportunities Yet</h3>
              <p className="text-gray-600 mb-6">Create your first environmental opportunity to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Opportunity
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="grid md:grid-cols-2 gap-6">
          {pendingSubmissions.map(({ opp, sub, subIndex }) => (
            <div
              key={`${opp.id}-${subIndex}`}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{opp.title}</h3>
                <p className="text-sm text-gray-600">Opportunity #{opp.id.toString()}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Volunteer:</p>
                  <p className="text-sm text-gray-600 font-mono">{sub.volunteer.slice(0, 10)}...{sub.volunteer.slice(-8)}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Location:</p>
                  <p className="text-sm text-gray-600">
                    {(Number(sub.latitude) / 1e6).toFixed(6)}, {(Number(sub.longitude) / 1e6).toFixed(6)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Photo Proof:</p>
                  <img
                    src={getImageUrl(sub.ipfsHash)}
                    alt="Proof"
                    className="w-full h-48 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <a
                    href={getImageUrl(sub.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 text-sm underline"
                  >
                    View Full Size →
                  </a>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(Number(sub.submittedAt) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleVerifySubmission(opp.id, subIndex, true)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleVerifySubmission(opp.id, subIndex, false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}

          {pendingSubmissions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg col-span-2">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Submissions</h3>
              <p className="text-gray-600">All submissions have been verified</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { MapPin, Upload, Award, DollarSign, Camera, CheckCircle, Clock } from 'lucide-react';
import { getContracts } from '../utils/contracts';
import { uploadToIPFS } from '../utils/ipfs';
import Leaderboard from './Leaderboard';
import CategoryFilter from './CategoryFilter';
import AchievementBadges from './AchievementBadges';
import { useToast } from '../hooks/useToast';

interface VolunteerDashboardProps {
  connex: any;
  account: string;
}

interface Opportunity {
  id: bigint;
  ngo: string;
  title: string;
  description: string;
  proofRequirements: string;
  rewardAmount: bigint;
  maxVolunteers: bigint;
  currentVolunteers: bigint;
  status: number;
  latitude: bigint;
  longitude: bigint;
}

export default function VolunteerDashboard({ connex, account }: VolunteerDashboardProps) {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [impactScore, setImpactScore] = useState<string>('0');

  const [gpsData, setGpsData] = useState({
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadOpportunities();
    loadImpactScore();
  }, []);

  useEffect(() => {
    // Filter opportunities by category
    if (selectedCategory === 'all') {
      setFilteredOpportunities(opportunities);
    } else {
      // Filter based on category prefix in title
      const filtered = opportunities.filter((opp) => {
        const categoryMatch = opp.title.match(/^\[([^\]]+)\]/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          return category === selectedCategory;
        }
        return false;
      });
      setFilteredOpportunities(filtered);
    }
  }, [selectedCategory, opportunities]);

  const loadOpportunities = async () => {
    try {
      const { opportunityContract } = await getContracts(connex, account);
      let allOpps = [];
      try {
        allOpps = await opportunityContract.getAllOpportunities();
      } catch (err) {
      }
      const active = allOpps.filter((opp: Opportunity) => Number(opp.status) === 0 && opp.id > 0n);
      setOpportunities(active);
    } catch (error) {
    }
  };

  const loadImpactScore = async () => {
    try {
      const { reputationNFT } = await getContracts(connex, account);
      const score = await reputationNFT.getImpactScore(account);
      setImpactScore(score.toString());
    } catch (error) {
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsData({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          toast.warning('Please enable location services');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedOpp) return;

    setLoading(true);
    try {
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(selectedFile);

      // Submit to blockchain
      const { opportunityContract } = await getContracts(connex, account);

      const tx = await (opportunityContract as any).submitProof(
        selectedOpp.id,
        ipfsHash,
        Math.floor(parseFloat(gpsData.latitude) * 1e6),
        Math.floor(parseFloat(gpsData.longitude) * 1e6)
      );
      await tx.wait();

      toast.success('Proof submitted successfully! Waiting for AI verification...');
      setShowSubmitModal(false);
      setSelectedOpp(null);
      setSelectedFile(null);
      setPreviewUrl('');
      setGpsData({ latitude: '', longitude: '' });
      loadOpportunities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setShowSubmitModal(true);
    getCurrentLocation();
  };

  return (
    <div className="space-y-8">
      {/* Leaderboard */}
      <Leaderboard connex={connex} account={account} />

      {/* Achievement Badges */}
      <AchievementBadges
        impactScore={parseFloat(impactScore)}
        opportunitiesCompleted={filteredOpportunities.length}
        b3trEarned={0}
      />

      {/* Category Filter */}
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Volunteer Dashboard</h2>
              <p className="text-primary-100">Browse opportunities and submit verified proof</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                <Award className="h-6 w-6 mr-2" />
                <span className="text-sm font-medium">Impact Score</span>
              </div>
              <div className="text-5xl font-bold">{impactScore}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Opportunities</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id.toString()}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
              <p className="text-gray-700 text-sm line-clamp-2">{opp.description}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-primary-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-2xl font-bold">{formatEther(opp.rewardAmount)}</span>
                  <span className="text-sm ml-1">B3TR</span>
                </div>
                <div className="text-sm text-gray-600">
                  {opp.currentVolunteers.toString()}/{opp.maxVolunteers.toString()} spots
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700">{opp.proofRequirements}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                <span>
                  {(Number(opp.latitude) / 1e6).toFixed(4)}, {(Number(opp.longitude) / 1e6).toFixed(4)}
                </span>
              </div>

              <button
                onClick={() => openSubmitModal(opp)}
                disabled={Number(opp.currentVolunteers) >= Number(opp.maxVolunteers)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="mr-2 h-5 w-5" />
                Submit Proof
              </button>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Opportunities</h3>
          <p className="text-gray-600">Check back soon for new environmental missions</p>
        </div>
      )}

      {/* Submit Proof Modal */}
      {showSubmitModal && selectedOpp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <h3 className="text-2xl font-bold">{selectedOpp.title}</h3>
              <p className="text-primary-100 mt-1">Submit your proof of impact</p>
            </div>

            <form onSubmit={handleSubmitProof} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Proof Requirements
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">{selectedOpp.proofRequirements}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Photo Evidence
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-44 rounded" />
                    ) : (
                      <>
                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={gpsData.latitude}
                    onChange={(e) => setGpsData({ ...gpsData, latitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={gpsData.longitude}
                    onChange={(e) => setGpsData({ ...gpsData, longitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </button>

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedOpp(null);
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : `Submit & Earn ${formatEther(selectedOpp.rewardAmount)} B3TR`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

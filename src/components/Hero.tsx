import { Leaf, Shield, Award, TrendingUp, Zap } from 'lucide-react';

interface HeroProps {
  onConnect: () => void;
}

export default function Hero({ onConnect }: HeroProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Leaf className="h-16 w-16 text-white animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Proof<span className="text-primary-200">Of</span>Impact
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Blockchain-verified environmental action. Earn B3TR rewards for making the world greener.
            </p>
            <button
              onClick={onConnect}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-900 bg-white rounded-full overflow-hidden transition-all hover:shadow-2xl hover:scale-105"
            >
              <span className="relative flex items-center">
                <Shield className="mr-2 h-6 w-6" />
                Connect VeWorld Wallet
                <Zap className="ml-2 h-5 w-5 group-hover:animate-pulse" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Trustless verification. Real impact. Instant rewards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-blue-50 to-green-100 rounded-2xl p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">NGOs Post Opportunities</h3>
              <p className="text-gray-700">
                Organizations stake B3TR tokens and create verified environmental missions with clear proof requirements and rewards.
              </p>
            </div>

            <div className="group relative bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Volunteers Take Action</h3>
              <p className="text-gray-700">
                Complete environmental work, upload proof to IPFS, and submit GPS-verified evidence to smart contracts.
              </p>
            </div>

            <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-white">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Verifies & Pays</h3>
              <p className="text-gray-700">
                Oracle nodes run AI verification on submissions. Approved work triggers instant B3TR payments and reputation NFT updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">On-Chain</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-600">Trust Needed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">Instant</div>
              <div className="text-gray-600">Payments</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">NFT</div>
              <div className="text-gray-600">Reputation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

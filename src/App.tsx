import { useState, useEffect } from 'react';
import { Leaf, Wallet, Users, Award, MapPin, Plus, Droplet, TrendingUp, Vote, LogOut, ArrowLeft, Menu } from 'lucide-react';
import { useWallet } from '@vechain/vechain-kit';

import NGODashboard from './components/NGODashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import Faucet from './components/Faucet';
import Staking from './components/Staking';
import GovernanceDashboard from './components/GovernanceDashboard';
import LandingPage from './components/LandingPage';
import Statistics from './components/Statistics';
import { ToastProvider } from './hooks/useToast';

type PageType = 'select' | 'ngo' | 'volunteer' | 'faucet' | 'staking' | 'governance';

function App() {
  const { account, disconnect } = useWallet();
  const [currentPage, setCurrentPage] = useState<PageType>('select');
  const [connex, setConnex] = useState<any>(null);

  const handleDisconnect = () => {
    disconnect();
    setCurrentPage('select');
  };

  useEffect(() => {
    // Get connex from VeWorld extension
    const initConnex = async () => {
      if (window.vechain && typeof (window.vechain as any).newConnex === 'function') {
        try {
          // Create connex instance using VeWorld's newConnex function with proper options
          const connexInstance = await (window.vechain as any).newConnex({
            node: 'https://testnet.vechain.org/',
            network: 'test'
          });
          setConnex(connexInstance);
        } catch (error) {
        }
      }
    };

    initConnex();
  }, []);

  if (!account || !account.address) {
    return (
      <ToastProvider>
        <LandingPage onGetStarted={() => {}} />
      </ToastProvider>
    );
  }

  if (currentPage === 'select') {
    return (
      <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-purple-700 relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
          <div className="max-w-6xl w-full">
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl shadow-2xl">
                  <Leaf className="h-16 w-16 text-white animate-bounce" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                Welcome to ProofOfImpact
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-3 font-medium">
                Blockchain-Verified Environmental Action
              </p>
              <div className="inline-flex items-center gap-3">
                <div className="flex items-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-lg">
                  <Wallet className="h-5 w-5 text-white mr-2" />
                  <span className="text-white font-semibold">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center bg-red-500/20 backdrop-blur-md px-4 py-3 rounded-full border border-red-300/30 shadow-lg hover:bg-red-500/30 transition-all"
                  title="Disconnect Wallet"
                >
                  <LogOut className="h-5 w-5 text-white mr-2" />
                  <span className="text-white font-semibold">Disconnect</span>
                </button>
              </div>
              <p className="text-lg text-white/80 mt-6 max-w-2xl mx-auto">
                Choose your path to make an environmental impact and earn B3TR rewards
              </p>
            </div>

            {/* Live Statistics */}
            {connex && <Statistics connex={connex} account={account.address} />}

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <button
                onClick={() => setCurrentPage('ngo')}
                className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-white/50 p-8 text-left transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)] hover:-translate-y-2 hover:border-blue-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-500">
                    <Users className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">NGO Dashboard</h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Create verified environmental opportunities and engage volunteers
                  </p>
                  <div className="flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                    Get Started
                    <Plus className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('volunteer')}
                className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-white/50 p-8 text-left transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_60px_rgba(34,197,94,0.5)] hover:-translate-y-2 hover:border-green-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all duration-500">
                    <Award className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Volunteer</h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Complete eco-missions and earn B3TR rewards instantly
                  </p>
                  <div className="flex items-center text-green-600 font-bold group-hover:gap-2 transition-all">
                    Browse Missions
                    <MapPin className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('faucet')}
                className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-white/50 p-8 text-left transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_60px_rgba(6,182,212,0.5)] hover:-translate-y-2 hover:border-cyan-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-500">
                    <Droplet className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">Faucet</h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Claim 10,000 free B3TR tokens every hour
                  </p>
                  <div className="flex items-center text-cyan-600 font-bold group-hover:gap-2 transition-all">
                    Claim Tokens
                    <Droplet className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('staking')}
                className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-white/50 p-8 text-left transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_60px_rgba(168,85,247,0.5)] hover:-translate-y-2 hover:border-purple-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-500">
                    <TrendingUp className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Staking</h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Stake B3TR tokens and earn 10% APY rewards
                  </p>
                  <div className="flex items-center text-purple-600 font-bold group-hover:gap-2 transition-all">
                    Stake Now
                    <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('governance')}
                className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-white/50 p-8 text-left transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)] hover:-translate-y-2 hover:border-indigo-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 shadow-lg group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-500">
                    <Vote className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Governance</h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Create proposals and vote on platform decisions
                  </p>
                  <div className="flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
                    Participate
                    <Vote className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">ProofOfImpact</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('select')}
                className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <Menu className="h-5 w-5" />
                <span>Menu</span>
              </button>
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <Wallet className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors border border-red-200"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'ngo' && connex && <NGODashboard connex={connex} account={account.address} />}
        {currentPage === 'volunteer' && connex && <VolunteerDashboard connex={connex} account={account.address} />}
        {currentPage === 'faucet' && connex && <Faucet connex={connex} account={account.address} />}
        {currentPage === 'staking' && connex && <Staking connex={connex} account={account.address} />}
        {currentPage === 'governance' && connex && <GovernanceDashboard connex={connex} account={account.address} />}
        {!connex && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">VeWorld Extension Required</h3>
              <p className="text-yellow-700 mb-4">
                To use this dApp, please install the VeWorld browser extension and connect your wallet.
              </p>
              <a
                href="https://www.veworld.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Get VeWorld Extension
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
    </ToastProvider>
  );
}

export default App;

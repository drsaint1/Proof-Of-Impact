import { useState, useEffect } from 'react';
import { Leaf, Users, Award, TrendingUp, MapPin, Shield, Zap, Globe } from 'lucide-react';
import { useConnectModal } from '@vechain/vechain-kit';
import ShareButtons from './ShareButtons';
import { getContracts } from '../utils/contracts';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { open: openConnectModal } = useConnectModal();
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    b3trDistributed: 0,
    opportunities: 0,
    countries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealStats = async () => {
      try {
        // Get connex from window
        if (!window.vechain || typeof window.vechain.newConnex !== 'function') {
          setLoading(false);
          return;
        }

        const connex = await window.vechain.newConnex({
          node: 'https://testnet.vechain.org/',
          network: 'test'
        });

        const { opportunityContract } = await getContracts(connex, '0x0000000000000000000000000000000000000000');

        // Get all opportunities
        let opportunities = [];
        try {
          opportunities = await opportunityContract.getAllOpportunities();
        } catch (err) {
        }

        const validOpps = opportunities.filter((opp: any) => opp && opp.id && Number(opp.id) > 0);

        // Count volunteers and rewards
        let totalVolunteers = 0;
        let totalRewards = 0n;
        const countriesSet = new Set<string>();

        for (const opp of validOpps) {
          const currentVols = Number(opp.currentVolunteers || 0);
          const rewardAmt = opp.rewardAmount ? BigInt(opp.rewardAmount) : 0n;

          totalVolunteers += currentVols;
          if (currentVols > 0 && rewardAmt > 0n) {
            totalRewards += rewardAmt * BigInt(currentVols);
          }

          // Extract country from location if available
          if (opp.location) {
            const parts = opp.location.split(',');
            if (parts.length > 0) {
              countriesSet.add(parts[parts.length - 1].trim());
            }
          }
        }

        setStats({
          totalVolunteers,
          b3trDistributed: Number(totalRewards / BigInt(1e18)),
          opportunities: validOpps.length,
          countries: countriesSet.size > 0 ? countriesSet.size : 1,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    loadRealStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-green-600 to-purple-700 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-lg p-5 rounded-3xl shadow-2xl">
                <Leaf className="h-20 w-20 text-white animate-bounce" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
              ProofOfImpact
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 mb-4 font-semibold">
              Blockchain-Verified Environmental Action
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              Turn your environmental efforts into verifiable impact. Earn B3TR rewards for proven volunteer work,
              powered by AI verification and VeChain blockchain.
            </p>
            <button
              onClick={openConnectModal}
              className="px-12 py-5 bg-white text-primary-600 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 hover:shadow-white/20"
            >
              Connect Wallet
            </button>
          </div>

          {/* Live Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <Users className="h-10 w-10 text-white mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-1">
                {stats.totalVolunteers.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Volunteers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <Award className="h-10 w-10 text-white mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-1">
                {stats.b3trDistributed.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">B3TR Distributed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <MapPin className="h-10 w-10 text-white mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-1">
                {stats.opportunities.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Opportunities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <Globe className="h-10 w-10 text-white mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-1">
                {stats.countries}
              </div>
              <div className="text-white/80 text-sm">Countries</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="bg-green-500/30 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Browse Opportunities</h3>
                <p className="text-white/80 leading-relaxed">
                  Discover verified environmental missions posted by NGOs. Choose opportunities that match
                  your location, interests, and available time.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="bg-green-500/30 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Complete & Submit</h3>
                <p className="text-white/80 leading-relaxed">
                  Complete the volunteer work and submit proof with photos and GPS location.
                  Our AI oracle automatically verifies your submission.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="bg-yellow-500/30 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn Rewards</h3>
                <p className="text-white/80 leading-relaxed">
                  Receive instant B3TR rewards to your wallet upon verification. Build your
                  on-chain reputation with soulbound NFTs.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Why ProofOfImpact?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-start">
                  <div className="bg-green-500/30 rounded-xl p-3 mr-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Instant Verification</h3>
                    <p className="text-white/80 text-sm">
                      AI-powered oracle verifies your proof in minutes, not days. Get rewarded instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-start">
                  <div className="bg-green-500/30 rounded-xl p-3 mr-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Trustless & Transparent</h3>
                    <p className="text-white/80 text-sm">
                      Smart contracts hold rewards in escrow. No intermediaries, no payment delays.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-start">
                  <div className="bg-purple-500/30 rounded-xl p-3 mr-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Portable Reputation</h3>
                    <p className="text-white/80 text-sm">
                      Soulbound NFTs create permanent proof of your impact. Show it to employers, schools, anyone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-start">
                  <div className="bg-yellow-500/30 rounded-xl p-3 mr-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Earn While Helping</h3>
                    <p className="text-white/80 text-sm">
                      Get paid in B3TR tokens for verified work. Stack rewards, stake for APY, or convert to cash.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Make an Impact?</h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of volunteers earning rewards for verified environmental action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={openConnectModal}
                  className="px-10 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
                >
                  Start Volunteering
                </button>
                <button
                  onClick={openConnectModal}
                  className="px-10 py-4 bg-primary-500/30 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-primary-500/40 transition-all border border-white/30"
                >
                  Post Opportunity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 py-8 mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <p className="text-white/90 font-semibold mb-4">Share ProofOfImpact</p>
              <div className="flex justify-center">
                <ShareButtons
                  title="ProofOfImpact - Blockchain-Verified Environmental Action"
                  description="Earn B3TR rewards for verified volunteer work. Powered by VeChain and AI oracles."
                  url="https://proofofimpact.xyz"
                />
              </div>
            </div>
            <div className="text-center text-white/70 text-sm">
              <p>Powered by VeChain · Built with B3TR · Verified by AI</p>
              <p className="mt-2">© 2024 ProofOfImpact. Making environmental action verifiable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

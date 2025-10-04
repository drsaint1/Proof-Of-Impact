import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { getContracts } from '../utils/contracts';

interface LeaderboardProps {
  connex: any;
  account: string;
}

interface LeaderEntry {
  address: string;
  impactScore: number;
  opportunities: number;
  b3trEarned: string;
  rank: number;
}

export default function Leaderboard({ connex, account }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { opportunityContract, reputationNFT } = await getContracts(connex, account);

      // Get all opportunities and their submissions
      let allOpps = [];
      try {
        allOpps = await opportunityContract.getAllOpportunities();
      } catch (err) {
      }
      const volunteerStats: Record<string, { opportunities: number; b3trEarned: bigint; impactScore: number }> = {};

      for (const opp of allOpps) {
        if (!opp || !opp.id) continue;

        try {
          const submissions = await opportunityContract.getOpportunitySubmissions(opp.id);

          for (const sub of submissions) {
            if (sub && sub.status === 1) { // Verified status
              const volunteer = sub.volunteer.toLowerCase();

              if (!volunteerStats[volunteer]) {
                volunteerStats[volunteer] = {
                  opportunities: 0,
                  b3trEarned: 0n,
                  impactScore: 0
                };
              }

              volunteerStats[volunteer].opportunities += 1;
              volunteerStats[volunteer].b3trEarned += BigInt(opp.rewardAmount || 0);

              // Get impact score from NFT
              try {
                const score = await reputationNFT.getImpactScore(sub.volunteer);
                volunteerStats[volunteer].impactScore = Number(score);
              } catch (err) {
                volunteerStats[volunteer].impactScore += 100;
              }
            }
          }
        } catch (err) {
        }
      }

      // Convert to array and sort by impact score
      const leaderArray: LeaderEntry[] = Object.entries(volunteerStats)
        .map(([address, stats]) => ({
          address,
          impactScore: stats.impactScore,
          opportunities: stats.opportunities,
          b3trEarned: formatEther(stats.b3trEarned),
          rank: 0
        }))
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 10) // Top 10
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      setLeaders(leaderArray);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-400" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">Top Volunteers</h2>
          </div>
          <div className="flex items-center text-white/90 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Live Rankings</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-200">
        {leaders.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No volunteers yet</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to complete an opportunity!</p>
          </div>
        ) : (
          leaders.map((leader, index) => {
          const isCurrentUser = leader.address.toLowerCase() === account.toLowerCase();

          return (
            <div
              key={leader.address}
              className={`p-6 transition-all ${isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center">
                {/* Rank */}
                <div className="flex-shrink-0 w-20">
                  <div className={`w-12 h-12 rounded-full ${getRankBg(leader.rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {leader.rank <= 3 ? (
                      getRankIcon(leader.rank)
                    ) : (
                      leader.rank
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center">
                    <span className={`font-mono text-sm ${isCurrentUser ? 'text-primary-700 font-bold' : 'text-gray-900'
                      }`}>
                      {leader.address.slice(0, 6)}...{leader.address.slice(-4)}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-lg">{leader.impactScore}</div>
                    <div className="text-gray-600 text-xs">Impact</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-lg">{leader.opportunities}</div>
                    <div className="text-gray-600 text-xs">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary-600 text-lg">{leader.b3trEarned}</div>
                    <div className="text-gray-600 text-xs">B3TR Earned</div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="sm:hidden flex flex-col items-end text-xs">
                  <div className="font-bold text-primary-600">{leader.b3trEarned} B3TR</div>
                  <div className="text-gray-600">{leader.opportunities} missions</div>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Footer */}
      {leaders.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-600">
          Rankings based on verified submissions and impact scores
        </div>
      )}
    </div>
  );
}

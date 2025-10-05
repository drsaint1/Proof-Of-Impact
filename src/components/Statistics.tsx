import { useState, useEffect } from 'react';
import { Users, Award, MapPin, TrendingUp } from 'lucide-react';
import { getContracts } from '../utils/contracts';

interface StatisticsProps {
  connex: any;
  account: string;
}

export default function Statistics({ connex, account }: StatisticsProps) {
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    totalVolunteers: 0,
    totalRewardsDistributed: '0',
    stakingTVL: '0',
  });

  useEffect(() => {
    if (!connex) return;

    let cancelled = false;

    const loadStatistics = async () => {
      try {
        const { opportunityContract, stakingPool } = await getContracts(connex, account);

        // Get total opportunities
        let opportunities = [];
        try {
          opportunities = await opportunityContract.getAllOpportunities();
        } catch (err) {
        }
        if (cancelled) return;

        const validOpps = opportunities.filter((opp: any) => {
          return opp && opp.id && Number(opp.id) > 0;
        });
        let totalVolunteers = 0;
        let totalRewards = 0n;

        for (const opp of validOpps) {
          const currentVols = Number(opp.currentVolunteers || 0);
          const rewardAmt = opp.rewardAmount ? BigInt(opp.rewardAmount) : 0n;

          totalVolunteers += currentVols;
          if (currentVols > 0 && rewardAmt > 0n) {
            totalRewards += rewardAmt * BigInt(currentVols);
          }
        }
        let tvl = 0n;
        try {
          tvl = await stakingPool.totalStaked();
        } catch (err) {
        }

        if (!cancelled) {
          const newStats = {
            totalOpportunities: validOpps.length,
            totalVolunteers,
            totalRewardsDistributed: (Number(totalRewards) / 1e18).toFixed(0),
            stakingTVL: (Number(tvl) / 1e18).toFixed(0),
          };
          setStats(newStats);
        }
      } catch (error) {
        if (!cancelled) {
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [connex, account]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <MapPin className="h-8 w-8 opacity-80" />
          <TrendingUp className="h-5 w-5 opacity-60" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.totalOpportunities}</div>
        <div className="text-sm opacity-90">Active Opportunities</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Users className="h-8 w-8 opacity-80" />
          <TrendingUp className="h-5 w-5 opacity-60" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.totalVolunteers}</div>
        <div className="text-sm opacity-90">Total Volunteers</div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Award className="h-8 w-8 opacity-80" />
          <TrendingUp className="h-5 w-5 opacity-60" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.totalRewardsDistributed}</div>
        <div className="text-sm opacity-90">B3TR Distributed</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="h-8 w-8 opacity-80" />
          <div className="text-xs opacity-60 font-semibold">TVL</div>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.stakingTVL}</div>
        <div className="text-sm opacity-90">B3TR Staked</div>
      </div>
    </div>
  );
}

import { Award, Zap, Flame, Trophy, Star, Crown } from 'lucide-react';

interface AchievementBadgesProps {
  impactScore: number;
  opportunitiesCompleted: number;
  b3trEarned: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  requirement: number;
  type: 'score' | 'count' | 'earnings';
  unlocked: boolean;
}

export default function AchievementBadges({ impactScore, opportunitiesCompleted, b3trEarned }: AchievementBadgesProps) {
  const badges: Badge[] = [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Complete your first opportunity',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      requirement: 1,
      type: 'count',
      unlocked: opportunitiesCompleted >= 1
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      description: 'Earn 100+ impact score',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      requirement: 100,
      type: 'score',
      unlocked: impactScore >= 100
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Complete 5 opportunities',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      requirement: 5,
      type: 'count',
      unlocked: opportunitiesCompleted >= 5
    },
    {
      id: 'high_achiever',
      name: 'High Achiever',
      description: 'Earn 500+ impact score',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      requirement: 500,
      type: 'score',
      unlocked: impactScore >= 500
    },
    {
      id: 'veteran',
      name: 'Veteran',
      description: 'Complete 10 opportunities',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      requirement: 10,
      type: 'count',
      unlocked: opportunitiesCompleted >= 10
    },
    {
      id: 'legend',
      name: 'Legend',
      description: 'Earn 1000+ impact score',
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      requirement: 1000,
      type: 'score',
      unlocked: impactScore >= 1000
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Achievement Badges</h2>
        <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
          {unlockedCount}/{badges.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                badge.unlocked
                  ? 'border-gray-300 bg-white hover:shadow-lg'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              {badge.unlocked && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <Award className="h-4 w-4" />
                </div>
              )}

              <div className={`${badge.bgColor} rounded-full p-4 inline-flex mb-3 ${badge.unlocked ? '' : 'grayscale'}`}>
                <Icon className={`h-8 w-8 ${badge.unlocked ? badge.color : 'text-gray-400'}`} />
              </div>

              <h3 className={`font-bold mb-1 ${badge.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {badge.name}
              </h3>
              <p className="text-xs text-gray-600 mb-2">{badge.description}</p>

              {!badge.unlocked && (
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          badge.type === 'score'
                            ? (impactScore / badge.requirement) * 100
                            : badge.type === 'count'
                            ? (opportunitiesCompleted / badge.requirement) * 100
                            : (b3trEarned / badge.requirement) * 100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold">
                    {badge.type === 'score'
                      ? impactScore
                      : badge.type === 'count'
                      ? opportunitiesCompleted
                      : b3trEarned}
                    /{badge.requirement}
                  </span>
                </div>
              )}

              {badge.unlocked && (
                <div className="text-xs font-semibold text-green-600 flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Unlocked!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unlockedCount === badges.length && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Master Volunteer!</h3>
          <p className="text-gray-700">
            You've unlocked all achievement badges! You're a true environmental champion.
          </p>
        </div>
      )}
    </div>
  );
}

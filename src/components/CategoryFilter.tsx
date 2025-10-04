import { Leaf, GraduationCap, Heart, Droplet, TreePine, Users } from 'lucide-react';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Categories', icon: Users, color: 'gray' },
  { id: 'environmental', name: 'Environmental', icon: Leaf, color: 'green' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'blue' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'red' },
  { id: 'water', name: 'Clean Water', icon: Droplet, color: 'cyan' },
  { id: 'forest', name: 'Reforestation', icon: TreePine, color: 'emerald' },
];

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, any> = {
      gray: {
        border: isSelected ? 'border-gray-600' : 'border-gray-300',
        bg: isSelected ? 'bg-gray-100' : 'bg-white',
        iconBg: isSelected ? 'bg-gray-600' : 'bg-gray-200',
        iconText: isSelected ? 'text-white' : 'text-gray-600',
        text: isSelected ? 'text-gray-900' : 'text-gray-600',
      },
      green: {
        border: isSelected ? 'border-green-600' : 'border-gray-300',
        bg: isSelected ? 'bg-green-100' : 'bg-white',
        iconBg: isSelected ? 'bg-green-600' : 'bg-green-200',
        iconText: isSelected ? 'text-white' : 'text-green-700',
        text: isSelected ? 'text-green-900' : 'text-gray-600',
      },
      blue: {
        border: isSelected ? 'border-blue-600' : 'border-gray-300',
        bg: isSelected ? 'bg-blue-100' : 'bg-white',
        iconBg: isSelected ? 'bg-blue-600' : 'bg-blue-200',
        iconText: isSelected ? 'text-white' : 'text-blue-700',
        text: isSelected ? 'text-blue-900' : 'text-gray-600',
      },
      red: {
        border: isSelected ? 'border-red-600' : 'border-gray-300',
        bg: isSelected ? 'bg-red-100' : 'bg-white',
        iconBg: isSelected ? 'bg-red-600' : 'bg-red-200',
        iconText: isSelected ? 'text-white' : 'text-red-700',
        text: isSelected ? 'text-red-900' : 'text-gray-600',
      },
      cyan: {
        border: isSelected ? 'border-cyan-600' : 'border-gray-300',
        bg: isSelected ? 'bg-cyan-100' : 'bg-white',
        iconBg: isSelected ? 'bg-cyan-600' : 'bg-cyan-200',
        iconText: isSelected ? 'text-white' : 'text-cyan-700',
        text: isSelected ? 'text-cyan-900' : 'text-gray-600',
      },
      emerald: {
        border: isSelected ? 'border-emerald-600' : 'border-gray-300',
        bg: isSelected ? 'bg-emerald-100' : 'bg-white',
        iconBg: isSelected ? 'bg-emerald-600' : 'bg-emerald-200',
        iconText: isSelected ? 'text-white' : 'text-emerald-700',
        text: isSelected ? 'text-emerald-900' : 'text-gray-600',
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;
          const colorClasses = getColorClasses(category.color, isSelected);

          return (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg ${
                colorClasses.border
              } ${colorClasses.bg} ${
                isSelected ? 'shadow-lg scale-105' : 'hover:border-gray-400'
              }`}
            >
              <div
                className={`p-3 rounded-full mb-2 transition-all ${colorClasses.iconBg} ${colorClasses.iconText}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-semibold text-center ${colorClasses.text}`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { categories };

import type { HomeStatsProps } from '../../../types';

export const HomeStats = ({ stats }: HomeStatsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 w-full mb-8">
      {stats.map((stat) => (
        <div 
          key={stat.id} 
          className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
        >
          <span className="text-2xl md:text-3xl font-black text-gray-800 mb-1">
            {stat.value}
          </span>
          <span className="text-gray-400 text-[11px] font-bold">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;

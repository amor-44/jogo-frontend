import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { StatItem, PlayerCardDto } from '../../types';
import { playerService } from '../../services/playerService';
import HomeStats from './components/HomeStats';
import HomeSuggestedTable from './components/HomeSuggestedTable';

const DEFAULT_STATS: StatItem[] = [
  { id: 1, value: "99", label: "اللاعبون المشاهدون" },
  { id: 2, value: "20", label: "اللاعبون المقترحون" },
  { id: 3, value: "10", label: "اللاعبون المحفوظون" },
  { id: 4, value: "30", label: "إجمالي التعاقدات" },
  { id: 5, value: "247", label: "الزيارات الحالية" },
];

const Home = () => {
  const { user } = useAuth();
  const [suggestedPlayers, setSuggestedPlayers] = useState<PlayerCardDto[]>([]);

  useEffect(() => {
    playerService.getAllPlayers({ page: 1, pageSize: 5 })
      .then(res => {
        setSuggestedPlayers(res.items);
      })
      .catch(err => console.error("Error fetching suggested players:", err));
  }, []);

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-10 font-sans" dir="rtl">
      <div className="text-center mb-6 md:mb-10 pt-4">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1C2C5E] mb-2">
          مرحباً <span className="text-[#2B43A1]">{user?.name || 'نادي الاتحاد'}</span> 👋
        </h1>
        <p className="text-gray-400 text-xs font-medium">
          {currentDate} — إليك آخر ما يدور في المنصة
        </p>
      </div>

      <HomeStats stats={DEFAULT_STATS} />

      <HomeSuggestedTable players={suggestedPlayers} />
    </div>
  );
};

export default Home;

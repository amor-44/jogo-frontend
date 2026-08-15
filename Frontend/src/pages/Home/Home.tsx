import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { StatItem, PlayerCardDto } from '../../types';
import { playerService } from '../../services/playerService';
import HomeStats from './components/HomeStats';
import HomeSuggestedTable from './components/HomeSuggestedTable';

const Home = () => {
  const { user, playerProfile, savedPlayerIds } = useAuth();
  const [suggestedPlayers, setSuggestedPlayers] = useState<PlayerCardDto[]>([]);
  const [totalPlayersCount, setTotalPlayersCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    playerService.getAllPlayers({ page: 1, pageSize: 10 })
      .then(res => {
        if (isMounted && res) {
          setSuggestedPlayers(res.items || []);
          setTotalPlayersCount(res.totalCount || res.items?.length || 0);
        }
      })
      .catch(err => console.error("Error fetching suggested players:", err));

    return () => { isMounted = false; };
  }, []);

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const displayName = playerProfile?.fullName || user?.name || user?.email || 'في منصة Jogo';

  const dynamicStats: StatItem[] = [
    { id: 1, value: String(totalPlayersCount), label: "إجمالي اللاعبين المسجلين" },
    { id: 2, value: String(suggestedPlayers.length), label: "الترشيحات الحالية" },
    { id: 3, value: String(savedPlayerIds.length), label: "قائمة الحفظ الخاصة بك" },
    { id: 4, value: user?.role === 'scout' ? "الكشافين" : "اللاعبين", label: "نوع الحساب" },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-10 font-sans" dir="rtl">
      <div className="text-center mb-6 md:mb-10 pt-4">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1C2C5E] mb-2">
          مرحباً <span className="text-[#2B43A1]">{displayName}</span>
        </h1>
        <p className="text-gray-400 text-xs font-medium">
          {currentDate} — إليك آخر ما يدور في المنصة
        </p>
      </div>

      <HomeStats stats={dynamicStats} />

      <HomeSuggestedTable players={suggestedPlayers} />
    </div>
  );
};

export default Home;

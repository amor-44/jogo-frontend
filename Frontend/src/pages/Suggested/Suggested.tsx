import { useState, useEffect } from 'react';
import PlayerCard from '../../components/PlayerCard';
import { playerService } from '../../services/playerService';
import type { PlayerCardDto } from '../../types';
import { Loader2 } from 'lucide-react';

const Suggested = () => {
  const [players, setPlayers] = useState<PlayerCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    playerService.getAllPlayers({ page: 1, pageSize: 20, minOverallScore: 70 })
      .then((res) => {
        if (isMounted && res) {
          setPlayers(res.items || []);
        }
      })
      .catch((err) => console.error('Error fetching suggested players:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2 font-sans" dir="rtl">
      <div className="text-right mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C2C5E] mb-1">اللاعبون المقترحون بالذكاء الاصطناعي ⚽</h1>
        <p className="text-gray-400 text-xs font-medium">
          ترشيحات ذكية بناءً على أعلى معدلات الأداء والتقييمات الشاملة ({players.length})
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B43A1]" />
        </div>
      ) : players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
          <span className="text-4xl mb-3 block">⚽</span>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا يوجد لاعبون مقترحون حالياً</h3>
          <p className="text-xs text-gray-400">ستظهر هنا ترشيحات اللاعبين المميزين بناءً على تحليلات الأداء المتقدمة.</p>
        </div>
      )}
    </div>
  );
};

export default Suggested;

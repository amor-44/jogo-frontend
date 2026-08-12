import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PlayerCard from '../../components/PlayerCard';
import { playerService } from '../../services/playerService';
import type { PlayerCardDto } from '../../types';
import { Loader2 } from 'lucide-react';

const Saved = () => {
  const { savedPlayerIds } = useAuth();
  const [savedPlayers, setSavedPlayers] = useState<PlayerCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (savedPlayerIds.length === 0) {
      return;
    }

    playerService.getAllPlayers({ page: 1, pageSize: 50 })
      .then((res) => {
        if (isMounted && res && res.items) {
          const filtered = res.items.filter((p) => savedPlayerIds.includes(String(p.id)));
          setSavedPlayers(filtered);
        }
      })
      .catch((err) => console.error('Error fetching saved players:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [savedPlayerIds]);

  const displayedPlayers = savedPlayers.filter(p => savedPlayerIds.includes(String(p.id)));

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2 font-sans" dir="rtl">
      <div className="text-right mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C2C5E] mb-1">اللاعبون المحفوظون 🔖</h1>
        <p className="text-gray-400 text-xs font-medium">
          قائمة اللاعبين الذين قمت بحفظهم للرجوع إليهم لاحقاً ({displayedPlayers.length})
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B43A1]" />
        </div>
      ) : displayedPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
          <span className="text-4xl mb-3 block">🔖</span>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا يوجد لاعبون محفوظون حالياً</h3>
          <p className="text-xs text-gray-400">يمكنك حفظ اللاعبين من شاشة البحث أو الرئيسية عبر الضغط على أيقونة التثبيت/الحفظ.</p>
        </div>
      )}
    </div>
  );
};

export default Saved;

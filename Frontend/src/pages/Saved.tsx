import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/PlayerCard';

const Saved = () => {
  const { players, savedPlayerIds } = useAuth();
  const savedPlayers = players.filter(p => savedPlayerIds.includes(p.id));

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2" dir="rtl">
      <div className="text-right mb-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">اللاعبون المحفوظون</h1>
        <p className="text-gray-500 text-xs">
          قائمة اللاعبين الذين قمت بحفظهم للرجوع إليهم لاحقاً ({savedPlayers.length})
        </p>
      </div>

      {savedPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlayers.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <span className="text-4xl mb-3 block">🔖</span>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا يوجد لاعبون محفوظون حالياً</h3>
          <p className="text-xs text-gray-400">يمكنك حفظ اللاعبين من شاشة البحث أو الرئيسية عبر الضغط على أيقونة القلب.</p>
        </div>
      )}
    </div>
  );
};

export default Saved;
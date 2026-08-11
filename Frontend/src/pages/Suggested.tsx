import { useAuth } from '../hooks/useAuth';
import PlayerCard from '../components/PlayerCard';

const Suggested = () => {
  const { players } = useAuth();
  const suggestedPlayers = players.filter(p => p.aiScore >= 85);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2" dir="rtl">
      <div className="text-right mb-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">اللاعبون المقترحون بالذكاء الاصطناعي</h1>
        <p className="text-gray-500 text-xs">
          ترشيحات ذكية بناءً على أعلى معدلات الأداء والتقييمات الشاملة ({suggestedPlayers.length})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedPlayers.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
};

export default Suggested;
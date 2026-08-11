import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { PlayerCardProps } from '../types';

const PlayerCard = ({ player }: PlayerCardProps) => {
  const { savedPlayerIds, toggleSavePlayer } = useAuth();
  const navigate = useNavigate();
  const isSaved = savedPlayerIds.includes(player.id);

  const fallbackImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop";

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative" dir="rtl">
      <div className="bg-[#1C2C5E] p-4 text-white relative h-28 flex justify-between items-start">
        <span className="bg-blue-600/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">
          {player.position}
        </span>
        <button 
          onClick={() => toggleSavePlayer(player.id)}
          className={`text-lg transition-transform active:scale-125 cursor-pointer ${isSaved ? 'text-red-500' : 'text-white/80 hover:text-red-400'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      <div className="px-6 pb-6 pt-0 text-center relative -mt-12">
        <div className="w-20 h-20 mx-auto mb-3 relative rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
          <img 
            src={player.image || fallbackImage} 
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        <h3 className="font-bold text-[#1C2C5E] text-base mb-1">{player.name}</h3>
        <p className="text-gray-400 text-xs mb-4">{player.club} - {player.age} سنة - {player.height}</p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-gray-800 text-sm">
              {player.overall}
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1">OVERALL</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold text-sm">
              {player.aiScore}
            </div>
            <span className="text-[9px] font-bold text-blue-600 mt-1">AI SCORE</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl mb-5 text-center text-xs">
          <div>
            <span className="block text-gray-400 text-[10px]">القيمة</span>
            <span className="font-bold text-green-600">{player.value}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-[10px]">القدم</span>
            <span className="font-bold text-gray-700">{player.foot}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-[10px]">الدولة</span>
            <span className="font-bold text-gray-700">{player.country}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/profile')} 
          className="w-full border-2 border-blue-600 text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
        >
          عرض الملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
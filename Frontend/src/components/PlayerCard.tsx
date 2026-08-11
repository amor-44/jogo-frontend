import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { PlayerCardDto } from '../types';

interface Props {
  player: PlayerCardDto;
}

const PlayerCard = ({ player }: Props) => {
  const { savedPlayerIds, toggleSavePlayer } = useAuth();
  const navigate = useNavigate();
  // savedPlayerIds could be numbers or strings, so we convert both to strings for comparison
  const isSaved = savedPlayerIds.map(String).includes(String(player.id));

  const fallbackImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop";

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative" dir="rtl">
      <div className="bg-[#1C2C5E] p-4 text-white relative h-28 flex justify-between items-start">
        <span className="bg-blue-600/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">
          {player.position}
        </span>
        <button 
          onClick={() => toggleSavePlayer(Number(player.id))} // toggleSavePlayer expects number, but we can pass number if backend id is actually numeric or convert it
          className={`text-lg transition-transform active:scale-125 cursor-pointer ${isSaved ? 'text-red-500' : 'text-white/80 hover:text-red-400'}`}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      <div className="px-6 pb-6 pt-0 text-center relative -mt-12">
        <div className="w-20 h-20 mx-auto mb-3 relative rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
          <img 
            src={player.profilePictureUrl || fallbackImage} 
            alt={player.fullName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        <h3 className="font-bold text-[#1C2C5E] text-base mb-1">{player.fullName}</h3>
        <p className="text-gray-400 text-xs mb-4">{player.currentClub || 'بدون نادي'} - {player.age} سنة - --- سم</p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-gray-800 text-sm">
              {player.overallScore || 0}
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1">OVERALL</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold text-sm">
              {/* Dummy AI Score for now */}
              --
            </div>
            <span className="text-[9px] font-bold text-blue-600 mt-1">AI SCORE</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl mb-5 text-center text-xs">
          <div>
            <span className="block text-gray-400 text-[10px]">القيمة</span>
            <span className="font-bold text-green-600">---</span>
          </div>
          <div>
            <span className="block text-gray-400 text-[10px]">القدم</span>
            <span className="font-bold text-gray-700">{player.preferredFoot}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-[10px]">الدولة</span>
            <span className="font-bold text-gray-700">{player.nationality}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/profile/${player.id}`)} 
          className="w-full border-2 border-blue-600 text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
        >
          عرض الملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
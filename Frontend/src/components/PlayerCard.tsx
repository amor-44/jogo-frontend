import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { PlayerCardDto } from '../types';

interface Props {
  player: PlayerCardDto;
}

const PlayerCard = ({ player }: Props) => {
  const { savedPlayerIds, toggleSavePlayer } = useAuth();
  const navigate = useNavigate();
  const isSaved = savedPlayerIds.map(String).includes(String(player.id));

  // Map English foot values to Arabic
  const footLabel = (foot: string) => {
    const map: Record<string, string> = {
      'Right': 'يمنى',
      'Left': 'يسرى',
      'Both': 'كلاهما',
      'right': 'يمنى',
      'left': 'يسرى',
      'both': 'كلاهما',
    };
    return map[foot] || foot || '--';
  };

  // Map English position values to Arabic
  const positionLabel = (pos: string) => {
    const map: Record<string, string> = {
      'Goalkeeper': 'حارس',
      'CenterBack': 'قلب دفاع',
      'RightBack': 'ظهير أيمن',
      'LeftBack': 'ظهير أيسر',
      'DefensiveMidfielder': 'وسط دفاعي',
      'CentralMidfielder': 'وسط',
      'AttackingMidfielder': 'وسط هجومي',
      'LeftWinger': 'جناح أيسر',
      'RightWinger': 'جناح أيمن',
      'Striker': 'مهاجم',
    };
    return map[pos] || pos || '--';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group" dir="rtl">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-l from-[#2B43A1] to-[#4F6BDB]" />

      <div className="p-5">
        {/* Header: Name + Position + Save */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2B43A1] to-[#4F6BDB] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                {player.fullName ? player.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#1C2C5E] text-sm truncate">{player.fullName}</h3>
                <span className="text-[10px] text-gray-400 font-medium">{player.currentClub || 'بدون نادي'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSavePlayer(String(player.id)); }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-400 hover:bg-red-50'}`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>

        {/* Position badge */}
        <div className="mb-4">
          <span className="inline-block bg-[#EBF1FF] text-[#2B43A1] text-[10px] font-bold px-3 py-1 rounded-lg">
            {positionLabel(player.position)}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">العمر</span>
            <span className="font-bold text-gray-800 text-sm">{player.age} <span className="text-[10px] text-gray-400 font-normal">سنة</span></span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">القدم</span>
            <span className="font-bold text-gray-800 text-sm">{footLabel(player.preferredFoot)}</span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">الدولة</span>
            <span className="font-bold text-gray-800 text-sm truncate block">{player.nationality || '--'}</span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">التقييم</span>
            <span className="font-extrabold text-[#2B43A1] text-sm">{player.overallScore || '--'}</span>
          </div>
        </div>

        {/* View profile button */}
        <button 
          onClick={() => navigate(`/player/${player.id}`)} 
          className="w-full bg-gradient-to-l from-[#2B43A1] to-[#3D5BC9] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          عرض الملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
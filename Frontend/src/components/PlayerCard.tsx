import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFullImageUrl } from '../utils/url';
import type { PlayerCardDto } from '../types';

interface Props {
  player: PlayerCardDto;
}

const PlayerCard = ({ player }: Props) => {
  const { savedPlayerIds, toggleSavePlayer } = useAuth();
  const navigate = useNavigate();
  const isSaved = savedPlayerIds.map(String).includes(String(player.id));

  // Map English position values to Arabic
  const positionLabel = (pos?: string) => {
    if (!pos) return 'غير محدد';
    const map: Record<string, string> = {
      'Goalkeeper': 'حارس',
      'GK': 'حارس',
      'CenterBack': 'قلب دفاع',
      'CB': 'قلب دفاع',
      'RightBack': 'ظهير أيمن',
      'RB': 'ظهير أيمن',
      'LeftBack': 'ظهير أيسر',
      'LB': 'ظهير أيسر',
      'DefensiveMidfielder': 'وسط دفاعي',
      'CDM': 'وسط دفاعي',
      'CentralMidfielder': 'وسط',
      'CM': 'وسط',
      'AttackingMidfielder': 'وسط هجومي',
      'CAM': 'وسط هجومي',
      'LeftWinger': 'جناح أيسر',
      'LW': 'جناح أيسر',
      'RightWinger': 'جناح أيمن',
      'RW': 'جناح أيمن',
      'Striker': 'مهاجم',
      'ST': 'مهاجم',
    };
    return map[String(pos)] || String(pos);
  };

  const rawPosition = player.primaryPosition ? String(player.primaryPosition) : (player.position ? String(player.position) : '');
  const rawCountry = player.country || player.nationality || 'غير محدد';
  const rawScore = player.latestOverallScore ?? player.overallScore;
  const avatarUrl = getFullImageUrl(player.profilePictureUrl);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group font-sans" dir="rtl">
      {/* Top accent bar */}
      <div className="h-1.5 bg-linear-to-l from-[#2B43A1] to-[#4F6BDB]" />

      <div className="p-5">
        {/* Header: Name + Position + Save */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2B43A1] to-[#4F6BDB] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm overflow-hidden bg-[#2B43A1]">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={player.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{player.fullName ? player.fullName.charAt(0).toUpperCase() : '?'}</span>
                )}
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
            {positionLabel(rawPosition)}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">العمر</span>
            <span className="font-bold text-gray-800 text-xs">{player.age || '--'} <span className="text-[9px] text-gray-400 font-normal">سنة</span></span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">الدولة</span>
            <span className="font-bold text-gray-800 text-xs truncate block">{rawCountry}</span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-gray-400 font-medium mb-0.5">التقييم</span>
            <span className="font-extrabold text-[#2B43A1] text-xs">⭐ {rawScore ? `${rawScore}` : '--'}</span>
          </div>
        </div>

        {/* View profile button */}
        <button 
          onClick={() => navigate(`/player/${player.id}`)} 
          className="w-full bg-linear-to-l from-[#2B43A1] to-[#3D5BC9] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          عرض الملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
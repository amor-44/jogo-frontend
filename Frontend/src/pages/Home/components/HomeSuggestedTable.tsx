import { useNavigate } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import type { PlayerCardDto, HomeSuggestedTableProps } from '../../../types';
import { Star } from 'lucide-react';

const POSITION_ARABIC: Record<string, string> = {
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

export const HomeSuggestedTable = ({ players }: HomeSuggestedTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xs border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[#1C2C5E]">اللاعبون المقترحون بالذكاء الاصطناعي</h2>
        <button 
          onClick={() => navigate('/search')}
          className="text-[#2B43A1] text-xs font-bold hover:underline cursor-pointer"
        >
          عرض الكل
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="pb-4 font-bold text-right px-4">اللاعب</th>
              <th className="pb-4 font-bold">المركز</th>
              <th className="pb-4 font-bold">العمر</th>
              <th className="pb-4 font-bold">التقييم</th>
              <th className="pb-4 font-bold">الجنسية</th>
              <th className="pb-4 font-bold">النادي</th>
              <th className="pb-4 font-bold">القيمة السوقية</th>
              <th className="pb-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {players.map((player: PlayerCardDto) => {
              const pos = player.primaryPosition ? String(player.primaryPosition) : (player.position ? String(player.position) : 'غير محدد');
              const arabicPos = POSITION_ARABIC[pos] || pos;
              const country = player.country || player.nationality || '--';
              const score = player.latestOverallScore ?? player.overallScore;
              const marketVal = player.marketValue ? `$${Number(player.marketValue).toLocaleString()}` : '---';

              return (
                <tr key={player.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3 text-right">
                    <Avatar name={player.fullName} image={player.profilePictureUrl} size="sm" />
                    <span className="font-bold text-gray-800">{player.fullName}</span>
                  </td>
                  <td className="py-3.5 text-gray-600 font-semibold">{arabicPos}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{player.age || '--'}</td>
                  <td className="py-3.5 text-[#2B43A1] font-bold">
                    <span className="inline-flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      {score !== undefined && score !== null ? score : '--'}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-600 font-medium">{country}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{player.currentClub || 'بدون نادي'}</td>
                  <td className="py-3.5 text-[#2B43A1] font-extrabold">{marketVal}</td>
                  <td className="py-3.5">
                    <button 
                      onClick={() => navigate(`/player/${player.id}`)} 
                      className="text-[#2B43A1] hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      عرض الملف الشخصي
                    </button>
                  </td>
                </tr>
              );
            })}
            {players.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-gray-400 text-center">
                  لا يوجد لاعبين مقترحين حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomeSuggestedTable;

import { useNavigate } from 'react-router-dom';
import { Bot, Trophy, Clock, Star, Activity } from 'lucide-react';
import type { ProfileSidebarProps } from '../../../types';

export const ProfileSidebar = ({ user, playerProfile }: ProfileSidebarProps) => {
  const navigate = useNavigate();

  const displayName = playerProfile?.fullName || user?.name || 'أحمد الرشيدي';
  const displayAvatar =
    playerProfile?.profilePictureUrl ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2B43A1&color=fff&size=128`;
  
  const positionMap: Record<string, string> = {
    Striker: 'مهاجم',
    LeftWinger: 'جناح أيسر',
    RightWinger: 'جناح أيمن',
    AttackingMidfielder: 'وسط هجومي / صانع ألعاب',
    CentralMidfielder: 'وسط محور',
    DefensiveMidfielder: 'وسط دفاعي / ارتكاز',
    LeftBack: 'ظهير أيسر',
    RightBack: 'ظهير أيمن',
    CenterBack: 'قلب دفاع',
    Goalkeeper: 'حارس مرمى',
    GK: 'حارس مرمى',
    CB: 'قلب دفاع',
    LB: 'ظهير أيسر',
    RB: 'ظهير أيمن',
    CDM: 'وسط دفاعي',
    CM: 'وسط محور',
    CAM: 'وسط هجومي',
    LW: 'جناح أيسر',
    RW: 'جناح أيمن',
    ST: 'مهاجم',
  };
  const rawPos = (playerProfile?.primaryPosition || playerProfile?.position || '') as string;
  const displayPosition = positionMap[rawPos] || rawPos || 'لاعب كرة قدم';
  const displayClub = playerProfile?.currentClub || 'بدون نادي';
  const displayAge = playerProfile?.age ? `${playerProfile.age} عاماً` : '20 عاماً';
  const displayCountry = playerProfile?.country || playerProfile?.nationality || 'السعودية';
  const displayCity = playerProfile?.city || playerProfile?.region;
  const displayLocation = displayCity ? `${displayCountry} (${displayCity})` : displayCountry;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100 flex flex-col items-center text-center font-sans">
      <div className="relative mb-3">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
          <img 
            src={displayAvatar} 
            alt={displayName} 
            className="w-full h-full object-cover"
          />
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="absolute bottom-0 left-0 bg-[#2B43A1] text-white p-1.5 rounded-full border-2 border-white shadow-xs hover:scale-110 transition-transform cursor-pointer"
          title="تحدث مع الذكاء الاصطناعي"
        >
          <Bot className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
      <p className="text-gray-400 text-xs mb-4 font-medium">{displayPosition} | {displayClub}</p>
      
      <div className="grid grid-cols-2 gap-4 w-full py-3 border-t border-b border-gray-100 text-xs my-2">
        <div>
          <span className="block text-gray-400 text-[11px] mb-0.5">العمر</span>
          <span className="font-bold text-gray-800">{displayAge}</span>
        </div>
        <div className="border-r border-gray-100">
          <span className="block text-gray-400 text-[11px] mb-0.5">الجنسية والمدينة</span>
          <span className="font-bold text-gray-800 truncate block px-1" title={displayLocation}>{displayLocation}</span>
        </div>
      </div>

      <div className="w-full text-right mt-3">
        <h4 className="text-xs font-bold text-gray-700 mb-3">إحصائيات سريعة</h4>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <Trophy className="w-4 h-4 text-blue-600" /> مباريات مرفوعة
            </span>
            <span className="font-bold text-gray-900">12</span>
          </div>

          <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <Clock className="w-4 h-4 text-blue-600" /> ساعات محللة
            </span>
            <span className="font-bold text-gray-900">38.5 س</span>
          </div>

          <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <Star className="w-4 h-4 text-blue-600" /> متوسط الدرجة
            </span>
            <span className="font-bold text-gray-900">76.4</span>
          </div>

          <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <Activity className="w-4 h-4 text-blue-600" /> أفضل أداء
            </span>
            <span className="font-bold text-gray-900">82</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Trophy, Star, Activity, Camera, Loader2, Edit3 } from 'lucide-react';
import type { ProfileSidebarProps } from '../../../types';
import { playerService } from '../../../services/playerService';
import { getFullImageUrl } from '../../../utils/url';

export const ProfileSidebar = ({ user, playerProfile, bestAiScore, onEditProfile, onAvatarUploaded }: ProfileSidebarProps & { bestAiScore?: number | null }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const displayName = playerProfile?.fullName || user?.name || 'اللاعب';
  const displayAvatar =
    getFullImageUrl(playerProfile?.profilePictureUrl) ||
    getFullImageUrl(user?.avatar) ||
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

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const newUrl = await playerService.uploadProfilePicture(formData);
      if (newUrl && onAvatarUploaded) {
        onAvatarUploaded(newUrl);
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('حدث خطأ أثناء رفع الصورة الشخصية.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100 flex flex-col items-center text-center font-sans">
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />

      <div className="relative mb-3 group">
        <div 
          onClick={handleAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative cursor-pointer"
        >
          <img 
            src={displayAvatar} 
            alt={displayName} 
            className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}
          />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
          </div>
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
      
      {/* Edit Profile Button */}
      <button 
        onClick={onEditProfile}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-200 cursor-pointer"
      >
        <Edit3 className="w-3.5 h-3.5" /> تعديل الملف الشخصي
      </button>

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
        <h4 className="text-xs font-bold text-gray-700 mb-3">بيانات إضافية</h4>
        <div className="space-y-2.5">
          {playerProfile?.marketValue ? (
            <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
              <span className="flex items-center gap-2 text-gray-600 font-medium">
                <Star className="w-4 h-4 text-blue-600" /> القيمة السوقية
              </span>
              <span className="font-bold text-gray-900">${playerProfile.marketValue.toLocaleString()}</span>
            </div>
          ) : null}

          {playerProfile?.footballExperience ? (
            <div className="flex flex-col bg-gray-50/70 p-2.5 rounded-xl text-xs">
              <span className="flex items-center gap-2 text-gray-600 font-medium mb-1">
                <Trophy className="w-4 h-4 text-blue-600" /> الخبرة الكروية
              </span>
              <span className="font-bold text-gray-900 leading-relaxed text-right">{playerProfile.footballExperience}</span>
            </div>
          ) : null}
          
          <div className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl text-xs">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <Activity className="w-4 h-4 text-blue-600" /> أفضل أداء
            </span>
            <span className="font-bold text-gray-900">
              {bestAiScore != null ? `${bestAiScore} / 100` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;

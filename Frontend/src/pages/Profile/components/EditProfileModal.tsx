import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { PlayerProfileDto, Position, ProfileVisibility, UpdateProfileCommand } from '../../../types';
import { playerService } from '../../../services/playerService';

interface EditProfileModalProps {
  profile: PlayerProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (profile: PlayerProfileDto) => void;
}

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'Striker', label: 'مهاجم (Striker)' },
  { value: 'LeftWinger', label: 'جناح أيسر (Left Winger)' },
  { value: 'RightWinger', label: 'جناح أيمن (Right Winger)' },
  { value: 'AttackingMidfielder', label: 'وسط هجومي (CAM)' },
  { value: 'CentralMidfielder', label: 'وسط محور (CM)' },
  { value: 'DefensiveMidfielder', label: 'وسط دفاعي (CDM)' },
  { value: 'LeftBack', label: 'ظهير أيسر (LB)' },
  { value: 'RightBack', label: 'ظهير أيمن (RB)' },
  { value: 'CenterBack', label: 'قلب دفاع (CB)' },
  { value: 'Goalkeeper', label: 'حارس مرمى (GK)' },
];

const EditProfileForm = ({
  profile,
  onClose,
  onUpdate,
}: {
  profile: PlayerProfileDto | null;
  onClose: () => void;
  onUpdate: (profile: PlayerProfileDto) => void;
}) => {
  const [city, setCity] = useState(profile?.city || profile?.region || '');
  const [height, setHeight] = useState<number | ''>(profile?.height || '');
  const [weight, setWeight] = useState<number | ''>(profile?.weight || '');
  const [secondaryPosition, setSecondaryPosition] = useState(profile?.secondaryPosition || '');
  const [currentClub, setCurrentClub] = useState(profile?.currentClub || '');
  const [biography, setBiography] = useState(profile?.biography || profile?.bio || '');
  const [footballExperience, setFootballExperience] = useState(profile?.footballExperience || '');
  const [marketValue, setMarketValue] = useState<number | ''>(profile?.marketValue || '');
  const [visibility, setVisibility] = useState<ProfileVisibility>(profile?.visibility || profile?.profileVisibility || 'Public');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload: UpdateProfileCommand = {
        city: city.trim() || undefined,
        height: height === '' ? undefined : Number(height),
        weight: weight === '' ? undefined : Number(weight),
        secondaryPosition: secondaryPosition || undefined,
        currentClub: currentClub.trim() || undefined,
        biography: biography.trim() || undefined,
        footballExperience: footballExperience.trim() || undefined,
        marketValue: marketValue === '' ? undefined : Number(marketValue),
        visibility: visibility,
      };

      await playerService.updateMe(payload);
      const updatedProfile = await playerService.getMe();
      onUpdate(updatedProfile);
      onClose();
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      const axiosErr = err as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      setError(axiosErr.response?.data?.detail || axiosErr.response?.data?.title || axiosErr.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-lg text-[#1C2C5E]">تعديل بيانات الملف الشخصي</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl">
              {error}
            </div>
          )}

          {/* Current Club & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">النادي الحالي</label>
              <input 
                type="text"
                value={currentClub}
                onChange={(e) => setCurrentClub(e.target.value)}
                placeholder="مثال: نادي الهلال / بدون نادي"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المدينة</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: الرياض"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition"
              />
            </div>
          </div>

          {/* Physical Stats: Height & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">الطول (سم)</label>
              <input 
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="مثال: 178"
                min="100"
                max="230"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">الوزن (كجم)</label>
              <input 
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="مثال: 72"
                min="30"
                max="150"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition"
              />
            </div>
          </div>

          {/* Secondary Position */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">المركز الثانوي (اختياري)</label>
            <select
              value={secondaryPosition}
              onChange={(e) => setSecondaryPosition(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition cursor-pointer"
            >
              <option value="">-- بدون مركز ثانوي --</option>
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          {/* Market Value */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">القيمة السوقية التقديرية ($)</label>
            <input 
              type="number"
              value={marketValue}
              onChange={(e) => setMarketValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="مثال: 25000"
              min="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition"
            />
          </div>

          {/* Football Experience */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">الخبرة الكروية والمسيرة</label>
            <textarea 
              value={footballExperience}
              onChange={(e) => setFootballExperience(e.target.value)}
              placeholder="اذكر الأندية السابقة، البطولات المشارك بها، والإنجازات..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition resize-none"
            />
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">نبذة تعريفية (Bio)</label>
            <textarea 
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن أسلوب لعبك وطموحاتك..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1] transition resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">خصوصية الملف الشخصي</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="Public" 
                  checked={visibility === 'Public'}
                  onChange={() => setVisibility('Public')}
                  className="accent-[#2B43A1]"
                />
                عام (مرئي لجميع الكشافين والأندية)
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="Private" 
                  checked={visibility === 'Private'}
                  onChange={() => setVisibility('Private')}
                  className="accent-[#2B43A1]"
                />
                خاص (مخفي من نتائج البحث)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#2B43A1] text-white font-bold text-xs py-3 rounded-xl hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditProfileModal = ({ profile, isOpen, onClose, onUpdate }: EditProfileModalProps) => {
  if (!isOpen) return null;
  return <EditProfileForm profile={profile} onClose={onClose} onUpdate={onUpdate} />;
};

export default EditProfileModal;

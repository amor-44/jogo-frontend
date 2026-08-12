import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { playerService } from '../../../services/playerService';
import type { PlayerProfileDto, UpdateProfileCommand, ProfileVisibility } from '../../../types';
import { Position } from '../../../types';

interface EditProfileModalProps {
  profile: PlayerProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: PlayerProfileDto) => void;
}

const VISIBILITY_OPTIONS: { label: string; value: ProfileVisibility }[] = [
  { label: 'عام (للجميع)', value: 'Public' },
  { label: 'كشافين فقط', value: 'ScoutsOnly' },
  { label: 'خاص', value: 'Private' },
];

const POSITIONS = [
  { label: 'بدون مركز إضافي', value: '' },
  { label: 'مهاجم (ST)', value: Position.ST },
  { label: 'جناح أيسر (LW)', value: Position.LW },
  { label: 'جناح أيمن (RW)', value: Position.RW },
  { label: 'صانع ألعاب (CAM)', value: Position.CAM },
  { label: 'وسط محور (CM)', value: Position.CM },
  { label: 'وسط دفاعي (CDM)', value: Position.CDM },
  { label: 'ظهير أيسر (LB)', value: Position.LB },
  { label: 'ظهير أيمن (RB)', value: Position.RB },
  { label: 'قلب دفاع (CB)', value: Position.CB },
  { label: 'حارس مرمى (GK)', value: Position.GK },
];

export const EditProfileModal = ({ profile, isOpen, onClose, onUpdate }: EditProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [city, setCity] = useState(profile?.city || profile?.region || '');
  const [height, setHeight] = useState<number | ''>(profile?.height || '');
  const [weight, setWeight] = useState<number | ''>(profile?.weight || '');
  const [secondaryPosition, setSecondaryPosition] = useState(profile?.secondaryPosition || '');
  const [currentClub, setCurrentClub] = useState(profile?.currentClub || '');
  const [biography, setBiography] = useState(profile?.biography || profile?.bio || '');
  const [footballExperience, setFootballExperience] = useState(profile?.footballExperience || '');
  const [marketValue, setMarketValue] = useState<number | ''>(profile?.marketValue || '');
  const [visibility, setVisibility] = useState<ProfileVisibility>(profile?.visibility || profile?.profileVisibility || 'Public');

  useEffect(() => {
    if (isOpen && profile) {
      setCity(profile.city || profile.region || '');
      setHeight(profile.height || '');
      setWeight(profile.weight || '');
      setSecondaryPosition(profile.secondaryPosition || '');
      setCurrentClub(profile.currentClub || '');
      setBiography(profile.biography || profile.bio || '');
      setFootballExperience(profile.footballExperience || '');
      setMarketValue(profile.marketValue || '');
      setVisibility(profile.visibility || profile.profileVisibility || 'Public');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

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
      // Fetch the latest profile data from the server since updateMe returns void
      const updatedProfile = await playerService.getMe();
      onUpdate(updatedProfile);
      onClose();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.detail || err.response?.data?.title || err.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h2 className="text-xl font-bold text-[#1C2C5E]">تعديل الملف الشخصي</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المدينة / المنطقة</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: الرياض" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">النادي الحالي</label>
                <input 
                  type="text" 
                  value={currentClub} 
                  onChange={(e) => setCurrentClub(e.target.value)}
                  placeholder="مثال: نادي الهلال أو بدون نادي" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الطول (سم)</label>
                <input 
                  type="number" 
                  min="100" max="250"
                  value={height} 
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 180" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الوزن (كجم)</label>
                <input 
                  type="number" 
                  min="30" max="150"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 75" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المركز الإضافي</label>
                <select 
                  value={secondaryPosition} 
                  onChange={(e) => setSecondaryPosition(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors cursor-pointer"
                >
                  {POSITIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">القيمة السوقية (تقديرية)</label>
                <input 
                  type="number" 
                  min="0"
                  value={marketValue} 
                  onChange={(e) => setMarketValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 50000" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رؤية الملف الشخصي</label>
              <div className="flex flex-wrap gap-4">
                {VISIBILITY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value={opt.value}
                      checked={visibility === opt.value}
                      onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}
                      className="w-4 h-4 text-[#2B43A1] focus:ring-[#2B43A1] border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نبذة عن اللاعب (Biography)</label>
              <textarea 
                value={biography} 
                onChange={(e) => setBiography(e.target.value)}
                placeholder="تحدث عن نفسك، أهدافك وطموحاتك..." 
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الخبرة الكروية (Football Experience)</label>
              <textarea 
                value={footballExperience} 
                onChange={(e) => setFootballExperience(e.target.value)}
                placeholder="الأندية التي لعبت لها، البطولات والمشاركات السابقة..." 
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#2B43A1] focus:bg-white outline-none transition-colors resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
          >
            إلغاء
          </button>
          <button 
            type="submit"
            form="edit-profile-form"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#2B43A1] text-white font-bold text-sm hover:bg-blue-900 transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;

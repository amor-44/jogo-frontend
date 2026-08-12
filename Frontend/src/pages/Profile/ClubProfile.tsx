import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { scoutService } from '../../services/scoutService';
import { contactService } from '../../services/contactService';
import { getFullImageUrl } from '../../utils/url';
import type { ScoutProfileDto, UpdateScoutProfileCommand } from '../../types';
import { 
  Building2, 
  MapPin, 
  Award, 
  Mail, 
  Bookmark, 
  Send, 
  Search, 
  Edit3, 
  Check, 
  Loader2, 
  TrendingUp,
  Users
} from 'lucide-react';

const ClubProfile = () => {
  const { user, scoutProfile, savedPlayerIds, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ScoutProfileDto | null>(scoutProfile);
  const [contactRequestsCount, setContactRequestsCount] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateScoutProfileCommand>({
    organization: '',
    country: '',
    experienceYears: 0,
    city: '',
    biography: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadScoutData() {
      try {
        const [scoutData, requestsData] = await Promise.allSettled([
          scoutService.getMe(),
          contactService.getScoutContactRequests(1, 10),
        ]);

        if (isMounted) {
          if (scoutData.status === 'fulfilled' && scoutData.value) {
            setProfile(scoutData.value);
            setEditForm({
              organization: scoutData.value.organization || user?.name || '',
              country: scoutData.value.country || '',
              experienceYears: scoutData.value.experienceYears || 0,
              city: scoutData.value.city || '',
              biography: scoutData.value.biography || '',
            });
          }
          if (requestsData.status === 'fulfilled' && requestsData.value) {
            setContactRequestsCount(requestsData.value.totalCount || requestsData.value.items?.length || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load scout profile:', err);
      }
    }

    loadScoutData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleOpenEdit = () => {
    setEditForm({
      organization: profile?.organization || user?.name || '',
      country: profile?.country || '',
      experienceYears: profile?.experienceYears || 0,
      city: profile?.city || '',
      biography: profile?.biography || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await scoutService.updateMe(editForm);
      await refreshUser();
      setProfile(prev => ({
        ...prev,
        ...editForm,
      }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update scout profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const clubName = profile?.organization || user?.name || 'النادي الرياضي';
  const country = profile?.country || 'مصر';
  const experienceYears = profile?.experienceYears ?? 5;
  const email = user?.email || profile?.email || 'club@jogo.com';

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-16 text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-linear-to-l from-[#1C2C5E] via-[#2B43A1] to-[#3D5BC9] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Club Badge / Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-xl shrink-0 overflow-hidden border-2 border-white/20">
            <img 
              src={getFullImageUrl(user?.avatar) || "https://upload.wikimedia.org/wikipedia/ar/7/70/Al-Ittihad_Saudi_Club_logo.png"} 
              alt={clubName} 
              className="w-full h-full object-contain rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(clubName)}&background=2B43A1&color=fff`;
              }}
            />
          </div>

          {/* Club Info */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black">{clubName}</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    حساب كشاف / نادي مقيد
                  </span>
                </div>
                <p className="text-blue-100/80 text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </p>
              </div>

              <button 
                onClick={handleOpenEdit}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm border border-white/20 cursor-pointer self-center sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" /> تعديل بيانات النادي
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-blue-100">
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-blue-300" /> {country}
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg">
                <Award className="w-3.5 h-3.5 text-amber-300" /> {experienceYears} سنوات خبرة في الاستكشاف
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-blue-300" /> منظمة رياضية معتمدة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2B43A1] flex items-center justify-center mb-2">
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-[#1C2C5E] mb-0.5">{savedPlayerIds.length}</span>
          <span className="text-xs text-gray-400 font-bold">اللاعبون المحفوظون في القائمة</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-[#1C2C5E] mb-0.5">{contactRequestsCount}</span>
          <span className="text-xs text-gray-400 font-bold">طلبات التواصل المرسلة</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-[#1C2C5E] mb-0.5">نشط</span>
          <span className="text-xs text-gray-400 font-bold">حالة الكشافة في المنصة</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-[#2B43A1] font-bold text-sm">
              <Search className="w-5 h-5" /> البحث واستكشاف المواهب
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              تصفح قاعدة بيانات اللاعبين، استخدم الفلاتر المتقدمة لاختيار المراكز والأعمار والأقدام وتقييمات الذكاء الاصطناعي بدقة.
            </p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="w-full bg-[#2B43A1] hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
          >
            الانتقال إلى البحث عن اللاعبين
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <TrendingUp className="w-5 h-5" /> اللاعبون المقترحون لك
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              اطلع على الترشيحات الذكية للمواهب الصاعدة واللاعبين الأعلى تقييماً في التحليلات الفنية الحديثة.
            </p>
          </div>
          <button 
            onClick={() => navigate('/suggested')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
          >
            عرض اللاعبين المقترحين
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#1C2C5E] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#2B43A1]" /> تعديل بيانات النادي / الكشاف
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم النادي / المنظمة</label>
                <input 
                  type="text" 
                  value={editForm.organization}
                  onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الدولة</label>
                  <input 
                    type="text" 
                    value={editForm.country}
                    onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سنوات الخبرة</label>
                  <input 
                    type="number" 
                    min="0"
                    max="50"
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm(prev => ({ ...prev, experienceYears: Number(e.target.value) }))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المدينة</label>
                <input 
                  type="text" 
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="مثال: القاهرة، الرياض"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#2B43A1]"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#2B43A1] hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubProfile;

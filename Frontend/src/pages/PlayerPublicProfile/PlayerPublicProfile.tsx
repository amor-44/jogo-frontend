import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playerService } from '../../services/playerService';
import { contactService } from '../../services/contactService';
import { useAuth } from '../../hooks/useAuth';
import type { PlayerProfileDto } from '../../types';
import { Loader2, ArrowRight, Send, Heart, MapPin, Calendar, Footprints, Shield, User, Building2 } from 'lucide-react';

const PlayerPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, savedPlayerIds, toggleSavePlayer } = useAuth();

  const [player, setPlayer] = useState<PlayerProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactMessage, setContactMessage] = useState('');

  const isSaved = id ? savedPlayerIds.map(String).includes(String(id)) : false;

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    playerService.getPlayerById(id)
      .then((data) => {
        setPlayer(data);
      })
      .catch((err) => {
        console.error('Failed to load player profile:', err);
        setError('تعذر تحميل بيانات اللاعب. تأكد من صحة الرابط.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSendContactRequest = async () => {
    if (!id || contactStatus === 'sending' || contactStatus === 'sent') return;
    setContactStatus('sending');
    try {
      await contactService.createContactRequest({ playerId: id, message: contactMessage || undefined });
      setContactStatus('sent');
    } catch (err) {
      console.error('Failed to send contact request:', err);
      setContactStatus('error');
    }
  };

  const footLabel = (foot?: string) => {
    if (!foot) return '--';
    const map: Record<string, string> = {
      'Right': 'يمنى', 'Left': 'يسرى', 'Both': 'كلاهما',
      'right': 'يمنى', 'left': 'يسرى', 'both': 'كلاهما',
      'اليمني': 'يمنى', 'اليسري': 'يسرى', 'كلتاهما': 'كلاهما',
    };
    return map[foot] || foot;
  };

  const positionLabel = (pos?: string) => {
    if (!pos) return '--';
    const map: Record<string, string> = {
      'Goalkeeper': 'حارس', 'CenterBack': 'قلب دفاع', 'RightBack': 'ظهير أيمن',
      'LeftBack': 'ظهير أيسر', 'DefensiveMidfielder': 'وسط دفاعي',
      'CentralMidfielder': 'وسط', 'AttackingMidfielder': 'وسط هجومي',
      'LeftWinger': 'جناح أيسر', 'RightWinger': 'جناح أيمن', 'Striker': 'مهاجم',
    };
    return map[pos] || pos;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-[#2B43A1]" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4" dir="rtl">
        <span className="text-5xl">😔</span>
        <h2 className="text-lg font-bold text-gray-700">{error || 'اللاعب غير موجود'}</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="text-[#2B43A1] text-sm font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>
      </div>
    );
  }

  const primaryPos = player.primaryPosition || player.position;
  const age = player.age || (player.dateOfBirth ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null);

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 pt-2 font-sans" dir="rtl">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2B43A1] font-bold mb-6 cursor-pointer transition-colors"
      >
        <ArrowRight className="w-4 h-4" /> رجوع للقائمة
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="h-2 bg-gradient-to-l from-[#2B43A1] to-[#4F6BDB]" />
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B43A1] to-[#4F6BDB] flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {player.fullName ? player.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1C2C5E]">{player.fullName}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-block bg-[#EBF1FF] text-[#2B43A1] text-[11px] font-bold px-3 py-0.5 rounded-lg">
                    {positionLabel(primaryPos)}
                  </span>
                  {player.currentClub && (
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {player.currentClub}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => id && toggleSavePlayer(String(id))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSaved 
                  ? 'bg-red-50 text-red-500 border border-red-100' 
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'محفوظ' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2B43A1]" /> معلومات أساسية
          </h3>
          <div className="space-y-3">
            {age && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> العمر</span>
                <span className="font-bold text-gray-700">{age} سنة</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> الدولة</span>
              <span className="font-bold text-gray-700">{player.country || player.nationality || '--'}</span>
            </div>
            {player.city && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> المدينة</span>
                <span className="font-bold text-gray-700">{player.city}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5"><Footprints className="w-3.5 h-3.5" /> القدم المفضلة</span>
              <span className="font-bold text-gray-700">{footLabel(player.preferredFoot)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2B43A1]" /> بيانات رياضية
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">المركز الأساسي</span>
              <span className="font-bold text-gray-700">{positionLabel(primaryPos)}</span>
            </div>
            {player.secondaryPosition && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">المركز الثانوي</span>
                <span className="font-bold text-gray-700">{positionLabel(player.secondaryPosition)}</span>
              </div>
            )}
            {player.height && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">الطول</span>
                <span className="font-bold text-gray-700">{player.height} سم</span>
              </div>
            )}
            {player.weight && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">الوزن</span>
                <span className="font-bold text-gray-700">{player.weight} كجم</span>
              </div>
            )}
            {player.currentClub && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">النادي الحالي</span>
                <span className="font-bold text-gray-700">{player.currentClub}</span>
              </div>
            )}
            {player.previousClub && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">النادي السابق</span>
                <span className="font-bold text-gray-700">{player.previousClub}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {(player.bio || player.biography) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-800 text-sm mb-3">نبذة عن اللاعب</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{player.bio || player.biography}</p>
        </div>
      )}

      {/* Contact Request Section - only for scouts */}
      {user?.role === 'scout' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#2B43A1]" /> إرسال طلب تواصل
          </h3>

          {contactStatus === 'sent' ? (
            <div className="bg-green-50 text-green-700 text-xs font-bold p-4 rounded-xl text-center">
              ✅ تم إرسال طلب التواصل بنجاح! سيتم إخطارك عند الرد.
            </div>
          ) : (
            <>
              <textarea 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="اكتب رسالة اختيارية للاعب... (مثال: نود مناقشة فرصة انضمام)"
                className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] resize-none h-20 mb-3 text-right"
              />
              <button 
                onClick={handleSendContactRequest}
                disabled={contactStatus === 'sending'}
                className="bg-gradient-to-l from-[#2B43A1] to-[#3D5BC9] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {contactStatus === 'sending' ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الإرسال...</>
                ) : contactStatus === 'error' ? (
                  'حدث خطأ — حاول مجدداً'
                ) : (
                  <><Send className="w-3.5 h-3.5" /> إرسال طلب تواصل</>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerPublicProfile;

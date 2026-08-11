import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Bot, 
  ShieldAlert, 
  Zap, 
  Eye, 
  Activity, 
  Dumbbell, 
  Footprints, 
  Clock, 
  Star, 
  Trophy,
  UploadCloud,
  Play,
  Plus,
  X
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');

  const firstName = user?.name ? user.name.split(' ')[0] : 'أحمد';

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoName(file.name);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16 text-right font-sans" dir="rtl">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleVideoChange} 
        accept="video/*" 
        className="hidden" 
      />

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xs border border-gray-100">
        <div className="h-40 bg-linear-to-r from-emerald-800 via-teal-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent"></div>
        </div>
        
        <div className="px-4 md:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 font-bold text-sm">الملف الشخصي</span>
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-bold gap-1">
            <button className="px-4 py-2 rounded-lg bg-white text-[#2B43A1] shadow-2xs cursor-pointer">
              ملفي الشخصي
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="px-4 py-2 rounded-lg text-gray-500 hover:text-[#2B43A1] hover:bg-white/60 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" /> Jogo AI
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2B43A1&color=fff&size=128`} 
                  alt={user?.name || "اللاعب"} 
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
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'أحمد الرشيدي'}</h2>
            <p className="text-gray-400 text-xs mb-4 font-medium">مهاجم وسط | الأهلي</p>
            
            <div className="grid grid-cols-2 gap-4 w-full py-3 border-t border-b border-gray-100 text-xs my-2">
              <div>
                <span className="block text-gray-400 text-[11px] mb-0.5">العمر</span>
                <span className="font-bold text-gray-800">24 عاماً</span>
              </div>
              <div className="border-r border-gray-100">
                <span className="block text-gray-400 text-[11px] mb-0.5">الجنسية</span>
                <span className="font-bold text-gray-800">السعودية SA</span>
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

          <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-xs">سجل الفيديوهات</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-[#2B43A1] text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-50 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> رفع جديد
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'مراوغة وتسديد', date: '20 يوليو 2026', duration: '03:18', tag: '74 نقطة', bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop' },
                { title: 'مباراة الشباب vs الاتفاق', date: '18 يوليو 2026', duration: '23:12', tag: '68 نقطة', bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop' },
                { title: 'تدريب في الشارع', date: '15 يوليو 2026', duration: '05:24', tag: '82 نقطة', bg: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=300&auto=format&fit=crop' },
                { title: 'تدريب اللياقة - صباحي', date: '12 يوليو 2026', duration: '28:45', tag: '61 نقطة', bg: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=300&auto=format&fit=crop' },
              ].map((vid, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden h-28 border border-gray-100 group cursor-pointer shadow-2xs">
                  <img src={vid.bg} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                  
                  <span className="absolute top-2 right-2 bg-emerald-500/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                    تم التحليل
                  </span>

                  <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[9px] px-2 py-0.5 rounded-md">
                    {vid.tag}
                  </span>

                  <div className="absolute bottom-2 right-2 left-2 flex justify-between items-end text-white">
                    <div>
                      <h5 className="font-bold text-xs leading-tight mb-0.5">{vid.title}</h5>
                      <span className="text-[10px] text-gray-300 font-medium">{vid.date}</span>
                    </div>
                    <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-200">{vid.duration}</span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-white mr-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-[#F4F6FF] border-2 border-dashed border-[#2B43A1]/30 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center justify-center shadow-2xs relative overflow-hidden transition-all">
            
            {uploadedVideoUrl ? (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-xs font-bold text-[#1C2C5E] truncate max-w-xs">{videoName}</span>
                  <button 
                    onClick={() => { setUploadedVideoUrl(null); setVideoName(''); }}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                    title="حذف الفيديو"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-gray-200">
                  <video src={uploadedVideoUrl} controls className="w-full max-h-96 object-contain" />
                </div>

                <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> تم تجهيز الفيديو للتحليل بواسطة Jogo AI
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#2B43A1] text-white flex items-center justify-center mb-3 shadow-md">
                  <UploadCloud className="w-6 h-6" />
                </div>
                
                <h3 className="font-extrabold text-[#1C2C5E] text-base mb-1">رفع فيديو للتحليل بالذكاء الاصطناعي</h3>
                <p className="text-gray-400 text-xs mb-4 font-medium">ارفع فيديو جديد لتحليل الأداء والحصول على تقرير شامل</p>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#2B43A1] text-white font-bold text-xs px-8 py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-sm cursor-pointer mb-2"
                >
                  اختر ملف فيديو
                </button>
                
                <p className="text-gray-400 text-[10px] font-medium">
                  أو اسحب الملف هنا <br />
                  يدعم MP4, AVI, MOV, MKV | الحد الأقصى 2GB
                </p>
              </>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-gray-400 text-xs font-medium mb-1">درجة الذكاء الاصطناعي</span>
              <span className="text-3xl font-extrabold text-[#2B43A1] mb-2">82</span>
              <span className="bg-blue-50 text-[#2B43A1] text-[10px] font-bold px-3 py-1 rounded-full">متفوق</span>
            </div>

            <div className="bg-[#EBFDF5] p-5 rounded-3xl border border-emerald-100 text-center flex flex-col items-center justify-center">
              <span className="text-emerald-700 text-xs font-medium mb-1">مستوى الأداء</span>
              <span className="text-2xl font-bold text-emerald-800 mb-1">متقدم</span>
              <span className="text-emerald-600 text-[10px]">مستوى الأداء العام</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-gray-400 text-xs font-medium mb-1">آخر تحليل</span>
              <span className="text-lg font-bold text-gray-800 mb-1">19 يوليو 2026</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2B43A1]" /> ملخص الأداء
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">التمرير</span>
                  <span className="text-blue-600 font-extrabold">85</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">السرعة</span>
                  <span className="text-emerald-600 font-extrabold">78</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">المراوغة</span>
                  <span className="text-blue-500 font-extrabold">73</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">الإنهاء</span>
                  <span className="text-red-600 font-extrabold">58</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">الدفاع</span>
                  <span className="text-red-700 font-extrabold">55</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-700 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> نقاط القوة
              </h3>
              <div className="space-y-3">
                {[
                  { title: "دقة التمرير", score: "87", icon: CheckCircle2 },
                  { title: "الرؤية الكروية", score: "84", icon: Eye },
                  { title: "سرعة القرار", score: "81", icon: Zap },
                  { title: "معدل العمل", score: "90", icon: Activity },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-[#EBFDF5]/60 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-emerald-100/50">
                      <span className="font-bold text-emerald-900">{item.score}</span>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <span>{item.title}</span>
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> نقاط الضعف
              </h3>
              <div className="space-y-3">
                {[
                  { title: "القدم الضعيفة", score: "52", icon: Footprints },
                  { title: "الإنهاء", score: "58", icon: Target },
                  { title: "الضربة الرأسية", score: "55", icon: AlertCircle },
                  { title: "القوة البدنية", score: "61", icon: Dumbbell },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-red-50/50 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-red-100/50">
                      <span className="font-bold text-red-700">{item.score}</span>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <span>{item.title}</span>
                        <Icon className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#EEF2FF] p-6 rounded-3xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3 text-[#2B43A1] font-bold text-sm">
              <Bot className="w-5 h-5" /> تحليل الذكاء الاصطناعي
            </div>
            <p className="text-gray-700 text-xs leading-relaxed font-medium mb-4">
              يُظهر {firstName} رؤية تمريرية استثنائية وقدرة على اتخاذ القرار تحت الضغط، إذ يُصنَّف ضمن أفضل 15% للاعبي مركزه من بين جميع المباريات المحللة هذا الموسم.
            </p>
            <div className="bg-white p-4 rounded-2xl border border-indigo-50 text-xs text-gray-600 leading-relaxed font-medium">
              أهداف التحسين الرئيسية هي كفاءة الإنهاء والقوة الجسدية في المنازلات الجوية. يُوصى بخطة تدريبية مكثفة لمدة 4 أسابيع. التحسن المتوقع: <span className="text-[#2B43A1] font-bold">+6 إلى +9 نقاط بحلول نهاية أغسطس 2026</span>.
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-4xl shadow-2xs border border-gray-100/80">
            <div className="flex items-center justify-start gap-2.5 mb-8">
              <h3 className="font-bold text-[#1C2C5E] text-xl">خطة التدريب الشخصية</h3>
              <svg className="w-6 h-6 text-[#2B43A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div className="flex flex-row-reverse justify-between items-center text-sm font-bold mb-4">
                  <span className="text-gray-600">إنجاز الخطة</span>
                  <span className="text-[#2B43A1] text-base">91%</span>
                </div>
                <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden">
                  <div className="bg-[#2B43A1] h-3 rounded-full transition-all duration-500" style={{ width: '91%' }}></div>
                </div>
              </div>

              <div className="bg-[#F5F7FF] p-6 rounded-2xl border border-blue-50/50 flex flex-row-reverse justify-between items-center">
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-medium block mb-1">الهدف الأسبوعي</span>
                  <span className="text-sm font-bold text-[#1C2C5E]">تحسين الإنهاء واللياقة</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-[#2B43A1] font-bold block mb-1">الهدف المستهدف</span>
                  <div className="text-2xl font-extrabold text-[#2B43A1]">
                    <span className="text-gray-300 font-normal text-base">/ 100</span> 91
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: "تدريبات الإنهاء (1 ضد 1 مع الحارس)", time: "الإثنين / الأربعاء - 45 دقيقة", tag: "+4 إنهاء" },
                { title: "دائرة دقة التمرير", time: "الثلاثاء / الخميس - 30 دقيقة", tag: "+2 تمرير" },
                { title: "جري فترات عالي الكثافة (HIIT)", time: "الجمعة - 25 دقيقة", tag: "+3 سرعة" },
                { title: "محاكاة مباراة كاملة", time: "السبت - 90 دقيقة", tag: "+1 إجمالي" },
              ].map((item, index) => (
                <div key={index} className="border border-gray-100/90 p-4 rounded-2xl flex flex-row-reverse justify-between items-center hover:border-blue-100 transition-all bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4 className="font-bold text-sm text-[#1C2C5E] mb-0.5">{item.title}</h4>
                      <p className="text-xs text-gray-400 font-medium">{item.time}</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2B43A1] shrink-0"></span>
                  </div>

                  <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#EBFDF5] text-[#10B981]">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
import { useNavigate } from 'react-router-dom';
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
  Trophy 
} from 'lucide-react';
import playerAvatar from '../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16 text-right" dir="rtl">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-44 bg-linear-to-r from-emerald-800 via-teal-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent"></div>
        </div>
        
        <div className="px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 font-bold text-sm">الملف الشخصي</span>
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-bold gap-1">
            <button className="px-4 py-2 rounded-lg bg-white text-[#2B43A1] shadow-sm cursor-pointer">
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
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img 
                  src={playerAvatar} 
                  alt="أحمد الرشيدي" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <button 
                onClick={() => navigate('/chat')}
                className="absolute bottom-0 left-0 bg-[#2B43A1] text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                title="تحدث مع الذكاء الاصطناعي"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">أحمد الرشيدي</h2>
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
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-gray-400 text-xs font-medium mb-1">درجة الذكاء الاصطناعي</span>
              <span className="text-3xl font-extrabold text-[#2B43A1] mb-2">82</span>
              <span className="bg-blue-50 text-[#2B43A1] text-[10px] font-bold px-3 py-1 rounded-full">متفوق</span>
            </div>

            <div className="bg-[#EBFDF5] p-5 rounded-3xl border border-emerald-100 text-center flex flex-col items-center justify-center">
              <span className="text-emerald-700 text-xs font-medium mb-1">مستوى الأداء</span>
              <span className="text-2xl font-bold text-emerald-800 mb-1">متقدم</span>
              <span className="text-emerald-600 text-[10px]">مستوى الأداء العام</span>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-gray-400 text-xs font-medium mb-1">آخر تحليل</span>
              <span className="text-lg font-bold text-gray-800 mb-1">19 يوليو 2026</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
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

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
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
          يُظهر أحمد رؤية تمريرية استثنائية وقدرة على اتخاذ القرار تحت الضغط، إذ يُصنَّف ضمن أفضل 15% للاعبي مركزه من بين جميع المباريات المحللة هذا الموسم.
        </p>
        <div className="bg-white p-4 rounded-2xl border border-indigo-50 text-xs text-gray-600 leading-relaxed font-medium">
          أهداف التحسين الرئيسية هي كفاءة الإنهاء والقوة الجسدية في المنازلات الجوية. يُوصى بخطة تدريبية مكثفة لمدة 4 أسابيع. التحسن المتوقع: <span className="text-[#2B43A1] font-bold">+6 إلى +9 نقاط بحلول نهاية أغسطس 2026</span>.
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2B43A1]" /> مسار الأداء
          </h3>
        </div>
        
        <div className="relative w-full pt-4 pb-2 px-4">
          <div className="relative h-44 w-full">
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
              <span>100</span>
            </div>
            <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
              <span>80</span>
            </div>
            <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
              <span>65</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 border-b border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
              <span>50</span>
            </div>

            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
              <path
                d="M 20,100 Q 120,95 140,92 T 265,102 T 385,70 T 480,50"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3"
              />
              <circle cx="20" cy="100" r="5" fill="white" stroke="#8B5CF6" strokeWidth="3" />
              <circle cx="140" cy="92" r="5" fill="white" stroke="#8B5CF6" strokeWidth="3" />
              <circle cx="265" cy="102" r="5" fill="white" stroke="#8B5CF6" strokeWidth="3" />
              <circle cx="385" cy="70" r="5" fill="white" stroke="#8B5CF6" strokeWidth="3" />
              <circle cx="480" cy="50" r="5" fill="white" stroke="#8B5CF6" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex justify-between text-xs text-gray-400 mt-4 px-2 font-medium">
            <span>مار</span>
            <span>أبر</span>
            <span>مايو</span>
            <span>يون</span>
            <span>يول</span>
          </div>

          <div className="flex justify-center items-center gap-6 mt-6 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></span> الإجمالي
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 bg-white"></span> التمرير
            </div>
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-white"></span> السرعة
            </div>
            <div className="flex items-center gap-1.5 text-purple-600">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-600 bg-white"></span> المراوغة
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-4xl shadow-sm border border-gray-100/80">
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
  );
};

export default Profile;
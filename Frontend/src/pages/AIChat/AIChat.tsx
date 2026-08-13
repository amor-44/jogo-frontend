import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bot,
  Sparkles,
  ArrowLeft,
  Cpu,
  Video,
  BarChart3,
  Zap,
} from 'lucide-react';

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : 'لاعبنا';

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6.5rem)] w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 -mb-4 md:-mb-8" dir="rtl">
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto px-6 py-10">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2B43A1] to-[#3D5BC9] text-white flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1C2C5E] mb-2">
          أهلاً بك يا <span className="text-[#2B43A1]">{firstName}</span> 👋
        </h2>
        <h3 className="text-base md:text-lg font-bold text-gray-600 mb-4">
          مساعد Jogo الذكي قيد التطوير 🚀
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed font-medium mb-8 max-w-md">
          نعمل حالياً على تطوير مساعد الذكاء الاصطناعي للمحادثة المباشرة.
          في الوقت الحالي، يمكنك استخدام <strong className="text-[#2B43A1]">تحليل الفيديو بالذكاء الاصطناعي</strong> من صفحة ملفك الشخصي للحصول على تقارير فنية شاملة.
        </p>

        {/* Feature Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: Video, title: 'رفع فيديو', desc: 'ارفع فيديو مباراتك أو تدريبك' },
            { icon: Cpu, title: 'تحليل ذكي', desc: 'تحليل فوري بالذكاء الاصطناعي' },
            { icon: BarChart3, title: 'تقرير شامل', desc: 'نقاط قوة وضعف وخطة تدريب' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-[#F8F9FE] border border-gray-100 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2B43A1] flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#1C2C5E] mb-1">{feature.title}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/profile')}
          className="bg-gradient-to-l from-[#2B43A1] to-[#3D5BC9] hover:opacity-95 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mx-auto"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>انتقل لتحليل الفيديو الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-gray-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>ميزة المحادثة الذكية — قريباً إن شاء الله</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

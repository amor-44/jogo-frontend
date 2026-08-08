import { useNavigate } from 'react-router-dom';
import loginBg from '../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-4xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl shadow-2xl">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-2xl font-bold text-2xl flex items-center gap-2 mb-8 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Jogo
          </div>

          <h1 className="text-3xl font-bold text-[#1C2C5E] mb-4">
            مرحبًا بك في <span className="text-[#2B43A1]">JOGO</span>
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed max-w-md mb-8 font-medium">
            منصة متكاملة تعتمد على الذكاء الاصطناعي لتحليل أداء لاعبي كرة القدم من خلال الفيديو والإحصائيات المتقدمة، بهدف تمكين اللاعبين من بناء ملف احترافي يعكس مستواهم الحقيقي، ومساعدة الأندية والكشافين على اكتشاف المواهب وتقييمها قبل التعاقد.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full max-w-xs bg-[#2B43A1] text-white py-3.5 rounded-xl font-bold hover:bg-[#1C2C5E] transition-colors shadow-md cursor-pointer"
          >
            ابدأ الآن
          </button>
        </div>

        <div className="w-full md:w-1/2 bg-[#1d4ed8] p-4 hidden md:flex items-center justify-center">
          <div className="w-full h-full rounded-3xl overflow-hidden relative border-2 border-white/10 shadow-lg">
            <img 
              src={loginBg} 
              alt="Jogo Analytics" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
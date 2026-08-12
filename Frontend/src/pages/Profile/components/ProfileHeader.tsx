import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';

export const ProfileHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xs border border-gray-100 font-sans">
      <div className="h-36 sm:h-44 bg-linear-to-r from-[#0D1B2A] via-[#1B263B] to-[#2B43A1] relative overflow-hidden flex items-center justify-between px-4 sm:px-6 md:px-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#2B43A1]/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 text-white text-right">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold text-blue-200 mb-2 border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="truncate">منصة Jogo للتحليل الرياضي المتقدم</span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
            الملف الرياضي للاعب
          </h1>
        </div>
      </div>
      
      <div className="px-4 sm:px-8 py-3.5 flex flex-row justify-between items-center gap-2 bg-white border-t border-gray-50 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-800 font-bold text-xs sm:text-sm truncate">الملف الشخصي والتحليلات</span>
        </div>

        <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-bold gap-1 shrink-0 ml-auto sm:ml-0">
          <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white text-[#2B43A1] shadow-2xs cursor-pointer text-xs whitespace-nowrap">
            ملفي الشخصي
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-gray-500 hover:text-[#2B43A1] hover:bg-white/60 transition-all cursor-pointer flex items-center gap-1.5 text-xs whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 shrink-0" /> Jogo AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';

export const ProfileHeader = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ProfileHeader;

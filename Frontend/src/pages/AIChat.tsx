import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Send, 
  Plus, 
  Search, 
  MessageSquare, 
  Zap, 
  Settings, 
  LayoutGrid,
  Bot,
  Navigation
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'profile'>('ai');

  const firstName = user?.name ? user.name.split(' ')[0] : 'لاعبنا';

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: text
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `بناءً على تحليل بياناتك الأخيرة، ${text.includes('مباراة') ? 'لاحظت تحسناً كبيراً في دقة التمرير بنسبة 85% مقارنة بالمباراة السابقة.' : 'تم تسجيل طلبك ويمكننا العمل على خطة تدريبية مخصصة لهذا الهدف.'}`
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6.5rem)] w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 -mb-4 md:-mb-8" dir="rtl">
      <div className="bg-white p-3 px-4 md:p-4 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div className="font-bold text-[#1C2C5E] text-base md:text-lg">
          Jogo AI
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100/80 p-1 rounded-2xl text-xs font-bold gap-1">
            <button 
              onClick={() => { setActiveTab('ai'); }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-white text-[#2B43A1] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Jogo AI
            </button>

            <button 
              onClick={() => { setActiveTab('profile'); navigate('/profile'); }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'bg-white text-[#2B43A1] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> ملفي الشخصي
            </button>
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
              alt={user?.name || "اللاعب"} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        <div className="hidden md:flex w-72 border-l border-gray-100 flex-col p-4 bg-white justify-between shrink-0 h-full">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-center gap-2 bg-[#2B43A1] text-white py-2.5 rounded-2xl font-bold text-lg mb-4 shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                Jogo
              </div>

              <button 
                onClick={() => setChatHistory([])}
                className="w-full flex items-center justify-center gap-2 border border-[#2B43A1]/30 text-[#2B43A1] py-2.5 rounded-2xl font-bold text-xs mb-3 hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <span>محادثة جديدة</span>
                <Plus className="w-4 h-4" />
              </button>

              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="ابحث في المحادثات..." 
                  className="w-full bg-gray-50 border border-gray-100 text-gray-600 py-2 pr-8 pl-3 rounded-xl text-[11px] outline-none text-right"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1.5">اليوم</span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center p-2 rounded-xl bg-blue-50/60 text-[#2B43A1] text-xs font-bold cursor-pointer">
                      <span className="truncate">تحليل مباراة ضد الأهلي</span>
                      <span className="text-[9px] text-gray-400 font-normal">الآن</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 text-gray-600 text-xs cursor-pointer">
                      <span className="truncate">تحسين الإنهاء</span>
                      <span className="text-[9px] text-gray-400">الأمس</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1.5">الأمس</span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 text-gray-600 text-xs cursor-pointer">
                      <span className="truncate">مقارنة مباراة 4 مع مباراة 7</span>
                      <span className="text-[9px] text-gray-400">الأمس</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 text-gray-600 text-xs cursor-pointer">
                      <span className="truncate">تحسين التمرير</span>
                      <span className="text-[9px] text-gray-400">الأمس</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">{user?.name || 'اللاعب'}</span>
              </div>
              <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between p-4 md:p-8 bg-[#FAFAFC] relative overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-[#1C2C5E] mb-3 flex items-center justify-center gap-2">
                  مرحباً {firstName} <span>👋</span>
                </h1>
                <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed font-medium">
                  مرحباً بعودتك إلى مدربك الذكي. ارفع مباراة أو اسأل أي شيء عن أدائك.
                </p>
              </div>

              <div className="w-full bg-white border border-gray-200/80 rounded-3xl p-4 shadow-xs mb-8 relative">
                <textarea
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="راسل مدربك الذكي..."
                  className="w-full bg-transparent outline-none text-xs text-gray-700 resize-none pr-2 pl-12 text-right"
                />
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <button className="text-gray-400 hover:text-[#2B43A1] transition-colors p-1 cursor-pointer">
                    <Plus className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => handleSendMessage()}
                    className="bg-[#2B43A1] text-white p-2.5 rounded-full hover:bg-blue-900 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 text-white fill-white stroke-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                <button 
                  onClick={() => handlePromptClick('قارن مباريات سابقة')}
                  className="bg-[#EEF2FF] border border-blue-100 text-[#2B43A1] p-3.5 rounded-2xl text-xs font-bold hover:bg-blue-100/80 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>قارن مباريات سابقة</span>
                  <Zap className="w-3.5 h-3.5 text-[#2B43A1]" />
                </button>

                <button 
                  onClick={() => handlePromptClick('حلل مهاراتي الأخيرة')}
                  className="bg-white border border-gray-100 text-gray-700 p-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>حلل مهاراتي الأخيرة</span>
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <button 
                  onClick={() => handlePromptClick('أنشئ خطة تدريب أسبوعية')}
                  className="bg-white border border-gray-100 text-gray-700 p-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>أنشئ خطة تدريب أسبوعية</span>
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <button 
                  onClick={() => handlePromptClick('أظهر نقاط ضعفي')}
                  className="bg-white border border-gray-100 text-gray-700 p-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>أظهر نقاط ضعفي</span>
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <button 
                  onClick={() => handlePromptClick('حسن التسديد')}
                  className="bg-white border border-gray-100 text-gray-700 p-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>حسن التسديد</span>
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <button 
                  onClick={() => handlePromptClick('حسن التمرير')}
                  className="bg-white border border-gray-100 text-gray-700 p-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>حسن التمرير</span>
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between w-full max-w-3xl mx-auto">
              <div className="space-y-4 overflow-y-auto mb-6 pr-2">
                {chatHistory.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${msg.sender === 'user' ? 'bg-[#2B43A1]' : 'bg-emerald-600'}`}>
                      {msg.sender === 'user' ? firstName[0] : <Bot className="w-4 h-4" />}
                    </div>
                    
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-lg ${
                      msg.sender === 'user' 
                        ? 'bg-[#2B43A1] text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full bg-white border border-gray-200 rounded-2xl p-2 flex items-center gap-2 shadow-xs">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-transparent outline-none text-xs text-gray-700 px-3 text-right"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="bg-[#2B43A1] text-white p-2.5 rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
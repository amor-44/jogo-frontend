import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getFullImageUrl } from '../../utils/url';
import type { Message } from '../../types';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Zap, 
  Settings, 
  LayoutGrid,
  Bot,
  Navigation
} from 'lucide-react';

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

    const userMsgId = chatHistory.length + 1;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: text
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      const aiMsg: Message = {
        id: userMsgId + 1,
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
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shadow-2xs z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#2B43A1] to-blue-500 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm md:text-base font-black text-[#1C2C5E]">مساعد Jogo الذكي</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 font-medium">تحليل الأداء الفني والبدني المباشر</p>
          </div>
        </div>

        <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-bold gap-1">
          <button 
            onClick={() => { setActiveTab('ai'); }}
            className={`px-3 md:px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Jogo AI
          </button>
          <button 
            onClick={() => { setActiveTab('profile'); navigate('/profile'); }}
            className={`px-3 md:px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ملفي الشخصي
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 md:w-72 bg-gray-50/70 border-l border-gray-100 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <button 
              onClick={() => setChatHistory([])}
              className="w-full bg-white border border-gray-200 text-[#1C2C5E] hover:border-[#2B43A1] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#2B43A1]" /> محادثة جديدة
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 px-2 block mb-2">سجل التحليلات الأخيرة</span>
              
              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-2 text-xs font-semibold text-[#1C2C5E] cursor-pointer hover:border-blue-200">
                <MessageSquare className="w-4 h-4 text-[#2B43A1] shrink-0" />
                <span className="truncate">تحليل مباراة الشباب الأخيرة</span>
              </div>

              <div className="p-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">خطة تحسين سرعة اتخاذ القرار</span>
              </div>

              <div className="p-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">مقارنة التمريرات مع لاعبي الدوري</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
              <img 
                src={getFullImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2B43A1&color=fff`} 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1C2C5E] truncate">{user?.name || user?.email || 'مستخدم Jogo'}</p>
              <p className="text-[10px] text-gray-400 font-medium">{user?.role === 'scout' ? 'حساب كشاف' : 'حساب لاعب'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between bg-white relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center justify-center text-center my-4 md:my-6 max-w-xl mx-auto">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-[#EEF2FF] text-[#2B43A1] flex items-center justify-center mb-3 shadow-xs">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-[#1C2C5E] mb-1">
                أهلاً بك يا <span className="text-[#2B43A1]">{firstName}</span> في Jogo AI ⚽
              </h3>
              <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed">
                أنا مدربك الذكي الشخصي. كيف يمكنني مساعدتك في تطوير مهاراتك اليوم؟
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#F8F9FE] border border-gray-100 text-gray-800 p-4 rounded-2xl rounded-tr-xs text-xs md:text-sm max-w-lg leading-relaxed shadow-2xs font-medium text-right">
                  مرحباً {firstName}! لقد قمت بمراجعة آخر فيديو تدريبي لك. لاحظت تحسناً ملحوظاً بنسبة 8% في دقة التمريرات الطويلة. ما الذي ترغب في التركيز عليه خلال تمرين اليوم؟
                </div>
              </div>

              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs md:text-sm max-w-lg leading-relaxed shadow-2xs font-medium text-right ${
                    msg.sender === 'user' 
                      ? 'bg-[#2B43A1] text-white rounded-tl-xs' 
                      : 'bg-[#F8F9FE] border border-gray-100 text-gray-800 rounded-tr-xs'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {chatHistory.length === 0 && (
              <div className="max-w-2xl mx-auto pt-2">
                <span className="text-xs font-bold text-gray-400 mb-3 block text-right">أسئلة مقترحة لبدء التحليل:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: "ما هي أكثر نقاط ضعفي في التمرير؟", icon: Zap },
                    { title: "اعطني خطة أسبوعية لزيادة سرعتي", icon: Navigation },
                    { title: "كيف كان معدل أدائي مقارنة بآخر تمرين؟", icon: LayoutGrid },
                    { title: "نصائح ذكية للتمركز الدفاعي الجيد", icon: Settings },
                  ].map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(prompt.title)}
                        className="bg-white border border-gray-200 hover:border-[#2B43A1] p-3 rounded-2xl text-right text-xs font-bold text-[#1C2C5E] flex items-center justify-between gap-2 shadow-2xs hover:bg-blue-50/30 transition-all cursor-pointer group"
                      >
                        <span className="truncate group-hover:text-[#2B43A1]">{prompt.title}</span>
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#2B43A1] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="max-w-3xl mx-auto relative flex items-center"
            >
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اسأل Jogo AI عن أدائك، تمريراتك، أو خطتك البدنية..."
                className="w-full bg-[#F8F9FE] border border-gray-200 rounded-2xl py-3.5 pr-4 pl-14 text-xs md:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#2B43A1] focus:bg-white transition-all shadow-2xs"
              />
              <button 
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#2B43A1] hover:bg-blue-900 text-white p-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
              الذكاء الاصطناعي يقوم بتحليل البيانات بناءً على الفيديوهات المرفوعة وتاريخك الرياضي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

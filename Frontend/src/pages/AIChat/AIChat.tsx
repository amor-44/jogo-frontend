import { useState, useEffect, useRef } from 'react';
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
  Navigation,
  Trash2,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

const DEFAULT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'تحليل مباراة الشباب الأخيرة',
    createdAt: 'منذ ساعتين',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'كيف كان معدل أدائي وتمريراتي في مباراة الشباب الأخيرة؟'
      },
      {
        id: 2,
        sender: 'ai',
        text: 'مرحباً! قمت بتحليل أدائك بدقة في مباراة الشباب: \n\n🎯 **دقة التمريرات:** 87% (42 تمريرة ناجحة من أصل 48).\n⚡ **صناعة الفرص:** 4 تمريرات مفتاحية في الثلث الهجومي.\n🛡️ **استخلاص الكرة:** فزت بـ 6 التحامات من أصل 8.\n\n⚠️ **نقطة للتطوير:** الاحتفاظ الزائد بالكرة تحت الضغط الدفاعي أدى لفقدانها مرتين.\n📊 **التقييم الإجمالي:** 82 / 100 — أداء مميز جداً ويؤهلك للترشيح الأساسي.'
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'خطة تحسين سرعة اتخاذ القرار',
    createdAt: 'أمس',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'محتاج خطة تدريبية عملية ومكثفة لتحسين سرعة اتخاذ القرار في خط الوسط.'
      },
      {
        id: 2,
        sender: 'ai',
        text: 'إليك خطة الـ 3 أسابيع المقترحة من Jogo AI لتسريع اتخاذ القرار:\n\n1️⃣ **المسح الميداني (Pre-Scanning):** تدريب على تدوير الرأس مرتين على الأقل قبل استلام الكرة بـ 0.5 ثانية.\n2️⃣ **تدريبات الروندو السريع (1-2 Touch):** مجموعات 4 ضد 2 بلمسة واحدة فقط لتقليل زمن التصرف.\n3️⃣ **التمرير تحت الإشارات البصرية:** استخدام أقماع ملونة أو إشارات مدرب لتحديد جهة التمرير قبل الاستلام مباشرة.\n\n📅 التطبيق: 25 دقيقة بعد كل حصة تدريبية أيام (الإثنين - الأربعاء - السبت).'
      }
    ]
  },
  {
    id: 'conv-3',
    title: 'مقارنة التمريرات مع لاعبي الدوري',
    createdAt: 'منذ 3 أيام',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'كيف تقارن نسبة دقة تمريراتي بمتوسط لاعبي خط الوسط في الدوري؟'
      },
      {
        id: 2,
        sender: 'ai',
        text: 'مقارنتك الإحصائية مع لاعبي خط الوسط تحت 21 سنة في الدوري:\n\n📈 **دقة التمرير لديك:** 87% (متوسط الدوري 79% — أنت في أعلى 15%).\n🚀 **التمريرات التقدمية للأمام:** 6.4 لكل 90 دقيقة (متوسط الدوري 4.8).\n⭐ **دقة الكرات الطويلة:** 74% (متوسط الدوري 65%).\n\n💡 استمرارك على هذا المعدل سيعزز ظهورك للكشافين بنسبة تفوق 35% خلال الجولات القادمة.'
      }
    ]
  }
];

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('jogo_ai_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load conversations from storage:', e);
    }
    return DEFAULT_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1');
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'profile'>('ai');

  const firstName = user?.name ? user.name.split(' ')[0] : 'لاعبنا';

  // Persist conversations in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jogo_ai_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const currentMessages = activeConversation ? activeConversation.messages : [];

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isAiTyping]);

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setInputMessage('');
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeConvId === id) {
        setActiveConvId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const generateSmartResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('تمرير') || lower.includes('pass')) {
      return `تحليل دقة التمرير لـ ${firstName}: معدل دقة تمريراتك الحالي يصل إلى 87%. نوصي بالتركيز على التمريرات البينية السريعة في المساحات الضيقة وتوسيع زاوية الرؤية قبل استلام الكرة.`;
    }
    if (lower.includes('سرع') || lower.includes('speed') || lower.includes('لياق')) {
      return `الخطة البدنية المقترحة: لزيادة السرعة الانفجارية والرشاقة، ركّز على تدريبات العدو القصير (5-10 أمتار مع تغيير الاتجاه)، وتدريبات القفز التوافقي (Plyometrics) مرتين أسبوعياً.`;
    }
    if (lower.includes('تمركز') || lower.includes('position') || lower.includes('دفاع')) {
      return `نصائح التمركز التكتيكي: راقب دائماً الخط الفاصل بين قلب الدفاع والظهير، وحافظ على مسافة 10-15 متراً كخيار تمرير دائم لزملائك، مع التراجع السريع عند فقدان الاستحواذ.`;
    }
    if (lower.includes('قرار') || lower.includes('decision')) {
      return `لتسريع اتخاذ القرار: اعتمد قاعدة "Scan, Plan, Execute". امسح الملعب قبل وصول الكرة، حدد خيارين مسبقاً، ونفّذ التمرير أو المراوغة بأقل من لمستين.`;
    }
    return `بناءً على سجل أدائك وفيديوهاتك المرفوعة في منصة Jogo: تم تسجيل استفسارك وسنعمل على تحليل هذا الجانب في تقاريرك القادمة. هل ترغب في وضع خطة تدريبية مخصصة لهذا الهدف؟`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (!textToSend) setInputMessage('');
    setIsAiTyping(true);

    let targetConvId = activeConvId;

    // If starting a brand new conversation
    if (!targetConvId) {
      const newId = `conv-${conversations.length + 1}`;
      const titleSnippet = text.length > 32 ? text.slice(0, 32) + '...' : text;
      const newConv: ChatConversation = {
        id: newId,
        title: titleSnippet,
        createdAt: 'الآن',
        messages: [{ id: 1, sender: 'user', text }]
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newId);
      targetConvId = newId;

      setTimeout(() => {
        const aiResponseText = generateSmartResponse(text);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newId
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    { id: 2, sender: 'ai', text: aiResponseText }
                  ]
                }
              : conv
          )
        );
        setIsAiTyping(false);
      }, 700);
      return;
    }

    // Appending to an existing conversation
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) return conv;
        const nextUserMsgId = conv.messages.length + 1;
        return {
          ...conv,
          messages: [...conv.messages, { id: nextUserMsgId, sender: 'user', text }]
        };
      })
    );

    setTimeout(() => {
      const aiResponseText = generateSmartResponse(text);
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) return conv;
          const nextAiMsgId = conv.messages.length + 1;
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { id: nextAiMsgId, sender: 'ai', text: aiResponseText }
            ]
          };
        })
      );
      setIsAiTyping(false);
    }, 700);
  };

  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6.5rem)] w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 -mb-4 md:-mb-8" dir="rtl">
      {/* Header */}
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

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 md:w-72 bg-gray-50/80 border-l border-gray-100 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-4 overflow-y-auto pr-0.5">
            <button 
              onClick={handleStartNewChat}
              className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
                activeConvId === null
                  ? 'bg-[#2B43A1] text-white'
                  : 'bg-white border border-gray-200 text-[#1C2C5E] hover:border-[#2B43A1] hover:bg-blue-50/50'
              }`}
            >
              <Plus className={`w-4 h-4 ${activeConvId === null ? 'text-white' : 'text-[#2B43A1]'}`} /> محادثة جديدة
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 px-2 block mb-2">سجل التحليلات الأخيرة</span>
              
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-white text-[#1C2C5E] border border-blue-200 shadow-2xs' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#1C2C5E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2B43A1]' : 'text-gray-400 group-hover:text-[#2B43A1]'}`} />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="حذف المحادثة"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 text-gray-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {conversations.length === 0 && (
                <p className="text-[11px] text-gray-400 text-center py-4">لا توجد محادثات سابقة</p>
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3 mt-4">
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col justify-between bg-white relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Header greeting if new conversation or empty */}
            {currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center my-6 md:my-10 max-w-xl mx-auto">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-[#EEF2FF] text-[#2B43A1] flex items-center justify-center mb-3 shadow-xs">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1C2C5E] mb-1">
                  أهلاً بك يا <span className="text-[#2B43A1]">{firstName}</span> في Jogo AI ⚽
                </h3>
                <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mb-6">
                  أنا مساعدك الكروي الذكي. اسألني عن أدائك، تمريراتك، تحركاتك، أو خطتك التدريبية القادمة.
                </p>

                {/* Prompt Cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-right">
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
                        className="bg-[#F8F9FE] border border-gray-100 hover:border-[#2B43A1] p-3.5 rounded-2xl text-right text-xs font-bold text-[#1C2C5E] flex items-center justify-between gap-2 shadow-2xs hover:bg-blue-50/40 transition-all cursor-pointer group"
                      >
                        <span className="truncate group-hover:text-[#2B43A1]">{prompt.title}</span>
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#2B43A1] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4 pt-2">
                {currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`p-4 rounded-2xl text-xs md:text-sm max-w-xl leading-relaxed shadow-2xs font-medium whitespace-pre-line text-right ${
                      msg.sender === 'user' 
                        ? 'bg-[#2B43A1] text-white rounded-tl-xs' 
                        : 'bg-[#F8F9FE] border border-gray-100 text-gray-800 rounded-tr-xs'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1C2C5E] flex items-center justify-center shrink-0 font-extrabold text-xs mt-1">
                        {firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#F8F9FE] border border-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-tr-xs text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2B43A1]" />
                      <span>جاري تحليل البيانات وصياغة الإجابة...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Footer */}
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
                disabled={!inputMessage.trim() || isAiTyping}
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


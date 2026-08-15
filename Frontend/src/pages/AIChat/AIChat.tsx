import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bot, Send, Sparkles, ArrowRight, Loader2, User as UserIcon } from 'lucide-react';
// DEMO_MODE: Mock responses for MVP demo — replace with real API call when AI chat is ready
import { MOCK_CHAT_RESPONSES } from '../../data/mockAiData';

interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
}

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(2); // starts at 2; welcome message is id=1

  const firstName = user?.name ? user.name.split(' ')[0] : 'لاعبنا';

  // Read context from localStorage (set by Profile page after video analysis)
  // DEMO_MODE: Default to 'shooting_form_issue' if no context found
  const context = localStorage.getItem('selected_ai_context') || 'shooting_form_issue';
  const contextData = MOCK_CHAT_RESPONSES[context] || MOCK_CHAT_RESPONSES['shooting_form_issue'];
  const quickReplies = Object.keys(contextData.answers);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: contextData.welcome },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll on every new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { id: msgIdRef.current++, sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // DEMO_MODE: Simulate AI response delay
    // When real API is ready: replace this block with an actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const answer =
      contextData.answers[trimmed] ||
      'جرب تسجيل فيديو جديد لمباراتك وحمّله في ملفك الشخصي لأحللها لك بدقة أكبر. 💪';

    const aiMsg: ChatMessage = { id: msgIdRef.current++, sender: 'ai', text: answer };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    // END DEMO_MODE
  };

  const handleQuickReply = (q: string) => sendMessage(q);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(inputValue);
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6.5rem)] w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 -mb-4 md:-mb-8"
      dir="rtl"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#2B43A1] to-[#3D5BC9] text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1C2C5E] leading-tight">كابتن Jogo الذكي</h2>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              متاح الآن
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            <Sparkles className="w-3 h-3" />
            <span>JogoAI</span>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2B43A1] hover:bg-[#EEF2FF] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">رفع فيديو</span>
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F9FE]">
        {messages.map((msg) =>
          msg.sender === 'ai' ? (
            <div key={msg.id} className="flex items-end gap-2 justify-end">
              <div className="max-w-[80%] bg-white border border-gray-100 text-gray-800 text-xs font-medium leading-relaxed px-4 py-3 rounded-2xl rounded-bl-sm shadow-xs">
                {msg.text}
              </div>
              <div className="w-7 h-7 rounded-xl bg-linear-to-br from-[#2B43A1] to-[#3D5BC9] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[80%] bg-[#2B43A1] text-white text-xs font-medium leading-relaxed px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                {msg.text}
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 justify-end">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B43A1] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B43A1] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B43A1] animate-bounce [animation-delay:300ms]" />
            </div>
            <div className="w-7 h-7 rounded-xl bg-linear-to-br from-[#2B43A1] to-[#3D5BC9] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Replies ──────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-2 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 mb-2">أسئلة مقترحة:</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickReply(q)}
              disabled={isTyping}
              className="shrink-0 text-[11px] font-bold text-[#2B43A1] bg-[#EEF2FF] hover:bg-[#2B43A1] hover:text-white border border-[#2B43A1]/20 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ──────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 bg-[#F8F9FE] border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-[#2B43A1] focus-within:ring-2 focus-within:ring-[#2B43A1]/10 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`اكتب سؤالك يا ${firstName}...`}
            disabled={isTyping}
            className="flex-1 bg-transparent text-xs font-medium text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="w-8 h-8 rounded-xl bg-[#2B43A1] text-white flex items-center justify-center hover:bg-[#3D5BC9] transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
        <p className="text-[9px] text-gray-300 font-medium text-center mt-2">
          مساعد Jogo الذكي · ردوده مبنية على تحليل أدائك الأخير
        </p>
      </div>
    </div>
  );
};

export default AIChat;

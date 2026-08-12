import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Bell, Menu } from 'lucide-react';
import playerAvatar from '../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';
import type { TopNavProps } from '../types';

const TopNav = ({ onHamburgerClick }: TopNavProps) => {
  const { user, notifications, unreadCount, markAllAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 md:h-20 bg-white shadow-sm flex items-center px-3 sm:px-4 md:px-8 relative z-30 justify-between gap-2" dir="rtl">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onHamburgerClick}
          className="block lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-600 hover:text-[#2B43A1] hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-[#2B43A1] font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
          الرئيسية
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative shrink-0" ref={dropdownRef}>
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-gray-600 hover:text-[#2B43A1] transition relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-center"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 text-right z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                <h4 className="font-bold text-xs text-gray-800">الإشعارات ({unreadCount})</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-[#2B43A1] font-bold hover:underline cursor-pointer">
                    تحديد الكل كقروء
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        item.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50/60 font-bold hover:bg-blue-100/50'
                      }`}
                    >
                      <p className="text-gray-800 font-semibold">{item.title}</p>
                      <p className="text-gray-500 text-[10px] truncate">{item.desc}</p>
                      <span className="text-[9px] text-gray-400 block mt-1">{item.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-400 py-4">لا توجد إشعارات جديدة</p>
                )}
              </div>

              <button 
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full text-center text-xs font-bold text-[#2B43A1] pt-3 border-t border-gray-50 mt-2 block hover:underline cursor-pointer"
              >
                عرض كل الإشعارات
              </button>
            </div>
          )}
        </div>

        <div 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shadow-xs shrink-0"
        >
          <img 
            src={playerAvatar} 
            alt={user?.name || "المستخدم"} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings } from 'lucide-react';
import type { SidebarProps } from '../types';
import { getFullImageUrl } from '../utils/url';

const Sidebar = ({ isMobileOpen = false, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isClub = user?.role === 'scout';
  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div>
        <div className="p-6 flex justify-center">
          <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-xl font-bold text-lg flex items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Jogo
          </div>
        </div>

        <nav className="px-4 flex flex-col gap-1">
          <p className="text-gray-700 text-sm font-semibold mb-2 pr-4">القائمة</p>
          
          <Link 
            onClick={handleLinkClick} 
            to={isClub ? "/dashboard" : "/home"} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard') || isActive('/home') || isActive('/') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            الرئيسية
          </Link>
          
          <Link 
            onClick={handleLinkClick} 
            to="/search" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/search') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            البحث عن اللاعبين
          </Link>

          <Link 
            onClick={handleLinkClick} 
            to="/suggested" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/suggested') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            اللاعبون المقترحون
          </Link>

          <Link 
            onClick={handleLinkClick} 
            to="/saved" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/saved') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            اللاعبون المحفوظون
          </Link>

          {/* تظهر فقط للاعبين وتختفي نهائياً إذا كان المسجل نادي */}
          {!isClub && (
            <>
              <Link 
                onClick={handleLinkClick} 
                to="/chat" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/chat') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                Jogo AI (الشات)
              </Link>

              <Link 
                onClick={handleLinkClick} 
                to="/profile" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/profile') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                الملف الشخصي
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
        <Link 
          onClick={handleLinkClick}
          to="/settings" 
          className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-800 text-xs font-semibold hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" /> الإعدادات
        </Link>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> تسجيل خروج
        </button>

        <div className="mt-2 flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-white">
            {isClub ? (
              <img 
                src={getFullImageUrl(user?.avatar) || "https://upload.wikimedia.org/wikipedia/ar/7/70/Al-Ittihad_Saudi_Club_logo.png"} 
                alt="Club" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Club')}&background=2B43A1&color=fff`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#2B43A1] text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0 text-right">
            <span className="text-xs font-bold text-gray-800 truncate">{user?.name || 'الزمالك'}</span>
            <span className="text-[10px] text-gray-400 truncate">{user?.email || 'admin-club@jogo.com'}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="w-64 bg-white border-l border-gray-100 h-screen flex-col justify-between hidden lg:flex shrink-0 shadow-2xs z-20 font-sans" dir="rtl">
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex font-sans" dir="rtl">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          
          <aside className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
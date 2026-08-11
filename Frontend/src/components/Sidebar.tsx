import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings } from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isMobileOpen = false, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
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
          
          <Link onClick={handleLinkClick} to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard') || isActive('/') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            الرئيسية
          </Link>
          
          <Link onClick={handleLinkClick} to="/search" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/search') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            البحث عن اللاعبين
          </Link>

          <Link onClick={handleLinkClick} to="/suggested" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/suggested') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            اللاعبون المقترحون
          </Link>

          <Link onClick={handleLinkClick} to="/saved" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/saved') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            اللاعبون المحفوظون
          </Link>

          <Link onClick={handleLinkClick} to="/notifications" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${isActive('/notifications') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              الإشعارات
            </div>
            <span className="bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </Link>

          <Link onClick={handleLinkClick} to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/settings') ? 'bg-[#EBF1FF] text-[#2B43A1] font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            الإعدادات
          </Link>
        </nav>
      </div>

      <div className="p-4 mb-2">
        <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-white p-0.5 shadow-2xs">
              <img 
                src={user?.avatar || "https://upload.wikimedia.org/wikipedia/ar/7/70/Al-Ittihad_Saudi_Club_logo.png"} 
                alt={user?.name || "النادي"} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Club')}&background=2B43A1&color=fff`;
                }}
              />
            </div>
            <span className="font-semibold text-gray-800 text-sm truncate max-w-27.5">{user?.name || 'نادي الاتحاد'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => { navigate('/settings'); handleLinkClick(); }} 
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-white border-l border-gray-100 flex-col h-full justify-between shrink-0" dir="rtl">
        {sidebarContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col h-full justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        <button
          onClick={onMobileClose}
          className="absolute top-5 left-4 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="إغلاق القائمة"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
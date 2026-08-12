import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Bot, User as UserIcon, LogOut } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar'; 
import TopNav from './components/TopNav'; 
import { getFullImageUrl } from './utils/url';

import Home from './pages/Home'; 
import Saved from './pages/Saved'; 
import Suggested from './pages/Suggested';
import Search from './pages/Search';
import AIChat from './pages/AIChat'; 
import Profile from './pages/Profile';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import ClubRegister from './pages/ClubRegister';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import Welcome from './pages/Welcome';
import PlayerPublicProfile from './pages/PlayerPublicProfile/PlayerPublicProfile';

const ClubLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-right" dir="rtl">
      <Sidebar 
        isMobileOpen={isSidebarOpen} 
        onMobileClose={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav onHamburgerClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

const PlayerLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-2xs gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/profile" className="shrink-0 group">
            <img 
              src={getFullImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2B43A1&color=fff`} 
              alt="Profile" 
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-[#2B43A1] shadow-xs group-hover:opacity-90 transition-opacity"
            />
          </Link>
          <div className="bg-gray-100/90 p-0.5 sm:p-1 rounded-full flex gap-0.5 sm:gap-1 text-xs font-bold shrink-0">
            <Link 
              to="/profile" 
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive('/profile') ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>ملفي الشخصي</span>
            </Link>
            <Link 
              to="/chat" 
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive('/chat') ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>Jogo AI</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={logout}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-red-500 hover:text-red-600 font-bold hover:bg-red-50 px-2 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            title="تسجيل خروج"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">تسجيل خروج</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

const AdaptiveLayout = () => {
  const { user } = useAuth();
  return user?.role === 'scout' ? <ClubLayout /> : <PlayerLayout />;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/welcome" replace />;
  return user.role === 'scout' ? <Navigate to="/dashboard" replace /> : <Navigate to="/profile" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/login', 
    element: <Login />,
  },
  {
    path: '/register', 
    element: <Register />,
  },
  {
    path: '/club-register', 
    element: <ClubRegister />,
  },
  {
    path: '/verify-otp', 
    element: <VerifyOTP />,
  },
  {
    path: '/reset-password', 
    element: <ResetPassword />,
  },
  {
    path: '/forgot-password', 
    element: <ForgotPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdaptiveLayout />,
        children: [
          { path: 'dashboard', element: <Home /> }, 
          { path: 'search', element: <Search /> },
          { path: 'suggested', element: <Suggested /> },
          { path: 'saved', element: <Saved /> }, 
          { path: 'chat', element: <AIChat /> },
          { path: 'profile', element: <Profile /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'player/:id', element: <PlayerPublicProfile /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar'; 
import TopNav from './components/TopNav'; 

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
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';

// 🏢 لي أوت النادي (Dashboard + Sidebar)
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

// 🏃‍♂️ لي أوت اللاعب (بروفايل + شات فقط)
const PlayerLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col" dir="rtl">
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2B43A1&color=fff`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-[#2B43A1]"
          />
          <div className="bg-gray-100 p-1 rounded-full flex gap-1">
            <Link 
              to="/profile" 
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive('/profile') ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ملفي الشخصي 👤
            </Link>
            <Link 
              to="/chat" 
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive('/chat') ? 'bg-[#2B43A1] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jogo AI 💬
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-[#2B43A1]">Jogo AI</span>
          <button 
            onClick={logout}
            className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
          >
            تسجيل خروج
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

// 🔀 تحديد اللي أوت بناءً على نوع الحساب المضبوط
const AdaptiveLayout = () => {
  const { user } = useAuth();
  return user?.role === 'club' ? <ClubLayout /> : <PlayerLayout />;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/welcome" replace />;
  return user.role === 'club' ? <Navigate to="/dashboard" replace /> : <Navigate to="/profile" replace />;
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
          { path: 'settings', element: <Settings /> },
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
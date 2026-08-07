import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
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
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';

const MainLayout = () => {
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

const RootRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/welcome',
    element: <AuthRedirect><Welcome /></AuthRedirect>,
  },
  {
    path: '/login', 
    element: <AuthRedirect><Login /></AuthRedirect>,
  },
  {
    path: '/register', 
    element: <AuthRedirect><Register /></AuthRedirect>,
  },
  {
    path: '/forgot-password', 
    element: <ForgotPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/chat',
        element: <AIChat />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
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
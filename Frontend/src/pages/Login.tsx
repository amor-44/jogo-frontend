import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';
import { Mail, Lock } from 'lucide-react';
import loginBg from '../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin-club@jogo.com' || cleanEmail.includes('admin')) {
      navigate(`/club-register?email=${encodeURIComponent(cleanEmail)}`);
      return;
    }

    const savedClubsRaw = localStorage.getItem('jogo_clubs_db');
    if (savedClubsRaw) {
      const savedClubs: User[] = JSON.parse(savedClubsRaw);
      const existingClub = savedClubs.find((c: User) => c.email.toLowerCase() === cleanEmail);

      if (existingClub) {
        login(existingClub);
        navigate('/dashboard');
        return;
      }
    }

    const savedUserRaw = localStorage.getItem('jogo_user');
    if (savedUserRaw) {
      const savedUser: User = JSON.parse(savedUserRaw);
      if (savedUser.email?.toLowerCase() === cleanEmail) {
        login(savedUser);
        navigate(savedUser.role === 'club' ? '/dashboard' : '/profile');
        return;
      }
    }

    setError('هذا البريد غير مسجل لدينا. يرجى إنشاء حساب جديد أولاً.');
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-4xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl shadow-2xl">
        
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center">
          <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-2xl font-bold text-2xl flex items-center gap-2 mb-6 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Jogo
          </div>

          <h2 className="text-2xl font-bold text-[#1C2C5E] mb-2 text-center">تسجيل الدخول</h2>
          <p className="text-gray-500 text-xs mb-6 text-center">أدخل بيانات حسابك للمتابعة إلى المنصة</p>

          {error && (
            <div className="w-full max-w-sm bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-right border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">كلمة المرور</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1C2C5E] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#2B43A1] transition-colors mt-2 shadow-md cursor-pointer"
            >
              تسجيل الدخول
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500 font-medium">
            ليس لديك حساب؟ <Link to="/register" className="text-[#2B43A1] font-bold hover:underline mx-1">إنشاء حساب جديد</Link>
          </p>
        </div>

        <div className="w-full md:w-1/2 bg-[#1d4ed8] p-4 hidden md:flex items-center justify-center">
          <div className="w-full h-full rounded-3xl overflow-hidden relative border-2 border-white/10 shadow-lg">
            <img src={loginBg} alt="Jogo Tactics" className="w-full h-full object-cover object-center" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
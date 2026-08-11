import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Building2, ShieldCheck, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import type { User, RegisterScoutCommand } from '../../types';

const ClubRegister = () => {
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';

  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    setIsLoading(true);

    try {
      const payload: RegisterScoutCommand = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        clubName: clubName.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
      };

      const authRes = await authService.registerScout(payload);

      if (authRes.accessToken) {
        localStorage.setItem('accessToken', authRes.accessToken);
      }
      if (authRes.refreshToken) {
        localStorage.setItem('refreshToken', authRes.refreshToken);
      }

      const loggedInUser: User = {
        id: authRes.user?.id || 'new-scout',
        name: authRes.user?.fullName || fullName,
        email: authRes.user?.email || email,
        role: 'club',
        avatar: authRes.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B43A1&color=fff`,
      };

      register(loggedInUser);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        if (resData) {
          if (typeof resData === 'string') {
            setError(resData);
          } else if (resData.errors && typeof resData.errors === 'object') {
            const errorMessages = Object.values(resData.errors).flat().join(' - ');
            setError(errorMessages || resData.detail || 'حدث خطأ أثناء إنشاء الحساب');
          } else {
            setError(resData.detail || resData.title || resData.message || 'حدث خطأ أثناء إنشاء الحساب');
          }
        } else if (err.request && !err.response) {
          setError('تعذر الاتصال بالخادم.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 py-12 font-sans" dir="rtl">
      <div className="bg-white rounded-4xl p-8 md:p-10 w-full max-w-xl shadow-2xl border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="bg-[#2B43A1] text-white px-6 py-2 rounded-2xl font-bold text-xl flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> بوابة تسجيل الكشافين / الأندية
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#1C2C5E] text-center mb-1">حساب كشاف جديد</h2>
        <p className="text-gray-400 text-xs text-center mb-6 font-medium">
          سجل ككشاف أو ممثل نادي للوصول إلى قاعدة بيانات اللاعبين الشاملة
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3.5 rounded-xl text-xs mb-4 text-right border border-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-right">الاسم بالكامل <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="اسم الكشاف أو الممثل"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
              />
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-right">البريد الإلكتروني <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="scout@domain.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="لا تقل عن 6 أحرف" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 pl-10" 
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 pl-10" 
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">اسم النادي (اختياري)</label>
              <div className="relative">
                <input 
                  type="text" value={clubName} onChange={e => setClubName(e.target.value)}
                  placeholder="مثال: نادي الاتحاد"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
                />
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">رقم الرخصة (اختياري)</label>
              <div className="relative">
                <input 
                  type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="مثال: 12345"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
                />
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2B43A1] text-white py-3.5 rounded-xl font-bold text-xs hover:bg-blue-900 transition-colors shadow-md mt-6 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            تفعيل الحساب
          </button>
        </form>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-medium text-center">
            لديك حساب بالفعل؟ <Link to="/login" className="text-[#2B43A1] font-bold hover:underline mx-1">تسجيل الدخول</Link>
          </p>
          <p className="text-xs text-gray-500 font-medium text-center">
            أو <Link to="/register" className="text-[#2B43A1] font-bold hover:underline mx-1">إنشاء حساب لاعب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubRegister;

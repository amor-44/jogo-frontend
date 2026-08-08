import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (fullName && email) {
      register({
        name: fullName,
        email: email,
        role: 'لاعب',
      });
      navigate('/dashboard');
    } else {
      setError('يرجى ملء جميع البيانات المطلوبة');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 py-10" dir="rtl">
      <div className="bg-white rounded-4xl w-full max-w-2xl p-8 md:p-10 flex flex-col items-center shadow-2xl relative">
        <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-2xl font-bold text-2xl flex items-center gap-2 mb-6 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          Jogo
        </div>

        <h2 className="text-3xl font-bold text-[#1C2C5E] mb-2 text-center">إنشاء حسابك</h2>
        <p className="text-gray-500 text-sm mb-8 text-center">أنشئ ملفك الكروي وابدأ رحلتك مع تحليل الأداء بالذكاء الاصطناعي.</p>

        <div className="w-full max-w-md relative mb-10 flex justify-between items-start">
          <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-200 -z-10"></div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">1</div>
            <span className="text-[#2B43A1] font-bold text-xs">الخطوة 1</span>
            <span className="text-gray-400 text-[10px]">المعلومات الشخصية</span>
          </div>

          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm mb-2">2</div>
            <span className="text-gray-400 font-bold text-xs">الخطوة 2</span>
            <span className="text-gray-400 text-[10px]">معلومات كرة القدم</span>
          </div>
        </div>

        {error && (
          <div className="w-full max-w-md bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-right border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">الاسم بالكامل</label>
            <div className="relative">
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم بالكامل" 
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">البريد الإلكتروني</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني" 
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">رقم الجوال</label>
            <div className="relative">
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الجوال" 
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور" 
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10 pl-10" 
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">تأكيد كلمة المرور</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة المرور" 
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10 pl-10" 
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1C2C5E] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#2B43A1] transition-colors mt-4 shadow-md cursor-pointer"
          >
            متابعة
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 font-medium">
          لديك حساب بالفعل؟ <Link to="/login" className="text-[#2B43A1] font-bold hover:underline mx-1">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
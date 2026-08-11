import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import loginBg from '../../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email) {
      navigate('/verify-otp');
    } else {
      setError('يرجى كتابة البريد الإلكتروني الخاص بك');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-4xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl shadow-2xl">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center">
          <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-2xl font-bold text-2xl flex items-center gap-2 mb-8 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Jogo
          </div>

          <h2 className="text-2xl font-bold text-[#1C2C5E] mb-2 w-full max-w-sm text-right">
            استعادة <span className="text-[#2B43A1]">كلمة المرور</span>
          </h2>
          <p className="text-gray-500 text-xs mb-6 w-full max-w-sm text-right leading-relaxed font-medium">
            أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رمز التفعيل.
          </p>

          {error && (
            <div className="w-full max-w-sm bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-right border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-2 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني" 
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#2B43A1] text-right pr-10" 
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1C2C5E] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#2B43A1] transition-colors mt-2 shadow-md cursor-pointer"
            >
              إرسال رمز التفعيل
            </button>
          </form>

          <div className="mt-8">
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-[#2B43A1] font-bold hover:underline">
              <ArrowRight className="w-4 h-4" />
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-[#1d4ed8] p-4 hidden md:flex items-center justify-center">
          <div className="w-full h-full rounded-3xl overflow-hidden relative border-2 border-white/10 shadow-lg">
            <img 
              src={loginBg} 
              alt="Football Tactics and Analysis" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

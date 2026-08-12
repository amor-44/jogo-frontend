import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import loginBg from '../../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1C3BB8] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-[2.5rem] p-4 flex flex-col md:flex-row w-full max-w-5xl shadow-2xl overflow-hidden min-h-137.5">
        <div className="w-full md:w-1/2 bg-[#1C3BB8] rounded-4xl p-2 relative hidden md:block overflow-hidden">
          <img 
            src={loginBg} 
            alt="Jogo Analysis" 
            className="w-full h-full object-cover rounded-[1.8rem]"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-between">
          <div className="w-full flex justify-center mb-4">
            <div className="bg-[#1C3BB8] text-white px-8 py-3 rounded-2xl font-bold text-2xl flex items-center gap-2 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              Jogo
            </div>
          </div>

          <div className="w-full max-w-sm my-auto">
            <h2 className="text-2xl font-black text-[#1C3BB8] mb-1 text-center">إنشاء كلمة مرور جديدة</h2>
            <p className="text-gray-400 text-xs mb-6 text-center">أدخل كلمة مرور قوية مختلفة عن القديمة لحماية حسابك</p>

            <form onSubmit={(e) => { e.preventDefault(); navigate('/login'); }} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1.5 text-right">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور الجديدة"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#1C3BB8] focus:bg-white transition-all text-right pr-10 pl-10"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1.5 text-right">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="تأكيد كلمة المرور الجديدة"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#1C3BB8] focus:bg-white transition-all text-right pr-10 pl-10"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1C3BB8] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-900 transition-colors shadow-md mt-4 cursor-pointer"
              >
                حفظ كلمة المرور
              </button>
            </form>
          </div>

          <div />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

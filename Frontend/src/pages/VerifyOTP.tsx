import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBg from '../assets/images/ChatGPT Image Jul 24, 2026, 06_14_11 PM 1.png';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigate = useNavigate();

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-4xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl shadow-2xl">
        
        {/* الفورم (الجانب الأيسر) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center">
          <div className="bg-[#2B43A1] text-white px-8 py-2.5 rounded-2xl font-bold text-2xl flex items-center gap-2 mb-8 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Jogo
          </div>

          <h2 className="text-2xl font-bold text-[#1C2C5E] mb-2 text-center">كود التفعيل</h2>
          <p className="text-gray-500 text-xs mb-8 text-center leading-relaxed font-medium">
            لقد أرسلنا رمزاً مكوناً من 4 أرقام إلى رقم هاتفك
          </p>
          
          <div className="flex gap-4 mb-6" dir="ltr">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold outline-none focus:border-[#2B43A1] focus:bg-white transition-all shadow-2xs"
              />
            ))}
          </div>

          <div className="text-center mb-8">
            {/* هنا اللينك اللي بيرجع للصفحة اللي فاتت */}
            <button 
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-[#2B43A1] font-bold hover:underline cursor-pointer"
            >
              لم يصلك الرمز؟ إعادة إرسال الرمز
            </button>
          </div>

          <button 
            onClick={() => navigate('/reset-password')}
            className="w-full max-w-sm bg-[#1C2C5E] text-white py-3.5 rounded-xl font-bold hover:bg-[#2B43A1] transition-colors shadow-md cursor-pointer"
          >
            إرسال رمز التحقق
          </button>
        </div>

        {/* الصورة الجانبية (الجانب الأيمن) */}
        <div className="w-full md:w-1/2 bg-[#1d4ed8] p-4 hidden md:flex items-center justify-center">
          <div className="w-full h-full rounded-3xl overflow-hidden relative border-2 border-white/10 shadow-lg">
            <img 
              src={loginBg} 
              alt="Football Analysis" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
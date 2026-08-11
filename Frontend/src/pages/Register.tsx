import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [mainPosition, setMainPosition] = useState('');
  const [prefPosition, setPrefPosition] = useState('');
  const [foot, setFoot] = useState<'اليمني' | 'اليسري' | 'كلتاهما'>('اليمني');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [currentClub, setCurrentClub] = useState('');
  const [prevClub, setPrevClub] = useState('');
  const [playerBio, setPlayerBio] = useState('');

  const [error, setError] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (fullName && email) {
      setStep(2);
    } else {
      setError('يرجى ملء جميع البيانات المطلوبة');
    }
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();

    register({
      name: fullName,
      email: email,
      role: 'player',
      avatar: ''
    });
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-4 py-12 font-sans" dir="rtl">
      <div className="w-full max-w-xl flex flex-col items-center">
        
        <div className="bg-[#2B43A1] text-white px-10 py-3 rounded-2xl font-bold text-2xl flex items-center justify-center gap-2 mb-6 shadow-xs">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          Jogo
        </div>

        <h1 className="text-3xl font-black text-[#2B43A1] mb-2 text-center">إنشاء حساب جديد</h1>
        <p className="text-gray-400 text-xs mb-8 text-center font-medium">
          أنشئ ملفك الكروي وابدأ رحلتك مع منصة Jogo للتحليل الرياضي
        </p>

        <div className="w-full max-w-md relative mb-8 flex justify-between items-center px-4">
          <div className="absolute top-4 left-12 right-12 h-0.5 bg-[#2B43A1]/40 z-0"></div>
          
          <div className="flex flex-col items-center z-10 bg-[#F8F9FF] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 1 ? 'bg-[#2B43A1] text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <span className="text-[#2B43A1] font-bold text-xs mt-1">الخطوة 1</span>
            <span className="text-gray-400 text-[10px]">المعلومات الأساسية</span>
          </div>

          <div className="flex flex-col items-center z-10 bg-[#F8F9FF] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 2 ? 'bg-[#2B43A1] text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className="text-gray-400 font-bold text-xs mt-1">الخطوة 2</span>
            <span className="text-gray-400 text-[10px]">معلومات كرة القدم</span>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-right border border-red-100 font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">الاسم بالكامل</label>
              <div className="relative">
                <input 
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم بالكامل" required
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right pr-10 shadow-2xs" 
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">البريد الإلكتروني الرسمي</label>
              <div className="relative">
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني" required
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right pr-10 shadow-2xs" 
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">رقم الهاتف / التواصل</label>
              <div className="relative">
                <input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الجوال" 
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right pr-10 shadow-2xs" 
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور" required
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right pr-10 pl-10 shadow-2xs" 
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">تأكيد كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور" required
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right pr-10 pl-10 shadow-2xs" 
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#2B43A1] text-white py-3.5 rounded-full font-bold text-xs hover:bg-blue-900 transition-colors mt-2 shadow-sm cursor-pointer">
              المتابعة للخطوة التالية
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitFinal} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">المركز الأساسي</label>
              <input 
                type="text" value={mainPosition} onChange={(e) => setMainPosition(e.target.value)}
                placeholder="المركز الأساسي (مثال: مهاجم)" required
                className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">المراكز المفضلة</label>
              <input 
                type="text" value={prefPosition} onChange={(e) => setPrefPosition(e.target.value)}
                placeholder="المراكز المفضلة"
                className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">القدم المفضلة</label>
              <div className="grid grid-cols-3 gap-3">
                {['اليمني', 'اليسري', 'كلتاهما'].map((item) => (
                  <button
                    type="button" key={item} onClick={() => setFoot(item as 'اليمني' | 'اليسري' | 'كلتاهما')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer ${
                      foot === item ? 'bg-white border-[#2B43A1] text-[#2B43A1] ring-1 ring-[#2B43A1]' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">الوزن (كجم)</label>
                <input 
                  type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="الوزن" 
                  className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">الطول (سم)</label>
                <input 
                  type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="الطول" 
                  className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">النادي الحالي</label>
                <input type="text" value={currentClub} onChange={(e) => setCurrentClub(e.target.value)} placeholder="النادي الحالي" className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">النادي السابق</label>
                <input type="text" value={prevClub} onChange={(e) => setPrevClub(e.target.value)} placeholder="النادي السابق" className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right shadow-2xs" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">نبذة مختصرة عني</label>
              <textarea rows={2} value={playerBio} onChange={(e) => setPlayerBio(e.target.value)} placeholder="نبذة مختصرة عني" className="w-full bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] text-right resize-none shadow-2xs" />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <button type="submit" className="flex-1 bg-[#2B43A1] text-white py-3.5 rounded-full font-bold text-xs hover:bg-blue-900 transition-colors cursor-pointer">
                إنشاء حساب لاعب
              </button>
              <button type="button" onClick={() => setStep(1)} className="px-8 py-3.5 rounded-full border border-[#2B43A1] text-[#2B43A1] font-bold text-xs hover:bg-blue-50 transition-colors cursor-pointer">
                رجوع
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-xs text-gray-500 font-medium">
          لديك حساب بالفعل؟ <Link to="/login" className="text-[#2B43A1] font-bold hover:underline mx-1">تسجيل الدخول</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
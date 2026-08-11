import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import type { RegisterPlayerCommand, User } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  Calendar, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

const COUNTRIES_LIST = [
  'مصر',
  'السعودية',
  'الإمارات',
  'الكويت',
  'قطر',
  'البحرين',
  'عمان',
  'المغرب',
  'الجزائر',
  'تونس',
  'العراق',
  'الأردن',
  'سوريا',
  'لبنان',
  'فلسطين',
  'السودان',
  'اليمن',
  'ليبيا',
  'موريتانيا',
  'الصومال',
];

const POSITIONS = [
  { label: 'مهاجم (ST)', value: 'ST' },
  { label: 'جناح أيسر (LW)', value: 'LW' },
  { label: 'جناح أيمن (RW)', value: 'RW' },
  { label: 'صانع ألعاب / وسط هجومي (CAM)', value: 'CAM' },
  { label: 'وسط محور (CM)', value: 'CM' },
  { label: 'وسط دفاعي / ارتكاز (CDM)', value: 'CDM' },
  { label: 'ظهير أيسر (LB)', value: 'LB' },
  { label: 'ظهير أيمن (RB)', value: 'RB' },
  { label: 'قلب دفاع (CB)', value: 'CB' },
  { label: 'حارس مرمى (GK)', value: 'GK' },
];

const POSITION_MAP: Record<string, number> = {
  GK: 0,
  CB: 1,
  RB: 2,
  LB: 3,
  CDM: 4,
  CM: 5,
  CAM: 6,
  RW: 7,
  LW: 8,
  ST: 9,
};

const FEET_OPTIONS: { label: string; value: 'Right' | 'Left' | 'Both' }[] = [
  { label: 'اليمنى', value: 'Right' },
  { label: 'اليسرى', value: 'Left' },
  { label: 'كلتاهما', value: 'Both' },
];

const FOOT_MAP: Record<string, number> = {
  Right: 0,
  Left: 1,
  Both: 2,
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2002-01-01');
  const [primaryPosition, setPrimaryPosition] = useState<string>('ST');
  const [preferredFoot, setPreferredFoot] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 22;
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const calculatedAge = calculateAge(dateOfBirth);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('يرجى ملء جميع البيانات الأساسية المطلوبة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (!country.trim()) {
      setError('يرجى تحديد الدولة');
      return;
    }

    if (!dateOfBirth) {
      setError('يرجى تحديد تاريخ الميلاد');
      return;
    }

    if (calculatedAge < 8 || calculatedAge > 50) {
      setError('يرجى إدخال تاريخ ميلاد صحيح (العمر بين 8 و 50 عاماً)');
      return;
    }

    setStep(2);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Format birth date to complete ISO Date-Time string with UTC timezone (e.g. 2000-01-01T00:00:00.000Z)
      const birthDateIso = new Date(dateOfBirth).toISOString();

      // Convert enums to explicit numeric values for Backend
      const numericPosition: number = POSITION_MAP[primaryPosition] ?? 9;
      const numericFoot: number = FOOT_MAP[preferredFoot] ?? 0;

      // Build registration command payload with explicit numeric enums
      const registerPayload: RegisterPlayerCommand = {
        email: email.trim().toLowerCase(),
        password: password,
        fullName: fullName.trim(),
        dateOfBirth: birthDateIso,
        primaryPosition: numericPosition,
        preferredFoot: numericFoot,
        country: country.trim() || 'مصر',
      };

      console.log('Register Payload:', registerPayload);

      // Send registration request to backend API
      const authRes = await authService.registerPlayer(registerPayload);

      // Save tokens
      if (authRes.accessToken) {
        localStorage.setItem('accessToken', authRes.accessToken);
      }
      if (authRes.refreshToken) {
        localStorage.setItem('refreshToken', authRes.refreshToken);
      }

      // Store user in context and storage
      const loggedInUser: User = {
        id: authRes.user?.id || 'new-player',
        name: authRes.user?.fullName || fullName,
        email: authRes.user?.email || email,
        role: 'player',
        avatar:
          authRes.user?.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B43A1&color=fff`,
      };

      register(loggedInUser);

      // Redirect to profile
      navigate('/profile');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        if (resData) {
          if (typeof resData === 'string') {
            setError(resData);
          } else if (resData.errors && typeof resData.errors === 'object') {
            const errorMessages = Object.values(resData.errors).flat().join(' - ');
            setError(errorMessages || resData.detail || resData.title || 'حدث خطأ أثناء إنشاء الحساب');
          } else {
            setError(resData.detail || resData.title || resData.message || 'حدث خطأ أثناء إنشاء الحساب');
          }
        } else if (err.request && !err.response) {
          setError('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
        } else {
          setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ غير متوقع أثناء تسجيل الحساب');
      }
    } finally {
      setIsLoading(false);
    }
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

        <h1 className="text-2xl sm:text-3xl font-black text-[#2B43A1] mb-2 text-center">إنشاء حساب لاعب جديد</h1>
        <p className="text-gray-400 text-xs mb-8 text-center font-medium">
          أنشئ ملفك الكروي وابدأ رحلتك مع منصة Jogo للتحليل الرياضي المتقدم
        </p>

        {/* Stepper Header */}
        <div className="w-full max-w-md relative mb-8 flex justify-between items-center px-4">
          <div className="absolute top-4 left-12 right-12 h-0.5 bg-[#2B43A1]/30 z-0"></div>
          
          <div className="flex flex-col items-center z-10 bg-[#F8F9FF] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 1 ? 'bg-[#2B43A1] text-white ring-4 ring-blue-100' : 'bg-green-600 text-white'
            }`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-[#2B43A1] font-bold text-xs mt-1">الخطوة 1</span>
            <span className="text-gray-400 text-[10px]">المعلومات الأساسية</span>
          </div>

          <div className="flex flex-col items-center z-10 bg-[#F8F9FF] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 2 ? 'bg-[#2B43A1] text-white ring-4 ring-blue-100' : 'bg-white border-2 border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className={step === 2 ? 'text-[#2B43A1] font-bold text-xs mt-1' : 'text-gray-400 font-bold text-xs mt-1'}>الخطوة 2</span>
            <span className="text-gray-400 text-[10px]">المركز والقدم المفضلة</span>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3.5 rounded-xl text-xs mb-4 text-right border border-red-200 font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="w-full flex flex-col gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                الاسم بالكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: محمد أحمد إبراهيم" 
                  required
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all" 
                />
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                البريد الإلكتروني الرسمي <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all" 
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                  الدولة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="countries-list"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="مثال: مصر"
                    required
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all"
                  />
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <datalist id="countries-list">
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gray-700 text-xs font-bold text-right">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  {calculatedAge > 0 && (
                    <span className="bg-blue-50 text-[#2B43A1] font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-blue-100">
                      العمر: {calculatedAge} عاماً
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="date" 
                    value={dateOfBirth} 
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all" 
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
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
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 pl-10 shadow-2xs transition-all" 
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
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
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 pl-10 shadow-2xs transition-all" 
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#2B43A1] text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-blue-900 transition-colors mt-2 shadow-sm cursor-pointer"
            >
              المتابعة للخطوة التالية (المركز والقدم المفضلة) &larr;
            </button>
          </form>
        )}

        {/* Step 2: Position and Preferred Foot */}
        {step === 2 && (
          <form onSubmit={handleSubmitFinal} className="w-full flex flex-col gap-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                المركز الأساسي (Primary Position) <span className="text-red-500">*</span>
              </label>
              <select
                value={primaryPosition}
                onChange={(e) => setPrimaryPosition(e.target.value)}
                required
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3.5 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs cursor-pointer transition-all font-medium"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-2 text-right">
                القدم المفضلة (Preferred Foot) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FEET_OPTIONS.map((item) => (
                  <button
                    type="button" 
                    key={item.value} 
                    onClick={() => setPreferredFoot(item.value)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredFoot === item.value 
                        ? 'bg-blue-50/80 border-[#2B43A1] text-[#2B43A1] ring-2 ring-[#2B43A1]/20 shadow-xs' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-[#2B43A1] text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-blue-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <span>إنشاء حساب لاعب</span>
                )}
              </button>
              <button 
                type="button" 
                disabled={isLoading}
                onClick={() => setStep(1)} 
                className="px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
              >
                رجوع
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-medium">
            لديك حساب بالفعل؟ <Link to="/login" className="text-[#2B43A1] font-bold hover:underline mx-1">تسجيل الدخول</Link>
          </p>
          <p className="text-xs text-gray-500 font-medium">
            أو <Link to="/club-register" className="text-[#2B43A1] font-bold hover:underline mx-1">إنشاء حساب كشاف / نادي</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

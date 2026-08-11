import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { playerService } from '../../services/playerService';
import { ProfileVisibility } from '../../types';
import type { PreferredFoot, RegisterPlayerCommand, User } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  MapPin, 
  Calendar, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

const ALL_NATIONALITIES = [
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
  'جيبوتي',
  'جزر القمر',
  'تركيا',
  'إنجلترا',
  'فرنسا',
  'ألمانيا',
  'إسبانيا',
  'إيطاليا',
  'البرازيل',
  'الأرجنتين',
  'هولندا',
  'البرتغال',
  'بلجيكا',
  'نيجيريا',
  'السنغال',
  'غانا',
  'كوت ديفوار',
  'الكاميرون',
];

const POSITIONS = [
  { label: 'مهاجم (Striker / ST)', value: 'ST' },
  { label: 'جناح أيسر (Left Winger / LW)', value: 'LW' },
  { label: 'جناح أيمن (Right Winger / RW)', value: 'RW' },
  { label: 'صانع ألعاب / وسط هجومي (CAM)', value: 'CAM' },
  { label: 'وسط محور (Central Midfielder / CM)', value: 'CM' },
  { label: 'وسط دفاعي / ارتكاز (CDM)', value: 'CDM' },
  { label: 'ظهير أيسر (Left Back / LB)', value: 'LB' },
  { label: 'ظهير أيمن (Right Back / RB)', value: 'RB' },
  { label: 'قلب دفاع (Center Back / CB)', value: 'CB' },
  { label: 'حارس مرمى (Goalkeeper / GK)', value: 'GK' },
];

const mapToBackendPosition = (pos: string): string => {
  const map: Record<string, string> = {
    ST: 'Striker',
    LW: 'LeftWinger',
    RW: 'RightWinger',
    CAM: 'AttackingMidfielder',
    CM: 'CentralMidfielder',
    CDM: 'DefensiveMidfielder',
    LB: 'LeftBack',
    RB: 'RightBack',
    CB: 'CenterBack',
    GK: 'Goalkeeper',
    CF: 'Striker',
    LM: 'LeftWinger',
    RM: 'RightWinger',
    DM: 'DefensiveMidfielder',
    Striker: 'Striker',
    LeftWinger: 'LeftWinger',
    RightWinger: 'RightWinger',
    AttackingMidfielder: 'AttackingMidfielder',
    CentralMidfielder: 'CentralMidfielder',
    DefensiveMidfielder: 'DefensiveMidfielder',
    LeftBack: 'LeftBack',
    RightBack: 'RightBack',
    CenterBack: 'CenterBack',
    Goalkeeper: 'Goalkeeper',
  };
  return map[pos] || 'Striker';
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [region, setRegion] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2002-01-01');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Football Info
  const [mainPosition, setMainPosition] = useState<string>('ST');
  const [prefPosition, setPrefPosition] = useState('');
  const [foot, setFoot] = useState<PreferredFoot>('اليمني');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [currentClub, setCurrentClub] = useState('');
  const [prevClub, setPrevClub] = useState('');
  const [playerBio, setPlayerBio] = useState('');

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

    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتواصل (حقل إجباري)');
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

    if (!nationality.trim()) {
      setError('يرجى تحديد الجنسية');
      return;
    }

    if (!region.trim()) {
      setError('يرجى كتابة المنطقة أو المدينة');
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
      // 1. Prepare birth date ISO format
      const birthDateIso = new Date(dateOfBirth).toISOString();

      // 2. Prepare foot mapping
      const footMapping: Record<string, 'Right' | 'Left' | 'Both'> = {
        'اليمني': 'Right',
        'اليسري': 'Left',
        'كلتاهما': 'Both',
      };
      const mappedFoot = footMapping[foot] || 'Right';

      // 3. Prepare position mapping
      const mappedPosition = mapToBackendPosition(mainPosition);

      // 4. Prepare clubs (default to "بدون نادي" if empty)
      const finalCurrentClub = currentClub.trim() || 'بدون نادي';
      const finalPrevClub = prevClub.trim() || 'بدون نادي';
      const finalNationality = nationality.trim() || 'مصر';
      const finalRegion = region.trim() || 'القاهرة';

      // 5. Build registration command payload
      const registerPayload: RegisterPlayerCommand = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirmPassword: confirmPassword,
        dateOfBirth: birthDateIso,
        country: finalNationality,
        nationality: finalNationality,
        city: finalRegion,
        region: finalRegion,
        primaryPosition: mappedPosition,
        position: mappedPosition,
        preferredFoot: mappedFoot,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        currentClub: finalCurrentClub,
        previousClub: finalPrevClub,
        age: calculatedAge,
      };

      // 6. Send registration request to Backend API
      const authRes = await authService.registerPlayer(registerPayload);

      // 7. Save authentication tokens
      if (authRes.accessToken) {
        localStorage.setItem('accessToken', authRes.accessToken);
      }
      if (authRes.refreshToken) {
        localStorage.setItem('refreshToken', authRes.refreshToken);
      }

      // 8. Update additional profile details (city, club, bio, height, weight)
      try {
        await playerService.updateMe({
          city: finalRegion,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          currentClub: finalCurrentClub,
          biography: playerBio.trim() || undefined,
          footballExperience: finalPrevClub !== 'بدون نادي' ? `النادي السابق: ${finalPrevClub}` : 'بدون نادي سابق',
          visibility: ProfileVisibility.Public,
        });
      } catch (updateErr) {
        console.warn('Update extra profile info warning:', updateErr);
      }

      // 9. Fetch complete created profile
      let userProfile = null;
      try {
        userProfile = await playerService.getMe();
      } catch {
        // Continue with basic user info
      }

      // 10. Store logged in player in AuthContext and localStorage
      const loggedInUser: User = {
        id: authRes.user?.id || 'new-player',
        name: userProfile?.fullName || authRes.user?.fullName || fullName,
        email: authRes.user?.email || email,
        role: 'player',
        avatar:
          userProfile?.profilePictureUrl ||
          authRes.user?.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B43A1&color=fff`,
      };

      register(loggedInUser);

      // 11. Redirect to profile
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
            <span className="text-gray-400 text-[10px]">معلومات كرة القدم</span>
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

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                رقم الهاتف / التواصل <span className="text-red-500">* (إجباري)</span>
              </label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 01012345678" 
                  required
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all" 
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                  الجنسية <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="nationalities-list"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="مثال: مصر"
                    required
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all"
                  />
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <datalist id="nationalities-list">
                    {ALL_NATIONALITIES.map((nat) => (
                      <option key={nat} value={nat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                  المنطقة / المدينة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="مثال: القاهرة / الجيزة" 
                    required
                    className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right pr-10 shadow-2xs transition-all" 
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
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
              المتابعة للخطوة التالية (معلومات كرة القدم) &larr;
            </button>
          </form>
        )}

        {/* Step 2: Football Information */}
        {step === 2 && (
          <form onSubmit={handleSubmitFinal} className="w-full flex flex-col gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                المركز الأساسي <span className="text-red-500">*</span>
              </label>
              <select
                value={mainPosition}
                onChange={(e) => setMainPosition(e.target.value)}
                required
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs cursor-pointer transition-all font-medium"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                المراكز الإضافية / المفضلة (اختياري)
              </label>
              <input 
                type="text" 
                value={prefPosition} 
                onChange={(e) => setPrefPosition(e.target.value)}
                placeholder="مثال: جناح أيمن / صانع ألعاب"
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs transition-all" 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">
                القدم المفضلة
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['اليمني', 'اليسري', 'كلتاهما'] as PreferredFoot[]).map((item) => (
                  <button
                    type="button" 
                    key={item} 
                    onClick={() => setFoot(item)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      foot === item 
                        ? 'bg-blue-50/80 border-[#2B43A1] text-[#2B43A1] ring-2 ring-[#2B43A1]/20 shadow-xs' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-600 hover:bg-gray-100'
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
                  type="number" 
                  step="0.1"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="مثال: 72" 
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs transition-all" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">الطول (سم)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  placeholder="مثال: 178" 
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs transition-all" 
                />
              </div>
            </div>

            {/* Current and Previous Club (Allows "بدون نادي" or defaults to it) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gray-700 text-xs font-bold text-right">النادي الحالي</label>
                  <button
                    type="button"
                    onClick={() => setCurrentClub('بدون نادي')}
                    className="text-[10px] text-[#2B43A1] font-bold hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md"
                  >
                    بدون نادي
                  </button>
                </div>
                <input 
                  type="text" 
                  value={currentClub} 
                  onChange={(e) => setCurrentClub(e.target.value)} 
                  placeholder="النادي الحالي (أو اتركه فارغاً)" 
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs transition-all" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gray-700 text-xs font-bold text-right">النادي السابق</label>
                  <button
                    type="button"
                    onClick={() => setPrevClub('بدون نادي')}
                    className="text-[10px] text-[#2B43A1] font-bold hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md"
                  >
                    بدون نادي
                  </button>
                </div>
                <input 
                  type="text" 
                  value={prevClub} 
                  onChange={(e) => setPrevClub(e.target.value)} 
                  placeholder="النادي السابق (أو اتركه فارغاً)" 
                  className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right shadow-2xs transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 text-right">نبذة مختصرة عن اللاعب (اختياري)</label>
              <textarea 
                rows={2} 
                value={playerBio} 
                onChange={(e) => setPlayerBio(e.target.value)} 
                placeholder="اكتب نبذة مختصرة عن مهاراتك وأهدافك الكروية..." 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-xs outline-none focus:border-[#2B43A1] focus:bg-white text-right resize-none shadow-2xs transition-all" 
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
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

        <p className="mt-8 text-xs text-gray-500 font-medium">
          لديك حساب بالفعل؟ <Link to="/login" className="text-[#2B43A1] font-bold hover:underline mx-1">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

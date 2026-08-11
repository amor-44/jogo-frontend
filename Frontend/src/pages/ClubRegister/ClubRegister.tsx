import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Building2, ShieldCheck, Mail, MapPin, Trophy, User as UserIcon } from 'lucide-react';
import type { User } from '../../types';

const ClubRegister = () => {
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || 'club@jogo.com';

  const { login } = useAuth();
  const navigate = useNavigate();

  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [league, setLeague] = useState('');
  const [country, setCountry] = useState('السعودية');
  const [managerName, setManagerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newClubData: User = {
      name: clubName || 'نادي جديد',
      email: email,
      role: 'club',
      avatar: 'https://upload.wikimedia.org/wikipedia/ar/7/70/Al-Ittihad_Saudi_Club_logo.png'
    };

    const savedClubsRaw = localStorage.getItem('jogo_clubs_db');
    const savedClubs = savedClubsRaw ? JSON.parse(savedClubsRaw) : [];
    savedClubs.push({ ...newClubData, league, country, managerName });
    localStorage.setItem('jogo_clubs_db', JSON.stringify(savedClubs));

    login(newClubData);

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-4xl p-8 md:p-10 w-full max-w-xl shadow-2xl border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="bg-[#2B43A1] text-white px-6 py-2 rounded-2xl font-bold text-xl flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> بوابة تسجيل الأندية المعتمدة
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#1C2C5E] text-center mb-1">تسجيل نادي جديد</h2>
        <p className="text-gray-400 text-xs text-center mb-6 font-medium">
          هذه الصفحة مخصصة لإدارة المنصة لتسجيل وتفعيل حسابات الأندية الحقيقية
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-right">اسم النادي / المؤسسة</label>
            <div className="relative">
              <input 
                type="text" required value={clubName} onChange={e => setClubName(e.target.value)}
                placeholder="مثال: نادي الأهلي / نادي الاتحاد / نادي الزمالك"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
              />
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-right">البريد الإلكتروني المعتمد للنادي</label>
            <div className="relative">
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="club@domain.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">الدوري / الدرجة</label>
              <div className="relative">
                <input 
                  type="text" value={league} onChange={e => setLeague(e.target.value)}
                  placeholder="مثال: الدوري الممتاز"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
                />
                <Trophy className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">الدولة / المدينة</label>
              <div className="relative">
                <input 
                  type="text" value={country} onChange={e => setCountry(e.target.value)}
                  placeholder="مثال: جدة، السعودية"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-right">اسم مسؤول التعاقدات / الكشاف</label>
            <div className="relative">
              <input 
                type="text" value={managerName} onChange={e => setManagerName(e.target.value)}
                placeholder="اسم المسؤول"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#2B43A1] focus:bg-white pr-10 text-right"
              />
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#2B43A1] text-white py-3.5 rounded-xl font-bold text-xs hover:bg-blue-900 transition-colors shadow-md mt-4 cursor-pointer"
          >
            تفعيل الحساب
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClubRegister;

import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import type { Player } from '../types';

const Home = () => {
  const { user, players: contextPlayers } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stats = [
    { id: 1, value: "99", label: "اللاعبون المشاهدون" },
    { id: 2, value: "20", label: "اللاعبون المقترحون" },
    { id: 3, value: "10", label: "اللاعبون المحفوظون" },
    { id: 4, value: "30", label: "إجمالي التعاقدات" },
    { id: 5, value: "247", label: "الزيارات الحالية" },
  ];

  const playersList = contextPlayers && contextPlayers.length > 0 
    ? contextPlayers 
    : [
        { id: 1, name: "محمد القحطاني", position: "CF", age: 20, overall: 87, country: "مصر", club: "برشلونة", value: "€620K", foot: "يمين", height: "175", aiScore: 87 },
        { id: 2, name: "عبدالرحمن الغامدي", position: "CM", age: 22, overall: 89, country: "السعودية", club: "الاتفاق", value: "€2.5M", foot: "يمين", height: "180", aiScore: 89 },
        { id: 3, name: "أحمد الرشيدي", position: "CB", age: 24, overall: 82, country: "مصر", club: "الأهلي", value: "€500K", foot: "يمين", height: "185", aiScore: 82 },
        { id: 4, name: "رياض محرز", position: "RW", age: 33, overall: 86, country: "الجزائر", club: "الأهلي السعودي", value: "€12M", foot: "يسار", height: "179", aiScore: 86 },
      ];

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-10 font-sans" dir="rtl">
      
      <div className="text-center mb-6 md:mb-10 pt-4">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1C2C5E] mb-2">
          مرحباً <span className="text-[#2B43A1]">{user?.name || 'نادي الاتحاد'}</span> 👋
        </h1>
        <p className="text-gray-400 text-xs font-medium">
          {currentDate} — إليك آخر ما يدور في المنصة
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 w-full mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
          >
            <span className="text-2xl md:text-3xl font-black text-gray-800 mb-1">
              {stat.value}
            </span>
            <span className="text-gray-400 text-[11px] font-bold">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full bg-white rounded-3xl shadow-2xs border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#1C2C5E]">اللاعبون المقترحون بالذكاء الاصطناعي</h2>
          <button 
            onClick={() => navigate('/suggested')}
            className="text-[#2B43A1] text-xs font-bold hover:underline cursor-pointer"
          >
            عرض الكل
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="pb-4 font-bold text-right px-4">اللاعب</th>
                <th className="pb-4 font-bold">المركز</th>
                <th className="pb-4 font-bold">العمر</th>
                <th className="pb-4 font-bold">التقييم</th>
                <th className="pb-4 font-bold">الجنسية</th>
                <th className="pb-4 font-bold">النادي</th>
                <th className="pb-4 font-bold">القيمة السوقية</th>
                <th className="pb-4 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {playersList.map((player: Player) => (
                <tr key={player.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3 text-right">
                    <Avatar name={player.name} size="sm" />
                    <span className="font-bold text-gray-800">{player.name}</span>
                  </td>
                  <td className="py-3.5 text-gray-600 font-semibold">{player.position}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{player.age}</td>
                  <td className="py-3.5 text-amber-500 font-bold">⭐ {player.overall}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{player.country}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{player.club}</td>
                  <td className="py-3.5 text-[#2B43A1] font-extrabold">{player.value}</td>
                  <td className="py-3.5">
                    <button 
                      onClick={() => navigate('/profile')} 
                      className="text-[#2B43A1] hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      عرض الملف الشخصي
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Home;
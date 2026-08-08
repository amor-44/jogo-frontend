import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const Home = () => {
  const { user } = useAuth();

  const stats = [
    { id: 1, value: "99", label: "اللاعبون المشاهدون" },
    { id: 2, value: "20", label: "اللاعبون المقترحون" },
    { id: 3, value: "10", label: "اللاعبون المحفوظون" },
    { id: 4, value: "30", label: "إجمالي التعاقدات" },
    { id: 5, value: "247", label: "اللاعبون المشاهدون" },
  ];

  const players = [
    { id: 1, name: "محمد القحطاني", position: "CF", age: 20, rating: "87", country: "مصر", club: "برشلونة", value: "€620K" },
    { id: 2, name: "محمد القحطاني", position: "CF", age: 15, rating: "92", country: "مصر", club: "برشلونة", value: "€700K" },
    { id: 3, name: "محمد القحطاني", position: "CF", age: 10, rating: "75", country: "مصر", club: "برشلونة", value: "€620K" },
    { id: 4, name: "محمد القحطاني", position: "CF", age: 30, rating: "80", country: "مصر", club: "برشلونة", value: "€620K" },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-10">
      <div className="text-center mb-6 md:mb-10 pt-4">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-800 mb-3">
          مرحباً {user?.name || 'نادي الاتحاد'} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          الجمعة، 1 يناير 2025 — إليك آخر ما يدور في المنصة
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 w-full mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl font-bold text-gray-800 mb-2">
              {stat.value}
            </span>
            <span className="text-gray-400 text-xs font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">اللاعبون المقترحون بالذكاء الاصطناعي</h2>
          <button className="text-blue-700 text-sm font-bold hover:underline">عرض الكل</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-4 font-medium text-right px-4">اللاعب</th>
                <th className="pb-4 font-medium">المركز</th>
                <th className="pb-4 font-medium">العمر</th>
                <th className="pb-4 font-medium">التقييم</th>
                <th className="pb-4 font-medium">الجنسية</th>
                <th className="pb-4 font-medium">النادي</th>
                <th className="pb-4 font-medium">القيمة السوقية</th>
                <th className="pb-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <Avatar name={player.name} size="sm" />
                    <span className="font-semibold text-gray-800">{player.name}</span>
                  </td>
                  <td className="py-4 text-gray-600">{player.position}</td>
                  <td className="py-4 text-gray-600">{player.age}</td>
                  <td className="py-4 text-yellow-500 font-semibold text-xs">⭐ {player.rating}</td>
                  <td className="py-4 text-gray-600">{player.country}</td>
                  <td className="py-4 text-gray-600">{player.club}</td>
                  <td className="py-4 text-gray-600">{player.value}</td>
                  <td className="py-4">
                    <button className="text-blue-700 hover:underline text-xs font-bold">عرض الملف الشخصي</button>
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
import { useAuth } from '../../hooks/useAuth';
import type { Player, StatItem } from '../../types';
import HomeStats from './components/HomeStats';
import HomeSuggestedTable from './components/HomeSuggestedTable';

const DEFAULT_STATS: StatItem[] = [
  { id: 1, value: "99", label: "اللاعبون المشاهدون" },
  { id: 2, value: "20", label: "اللاعبون المقترحون" },
  { id: 3, value: "10", label: "اللاعبون المحفوظون" },
  { id: 4, value: "30", label: "إجمالي التعاقدات" },
  { id: 5, value: "247", label: "الزيارات الحالية" },
];

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: "محمد القحطاني", position: "CF", age: 20, overall: 87, country: "مصر", club: "برشلونة", value: "€620K", foot: "يمين", height: "175", aiScore: 87 },
  { id: 2, name: "عبدالرحمن الغامدي", position: "CM", age: 22, overall: 89, country: "السعودية", club: "الاتفاق", value: "€2.5M", foot: "يمين", height: "180", aiScore: 89 },
  { id: 3, name: "أحمد الرشيدي", position: "CB", age: 24, overall: 82, country: "مصر", club: "الأهلي", value: "€500K", foot: "يمين", height: "185", aiScore: 82 },
  { id: 4, name: "رياض محرز", position: "RW", age: 33, overall: 86, country: "الجزائر", club: "الأهلي السعودي", value: "€12M", foot: "يسار", height: "179", aiScore: 86 },
];

const Home = () => {
  const { user, players: contextPlayers } = useAuth();

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const playersList = contextPlayers && contextPlayers.length > 0 
    ? contextPlayers 
    : DEFAULT_PLAYERS;

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

      <HomeStats stats={DEFAULT_STATS} />

      <HomeSuggestedTable players={playersList} />
    </div>
  );
};

export default Home;

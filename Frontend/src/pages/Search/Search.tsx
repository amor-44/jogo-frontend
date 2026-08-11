import { useState, useMemo } from 'react';
import PlayerCard from '../../components/PlayerCard';
import type { Player } from '../../types';

const ALL_PLAYERS: Player[] = [
  { id: 1, name: "عبدالرحمن الغامدي", position: "وسط", age: 22, country: "السعودية", foot: "اليمنى", club: "الاتفاق", height: "178 سم", overall: 82, aiScore: 89, value: "€2.5M" },
  { id: 2, name: "محمد القحطاني", position: "مهاجم", age: 20, country: "السعودية", foot: "اليسرى", club: "الهلال", height: "175 سم", overall: 85, aiScore: 92, value: "€4.0M" },
  { id: 3, name: "أحمد الرشيدي", position: "مدافع", age: 12, country: "مصر", foot: "اليمنى", club: "الأهلي (براعم)", height: "150 سم", overall: 70, aiScore: 85, value: "€50K" },
  { id: 4, name: "سعود عبد الحميد", position: "مدافع", age: 24, country: "السعودية", foot: "اليمنى", club: "الاتحاد", height: "171 سم", overall: 81, aiScore: 87, value: "€3.2M" },
  { id: 5, name: "عمر السومة", position: "مهاجم", age: 35, country: "سوريا", foot: "اليمنى", club: "العربي", height: "192 سم", overall: 80, aiScore: 78, value: "€1.2M" },
  { id: 6, name: "ياسين بونو", position: "حارس", age: 33, country: "المغرب", foot: "اليمنى", club: "الهلال", height: "195 سم", overall: 88, aiScore: 90, value: "€9.0M" },
  { id: 7, name: "سالم الدوسري", position: "جناح", age: 32, country: "السعودية", foot: "كلاهما", club: "الهلال", height: "174 سم", overall: 86, aiScore: 88, value: "€2.0M" },
  { id: 8, name: "إمام عاشور", position: "وسط", age: 26, country: "مصر", foot: "اليمنى", club: "الأهلي", height: "182 سم", overall: 83, aiScore: 86, value: "€3.5M" },
  { id: 9, name: "علي مبخوت", position: "مهاجم", age: 33, country: "الإمارات", foot: "اليمنى", club: "الجزيرة", height: "177 سم", overall: 81, aiScore: 82, value: "€1.5M" },
  { id: 10, name: "حمزة علاء", position: "حارس", age: 8, country: "مصر", foot: "اليمنى", club: "أكاديمية مصر", height: "135 سم", overall: 65, aiScore: 80, value: "€10K" },
  { id: 11, name: "عصام الحضري", position: "حارس", age: 44, country: "مصر", foot: "اليمنى", club: "اعتزال/خبرة", height: "188 سم", overall: 85, aiScore: 75, value: "€100K" },
  { id: 12, name: "رياض محرز", position: "جناح", age: 33, country: "الجزائر", foot: "اليسرى", club: "الأهلي السعودي", height: "179 سم", overall: 86, aiScore: 89, value: "€12M" },
];

const ARAB_COUNTRIES = [
  'الكل', 'مصر', 'السعودية', 'الإمارات', 'المغرب', 'الجزائر', 'تونس', 
  'قطر', 'الكويت', 'البحرين', 'عمان', 'الأردن', 'لبنان', 'سوريا', 
  'العراق', 'فلسطين', 'السودان', 'ليبيا', 'اليمن', 'موريتانيا'
];

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('الكل');
  const [selectedCountry, setSelectedCountry] = useState('الكل');
  const [minAge, setMinAge] = useState(6);
  const [maxAge, setMaxAge] = useState(45);
  const [selectedFoot, setSelectedFoot] = useState('الكل');

  const positions = ['الكل', 'حارس', 'مدافع', 'وسط', 'مهاجم', 'جناح'];
  const feet = ['الكل', 'اليمنى', 'اليسرى', 'كلاهما'];

  const filteredPlayers = useMemo(() => {
    return ALL_PLAYERS.filter((player) => {
      const matchesName = player.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesPosition = selectedPosition === 'الكل' || player.position === selectedPosition;
      const matchesCountry = selectedCountry === 'الكل' || player.country === selectedCountry;
      const matchesAge = player.age >= minAge && player.age <= maxAge;
      const matchesFoot = selectedFoot === 'الكل' || player.foot === selectedFoot;

      return matchesName && matchesPosition && matchesCountry && matchesAge && matchesFoot;
    });
  }, [searchTerm, selectedPosition, selectedCountry, minAge, maxAge, selectedFoot]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedPosition('الكل');
    setSelectedCountry('الكل');
    setMinAge(6);
    setMaxAge(45);
    setSelectedFoot('الكل');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2" dir="rtl">
      <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <span className="text-gray-400 text-lg mr-2">🔍</span>
        <input 
          type="text" 
          placeholder="ابحث بالاسم أو النادي أو الجنسية..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 text-right"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-gray-400 hover:text-gray-600 font-bold px-2">
            مسح
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-right space-y-6">
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <span>⚙️</span> تصفية متقدمة
          </h3>
          <button 
            onClick={handleReset}
            className="text-xs text-[#2B43A1] font-bold hover:underline cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">المركز</label>
            <div className="flex flex-wrap gap-1.5">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedPosition === pos 
                      ? 'bg-[#2B43A1] text-white shadow-xs' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">الجنسية</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl p-2.5 outline-none focus:border-[#2B43A1]"
            >
              {ARAB_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-600">نطاق العمر</label>
              <span className="text-[11px] font-extrabold text-[#2B43A1]">{minAge} - {maxAge} سنة</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="range" min="6" max="45" value={minAge} 
                onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
                className="w-full accent-[#2B43A1] cursor-pointer"
              />
              <input 
                type="range" min="6" max="45" value={maxAge} 
                onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
                className="w-full accent-[#2B43A1] cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">القدم المفضلة</label>
            <div className="flex flex-wrap gap-1.5">
              {feet.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFoot(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFoot === f 
                      ? 'bg-[#2B43A1] text-white shadow-xs' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#1C2C5E]">
            نتائج البحث ({filteredPlayers.length})
          </h2>
        </div>

        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
            <span className="text-4xl mb-3 block">⚽</span>
            <h3 className="text-base font-bold text-gray-700 mb-1">لم يتم العثور على لاعبين مطابقين</h3>
            <p className="text-xs text-gray-400">جرب تقليل الفلاتر أو تغيير مصطلحات البحث للعثور على النتائج المطلوبة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

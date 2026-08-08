import { useState, useMemo } from 'react';
import PlayerCard from '../components/PlayerCard';

const ALL_PLAYERS = [
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن اللاعبين فقط (بالاسم، النادي، إلخ)..."
          className="w-full bg-transparent text-gray-700 font-medium text-sm outline-none placeholder-gray-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-gray-400 hover:text-red-500 font-bold px-2">
            ✖ مسح
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="w-full md:w-1/4 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#1C2C5E] text-sm">الفلاتر المتقدمة</h3>
              <button onClick={handleReset} className="text-blue-600 text-xs font-bold hover:underline">
                إعادة تعيين
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 mb-3">المركز</p>
              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      selectedPosition === pos
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 mb-3">الدولة</p>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
              >
                {ARAB_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-500">نطاق العمر</p>
                <span className="text-xs font-bold text-blue-600">
                  {minAge} - {maxAge} سنة
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">الحد الأدنى: {minAge} سنة</label>
                  <input
                    type="range"
                    min="6"
                    max="45"
                    value={minAge}
                    onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">الحد الأقصى: {maxAge} سنة</label>
                  <input
                    type="range"
                    min="6"
                    max="45"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-3">القدم المفضلة</p>
              <div className="flex flex-wrap gap-2">
                {feet.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFoot(f)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      selectedFoot === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4 flex flex-col">
          <div className="mb-6 text-right">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">البحث عن اللاعبين</h1>
            <p className="text-gray-500 text-xs">
              تم العثور على <span className="font-bold text-blue-600">{filteredPlayers.length}</span> لاعب يطابق معاييرك
            </p>
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">🔍</span>
              <h3 className="text-base font-bold text-gray-700 mb-1">لا يوجد لاعبون يطابقون هذه المعايير</h3>
              <p className="text-xs text-gray-400 mb-4">جرب توسيع نطاق البحث أو تغيير الفلاتر.</p>
              <button onClick={handleReset} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100">
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
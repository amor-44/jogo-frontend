import { useState, useEffect, useCallback } from 'react';
import PlayerCard from '../../components/PlayerCard';
import { playerService } from '../../services/playerService';
import type { PlayerCardDto } from '../../types';
import { Loader2 } from 'lucide-react';

const ARAB_COUNTRIES = [
  'الكل', 'مصر', 'السعودية', 'الإمارات', 'المغرب', 'الجزائر', 'تونس', 
  'قطر', 'الكويت', 'البحرين', 'عمان', 'الأردن', 'لبنان', 'سوريا', 
  'العراق', 'فلسطين', 'السودان', 'ليبيا', 'اليمن', 'موريتانيا'
];

const POSITION_VALUE_MAP: Record<string, string> = {
  'مهاجم': 'Striker',
  'جناح أيسر': 'LeftWinger',
  'جناح أيمن': 'RightWinger',
  'وسط هجومي': 'AttackingMidfielder',
  'وسط': 'CentralMidfielder',
  'وسط دفاعي': 'DefensiveMidfielder',
  'ظهير أيسر': 'LeftBack',
  'ظهير أيمن': 'RightBack',
  'قلب دفاع': 'CenterBack',
  'حارس': 'Goalkeeper',
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('الكل');
  const [selectedCountry, setSelectedCountry] = useState('الكل');
  const [minAge, setMinAge] = useState(6);
  const [maxAge, setMaxAge] = useState(45);
  
  const [players, setPlayers] = useState<PlayerCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const positions = ['الكل', 'مهاجم', 'جناح أيمن', 'جناح أيسر', 'وسط', 'وسط دفاعي', 'وسط هجومي', 'قلب دفاع', 'ظهير أيمن', 'ظهير أيسر', 'حارس'];

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const backendPosition = selectedPosition !== 'الكل' ? (POSITION_VALUE_MAP[selectedPosition] || selectedPosition) : undefined;
      const response = await playerService.getAllPlayers({
        page: 1,
        pageSize: 50,
        minAge: minAge,
        maxAge: maxAge,
        position: backendPosition,
        country: selectedCountry !== 'الكل' ? selectedCountry : undefined,
      });

      let filtered = response.items || [];
      
      // Client-side filtering for search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p => {
          return (
            (p.fullName && p.fullName.toLowerCase().includes(query)) ||
            (p.currentClub && p.currentClub.toLowerCase().includes(query)) ||
            (p.country && p.country.toLowerCase().includes(query)) ||
            (p.nationality && p.nationality.toLowerCase().includes(query))
          );
        });
      }

      setPlayers(filtered);
      setTotalPlayers(filtered.length);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedPosition, selectedCountry, minAge, maxAge]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPlayers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchPlayers]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedPosition('الكل');
    setSelectedCountry('الكل');
    setMinAge(6);
    setMaxAge(45);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2 font-sans" dir="rtl">
      <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <span className="text-gray-400 text-lg mr-2">🔍</span>
        <input 
          type="text" 
          placeholder="ابحث بالاسم أو النادي أو الدولة..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 text-right"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-gray-400 hover:text-gray-600 font-bold px-2 cursor-pointer">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <label className="block text-xs font-bold text-gray-600 mb-2">الجنسية / الدولة</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl p-2.5 outline-none focus:border-[#2B43A1] cursor-pointer"
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
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#1C2C5E] flex items-center gap-2">
            نتائج البحث ({totalPlayers})
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          </h2>
        </div>

        {isLoading && players.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B43A1]" />
          </div>
        ) : players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
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

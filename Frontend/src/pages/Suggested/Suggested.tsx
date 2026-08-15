import { useState, useEffect } from 'react';
import PlayerCard from '../../components/PlayerCard';
import { playerService } from '../../services/playerService';
import type { PlayerCardDto, AnalysisReportDto } from '../../types';
import { Loader2, TrendingUp, Trophy } from 'lucide-react';

const Suggested = () => {
  const [players, setPlayers] = useState<PlayerCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    playerService.getAllPlayers({ page: 1, pageSize: 50 })
      .then((res) => {
        if (isMounted && res) {
          const items = res.items || [];
          
          // Read local saved evaluation reports if any
          let savedReports: (AnalysisReportDto & { playerId?: string })[] = [];
          try {
            const savedStr = localStorage.getItem('saved_ai_analysis_reports');
            if (savedStr) savedReports = JSON.parse(savedStr);
          } catch {
            // Ignore parsing error
          }

          // Enrich scores & sort top-rated players first (اللعيبة الثقيلة / high ratings)
          const enriched = items.map((p) => {
            let score = p.latestOverallScore ?? p.overallScore ?? 0;
            if (!score && savedReports.length > 0) {
              const match = savedReports.find((r) => String(r.playerId) === String(p.id) || String(r.videoId) === String(p.id));
              if (match?.overallScore) score = match.overallScore;
            }
            return { ...p, effectiveScore: score };
          });

          // Sort descending by rating score
          enriched.sort((a, b) => (b.effectiveScore || 0) - (a.effectiveScore || 0));

          setPlayers(enriched);
        }
      })
      .catch((err) => console.error('Error fetching suggested players:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 pt-2 font-sans" dir="rtl">
      <div className="text-right mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C2C5E] mb-1 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#2B43A1]" />
          اللاعبون المقترحون بالذكاء الاصطناعي
        </h1>
        <p className="text-gray-400 text-xs font-medium">
          ترشيحات ذكية بناءً على أعلى معدلات الأداء والتقييمات الفنية المتقدمة ({players.length})
        </p>
      </div>

      {isLoading ? (
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
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا يوجد لاعبون مقترحون حالياً</h3>
          <p className="text-xs text-gray-400">ستظهر هنا ترشيحات اللاعبين المميزين بناءً على تحليلات الأداء المتقدمة.</p>
        </div>
      )}
    </div>
  );
};

export default Suggested;

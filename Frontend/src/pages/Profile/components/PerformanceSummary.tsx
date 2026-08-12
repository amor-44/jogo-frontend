import { BarChart3, Video } from 'lucide-react';
import type { AnalysisReportDto } from '../../../types';

interface PerformanceSummaryProps {
  report?: AnalysisReportDto | null;
}

export const PerformanceSummary = ({ report }: PerformanceSummaryProps) => {
  if (!report) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-2xs border border-gray-100 text-center font-sans" dir="rtl">
        <div className="w-12 h-12 bg-blue-50 text-[#2B43A1] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Video className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm mb-1">لا يوجد تقرير تحليل متاح حالياً</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          قم برفع فيديو لمبارياتك أو تدريباتك واضغط على زر التحليل بالذكاء الاصطناعي لعرض تقييم مهاراتك وملخص أداءك الفعلي.
        </p>
      </div>
    );
  }

  const metrics = report.metrics || report.performanceMetrics || {};
  const overall = report.overallScore || 0;
  
  const formattedDate = report.completedAt || report.generatedAt
    ? new Date(report.completedAt || report.generatedAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'حديثاً';

  const items = [
    { 
      label: 'درجة أداء المركز التكتيكي', 
      value: metrics.positionScore ?? 0, 
      color: 'bg-[#2B43A1]' 
    },
    { 
      label: 'دقة التمرير', 
      value: metrics.passingAccuracy ?? metrics.passing ?? 0, 
      color: 'bg-blue-600' 
    },
    { 
      label: 'التحكم بالكرة والمراوغة', 
      value: metrics.ballControl ?? metrics.dribbling ?? 0, 
      color: 'bg-indigo-600' 
    },
    { 
      label: 'التمركز والرؤية الميدانية', 
      value: metrics.positioningScore ?? metrics.positioning ?? 0, 
      color: 'bg-emerald-600' 
    },
    { 
      label: 'كفاءة الحركة والسرعة', 
      value: metrics.movementEfficiency ?? metrics.speed ?? 0, 
      color: 'bg-cyan-600' 
    },
    { 
      label: 'المهارات والتدخلات الدفاعية', 
      value: metrics.defensiveActions ?? metrics.defending ?? 0, 
      color: 'bg-amber-600' 
    },
    { 
      label: 'التأثير الهجومي وصناعة الفرص', 
      value: metrics.attackingImpact ?? metrics.shooting ?? 0, 
      color: 'bg-purple-600' 
    },
    { 
      label: 'سرعة ودقة اتخاذ القرار', 
      value: metrics.decisionMaking ?? 0, 
      color: 'bg-rose-600' 
    },
  ].filter(i => i.value > 0);

  const getBadge = (score: number) => {
    if (score >= 85) return { label: 'ممتاز جداً', bg: 'bg-emerald-50 text-emerald-700' };
    if (score >= 70) return { label: 'متفوق', bg: 'bg-blue-50 text-[#2B43A1]' };
    if (score >= 50) return { label: 'جيد', bg: 'bg-amber-50 text-amber-700' };
    return { label: 'يحتاج تطوير', bg: 'bg-red-50 text-red-700' };
  };

  const badge = getBadge(overall);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-medium mb-1">درجة الذكاء الاصطناعي</span>
          <span className="text-3xl font-extrabold text-[#2B43A1] mb-2">{overall} / 100</span>
          <span className={`${badge.bg} text-[10px] font-bold px-3 py-1 rounded-full`}>{badge.label}</span>
        </div>

        <div className="bg-[#EBFDF5] p-5 rounded-3xl border border-emerald-100 text-center flex flex-col items-center justify-center">
          <span className="text-emerald-700 text-xs font-medium mb-1">مستوى الأداء</span>
          <span className="text-2xl font-bold text-emerald-800 mb-1">{overall >= 75 ? 'متقدم' : overall >= 55 ? 'متوسط' : 'مبتدئ'}</span>
          <span className="text-emerald-600 text-[10px]">تقييم الأداء الفعلي</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-medium mb-1">تاريخ التحليل</span>
          <span className="text-sm font-bold text-gray-800 mb-1">{formattedDate}</span>
          <span className="text-[10px] text-gray-400">إصدار النموذج: {report.aiModelVersion || 'JogoAI-v1'}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2B43A1]" /> المقاييس الفنية التفصيلية (Performance Metrics)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-900 font-extrabold">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}></div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-2 text-xs text-gray-400 text-center py-4">
              لا تتوفر تفاصيل إحصائية رقمية في هذا التقرير
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;

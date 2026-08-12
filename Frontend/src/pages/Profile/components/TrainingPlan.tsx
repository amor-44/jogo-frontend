import type { AnalysisReportDto, TrainingPlanItem } from '../../../types';

interface TrainingPlanProps {
  report?: AnalysisReportDto | null;
}

export const TrainingPlan = ({ report }: TrainingPlanProps) => {
  if (!report) return null;

  const recommendations = report.recommendations || [];
  const weaknesses = report.weaknesses || [];

  if (recommendations.length === 0 && weaknesses.length === 0) return null;

  const scheduleItems: TrainingPlanItem[] = recommendations.slice(0, 4).map((rec, index) => {
    const days = [
      'الإثنين / الأربعاء - 45 دقيقة',
      'الثلاثاء / الخميس - 30 دقيقة',
      'الجمعة - 30 دقيقة',
      'السبت - 60 دقيقة',
    ];
    const tags = ['+4 تطوير مهارة', '+3 كفاءة', '+2 لياقة', '+5 أداء عام'];
    return {
      title: rec,
      time: days[index % days.length],
      tag: tags[index % tags.length],
    };
  });

  const targetScore = Math.min(100, (report.overallScore || 70) + 8);

  return (
    <div className="bg-white p-4 md:p-8 rounded-4xl shadow-2xs border border-gray-100/80">
      <div className="flex items-center justify-start gap-2.5 mb-8">
        <h3 className="font-bold text-[#1C2C5E] text-xl">خطة التدريب والتأهيل الموصى بها</h3>
        <svg className="w-6 h-6 text-[#2B43A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex flex-row-reverse justify-between items-center text-sm font-bold mb-4">
            <span className="text-gray-600">التقييم الحالي</span>
            <span className="text-[#2B43A1] text-base">{report.overallScore || 0} / 100</span>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden">
            <div className="bg-[#2B43A1] h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, report.overallScore || 0)}%` }}></div>
          </div>
        </div>

        <div className="bg-[#F5F7FF] p-6 rounded-2xl border border-blue-50/50 flex flex-row-reverse justify-between items-center">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-medium block mb-1">الهدف المستهدف القادم</span>
            <span className="text-sm font-bold text-[#1C2C5E]">رفع كفاءة نقاط الضعف المحددة</span>
          </div>
          <div className="text-left">
            <span className="text-xs text-[#2B43A1] font-bold block mb-1">الدرجة المستهدفة</span>
            <div className="text-2xl font-extrabold text-[#2B43A1]">
              <span className="text-gray-300 font-normal text-base">/ 100</span> {targetScore}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {scheduleItems.map((item, index) => (
          <div key={index} className="border border-gray-100/90 p-4 rounded-2xl flex flex-row-reverse justify-between items-center hover:border-blue-100 transition-all bg-white shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h4 className="font-bold text-sm text-[#1C2C5E] mb-0.5">{item.title}</h4>
                <p className="text-xs text-gray-400 font-medium">{item.time}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2B43A1] shrink-0"></span>
            </div>

            <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#EBFDF5] text-[#10B981]">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingPlan;

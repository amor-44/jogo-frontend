import { Bot } from 'lucide-react';
import type { AnalysisReportDto } from '../../../types';

interface AIAnalysisBoxComponentProps {
  firstName: string;
  report?: AnalysisReportDto | null;
}

export const AIAnalysisBox = ({ firstName, report }: AIAnalysisBoxComponentProps) => {
  if (!report || (!report.summary && (!report.recommendations || report.recommendations.length === 0))) {
    return null;
  }

  return (
    <div className="bg-[#EEF2FF] p-6 rounded-3xl border border-indigo-100">
      <div className="flex items-center gap-2 mb-3 text-[#2B43A1] font-bold text-sm">
        <Bot className="w-5 h-5" /> ملخص تحليل الذكاء الاصطناعي للاعب {firstName}
      </div>
      {report.summary && (
        <p className="text-gray-700 text-xs leading-relaxed font-medium mb-4">
          {report.summary}
        </p>
      )}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-indigo-50 text-xs text-gray-600 leading-relaxed font-medium">
          <span className="font-bold text-[#2B43A1] block mb-1">💡 التوصيات الفنية المقترحة:</span>
          <ul className="list-disc list-inside space-y-1">
            {report.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisBox;

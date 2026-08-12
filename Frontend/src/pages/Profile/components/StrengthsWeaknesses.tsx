import { TrendingUp, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AnalysisReportDto } from '../../../types';

interface StrengthsWeaknessesProps {
  report?: AnalysisReportDto | null;
}

export const StrengthsWeaknesses = ({ report }: StrengthsWeaknessesProps) => {
  if (!report) return null;

  const strengths = report.strengths || [];
  const weaknesses = report.weaknesses || [];

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> نقاط القوة الرئيسية
        </h3>
        <div className="space-y-3">
          {strengths.map((item, idx) => (
            <div key={idx} className="bg-[#EBFDF5]/60 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-emerald-100/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <span>{item}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          ))}
          {strengths.length === 0 && (
            <p className="text-xs text-gray-400 py-2 text-center">لا تتوفر نقاط قوة محددة حالياً</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" /> نقاط تحتاج للتطوير
        </h3>
        <div className="space-y-3">
          {weaknesses.map((item, idx) => (
            <div key={idx} className="bg-red-50/50 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-red-100/50">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <span>{item}</span>
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              </div>
            </div>
          ))}
          {weaknesses.length === 0 && (
            <p className="text-xs text-gray-400 py-2 text-center">لا تتوفر نقاط ضعف محددة حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrengthsWeaknesses;

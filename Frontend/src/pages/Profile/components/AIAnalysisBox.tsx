import { Bot } from 'lucide-react';
import type { AIAnalysisBoxProps } from '../../../types';

export const AIAnalysisBox = ({ firstName }: AIAnalysisBoxProps) => {
  return (
    <div className="bg-[#EEF2FF] p-6 rounded-3xl border border-indigo-100">
      <div className="flex items-center gap-2 mb-3 text-[#2B43A1] font-bold text-sm">
        <Bot className="w-5 h-5" /> تحليل الذكاء الاصطناعي
      </div>
      <p className="text-gray-700 text-xs leading-relaxed font-medium mb-4">
        يُظهر {firstName} رؤية تمريرية استثنائية وقدرة على اتخاذ القرار تحت الضغط، إذ يُصنَّف ضمن أفضل 15% للاعبي مركزه من بين جميع المباريات المحللة هذا الموسم.
      </p>
      <div className="bg-white p-4 rounded-2xl border border-indigo-50 text-xs text-gray-600 leading-relaxed font-medium">
        أهداف التحسين الرئيسية هي كفاءة الإنهاء والقوة الجسدية في المنازلات الجوية. يُوصى بخطة تدريبية مكثفة لمدة 4 أسابيع. التحسن المتوقع: <span className="text-[#2B43A1] font-bold">+6 إلى +9 نقاط بحلول نهاية أغسطس 2026</span>.
      </div>
    </div>
  );
};

export default AIAnalysisBox;

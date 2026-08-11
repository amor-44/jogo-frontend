import { BarChart3 } from 'lucide-react';

export const PerformanceSummary = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-medium mb-1">درجة الذكاء الاصطناعي</span>
          <span className="text-3xl font-extrabold text-[#2B43A1] mb-2">82</span>
          <span className="bg-blue-50 text-[#2B43A1] text-[10px] font-bold px-3 py-1 rounded-full">متفوق</span>
        </div>

        <div className="bg-[#EBFDF5] p-5 rounded-3xl border border-emerald-100 text-center flex flex-col items-center justify-center">
          <span className="text-emerald-700 text-xs font-medium mb-1">مستوى الأداء</span>
          <span className="text-2xl font-bold text-emerald-800 mb-1">متقدم</span>
          <span className="text-emerald-600 text-[10px]">مستوى الأداء العام</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 text-center flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-medium mb-1">آخر تحليل</span>
          <span className="text-lg font-bold text-gray-800 mb-1">19 يوليو 2026</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2B43A1]" /> ملخص الأداء
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">التمرير</span>
              <span className="text-blue-600 font-extrabold">85</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">السرعة</span>
              <span className="text-emerald-600 font-extrabold">78</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">المراوغة</span>
              <span className="text-blue-500 font-extrabold">73</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '73%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">الإنهاء</span>
              <span className="text-red-600 font-extrabold">58</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">الدفاع</span>
              <span className="text-red-700 font-extrabold">55</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-red-700 h-2.5 rounded-full" style={{ width: '55%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceSummary;

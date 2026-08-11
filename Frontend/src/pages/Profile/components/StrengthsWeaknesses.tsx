import { TrendingUp, ShieldAlert, CheckCircle2, Eye, Zap, Activity, Footprints, Target, AlertCircle, Dumbbell } from 'lucide-react';

const STRENGTHS = [
  { title: "دقة التمرير", score: "87", icon: CheckCircle2 },
  { title: "الرؤية الكروية", score: "84", icon: Eye },
  { title: "سرعة القرار", score: "81", icon: Zap },
  { title: "معدل العمل", score: "90", icon: Activity },
];

const WEAKNESSES = [
  { title: "القدم الضعيفة", score: "52", icon: Footprints },
  { title: "الإنهاء", score: "58", icon: Target },
  { title: "الضربة الرأسية", score: "55", icon: AlertCircle },
  { title: "القوة البدنية", score: "61", icon: Dumbbell },
];

export const StrengthsWeaknesses = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> نقاط القوة
        </h3>
        <div className="space-y-3">
          {STRENGTHS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-[#EBFDF5]/60 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-emerald-100/50">
                <span className="font-bold text-emerald-900">{item.score}</span>
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <span>{item.title}</span>
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xs border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" /> نقاط الضعف
        </h3>
        <div className="space-y-3">
          {WEAKNESSES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-red-50/50 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-red-100/50">
                <span className="font-bold text-red-700">{item.score}</span>
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <span>{item.title}</span>
                  <Icon className="w-4 h-4 text-red-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StrengthsWeaknesses;

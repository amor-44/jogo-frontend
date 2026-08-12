import { Plus, Trash2, Activity, RotateCcw, Loader2, BarChart2 } from 'lucide-react';
import type { VideoHistoryProps } from '../../../types';

export const VideoHistory = ({ videos, onUploadClick, onDelete, onAnalyze, onRetry, onVideoClick }: VideoHistoryProps) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100 font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 text-xs">سجل الفيديوهات</h3>
        <button 
          onClick={onUploadClick}
          className="bg-gray-100 text-[#2B43A1] text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <Plus className="w-3 h-3" /> رفع جديد
        </button>
      </div>

      <div className="space-y-3">
        {videos.map((vid) => (
          <div 
            key={vid.id} 
            onClick={() => onVideoClick?.(vid.id)}
            className="relative rounded-2xl overflow-hidden h-32 border border-gray-100 group shadow-2xs cursor-pointer"
          >
            <img src={vid.bg} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-slate-950/40 pointer-events-none"></div>
            
            {/* Status Badge */}
            <span className={`absolute top-2 right-2 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full backdrop-blur-xs text-white z-10 ${
              vid.status === 'Analyzed' ? 'bg-emerald-500/90' :
              vid.status === 'Processing' ? 'bg-blue-500/90 animate-pulse' :
              vid.status === 'Failed' ? 'bg-red-500/90' :
              'bg-gray-600/90'
            }`}>
              {vid.tag}
            </span>

            {/* Dark background overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            {/* Actions (Top Left) */}
            <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(vid.id); }}
                  className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-md transition-colors cursor-pointer"
                  title="حذف الفيديو"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Info (Bottom) */}
            <div className="absolute bottom-2 right-2 left-2 flex justify-between items-end text-white pointer-events-none z-10">
              <div className="min-w-0 flex-1 pl-2">
                <h5 className="font-bold text-xs leading-tight mb-0.5 truncate">{vid.title}</h5>
                <span className="text-[10px] text-gray-300 font-medium">{vid.date}</span>
              </div>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-200 shrink-0">{vid.duration}</span>
            </div>

            {/* Middle Action Buttons based on Status */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none gap-2">
              {vid.status === 'Pending' && onAnalyze && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onAnalyze(vid.id); }}
                  className="bg-[#2B43A1] hover:bg-blue-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md pointer-events-auto transition-transform active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5" /> بدء التحليل بالذكاء الاصطناعي
                </button>
              )}

              {vid.status === 'Processing' && (
                <div className="bg-[#2B43A1]/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري المعالجة...
                </div>
              )}

              {vid.status === 'Failed' && onRetry && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRetry(vid.id); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md pointer-events-auto transition-transform active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
                </button>
              )}

              {vid.status === 'Analyzed' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onVideoClick?.(vid.id); }}
                  className="bg-[#2B43A1] hover:bg-blue-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md pointer-events-auto transition-transform active:scale-95"
                  title="عرض التقرير والتحليل"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> عرض التحليل
                </button>
              )}
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium">لا توجد فيديوهات مرفوعة حتى الآن</p>
            <button
              onClick={onUploadClick}
              className="mt-2 text-xs font-bold text-[#2B43A1] hover:underline cursor-pointer"
            >
              ارفع أول فيديو لمباراتك
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoHistory;

import { Play, Plus, Trash2, Activity, RotateCcw, Loader2 } from 'lucide-react';
import type { VideoHistoryProps } from '../../../types';

export const VideoHistory = ({ videos, onUploadClick, onDelete, onAnalyze, onRetry, onVideoClick }: VideoHistoryProps) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-2xs border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 text-xs">سجل الفيديوهات</h3>
        <button 
          onClick={onUploadClick}
          className="bg-gray-100 text-[#2B43A1] text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-50 cursor-pointer"
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
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40 pointer-events-none"></div>
            
            {/* Status Badge */}
            <span className={`absolute top-2 right-2 font-extrabold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs text-white ${
              vid.status === 'Analyzed' ? 'bg-emerald-500/90' :
              vid.status === 'Processing' ? 'bg-blue-500/90' :
              vid.status === 'Failed' ? 'bg-red-500/90' :
              'bg-gray-500/90'
            }`}>
              {vid.tag}
            </span>

            {/* Dark background overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            {/* Actions (Top Left) */}
            <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(vid.id); }}
                  className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-md transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Info (Bottom) */}
            <div className="absolute bottom-2 right-2 left-2 flex justify-between items-end text-white pointer-events-none">
              <div>
                <h5 className="font-bold text-xs leading-tight mb-0.5">{vid.title}</h5>
                <span className="text-[10px] text-gray-300 font-medium">{vid.date}</span>
              </div>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-200">{vid.duration}</span>
            </div>

            {/* Middle Action Buttons based on Status */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none gap-2">
              {vid.status === 'Pending' && onAnalyze && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onAnalyze(vid.id); }}
                  className="bg-[#2B43A1] hover:bg-blue-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md pointer-events-auto"
                >
                  <Activity className="w-3.5 h-3.5" /> تحليل
                </button>
              )}

              {vid.status === 'Processing' && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري التحليل
                </div>
              )}

              {vid.status === 'Failed' && onRetry && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRetry(vid.id); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md pointer-events-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
                </button>
              )}

              {vid.status === 'Analyzed' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); /* TODO: Handle View Report */ }}
                  className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-800 pointer-events-auto"
                  title="عرض التحليل"
                >
                  <Play className="w-4 h-4 fill-white mr-0.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;

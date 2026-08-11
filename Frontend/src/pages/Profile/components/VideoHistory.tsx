import { Play, Plus } from 'lucide-react';
import type { VideoHistoryProps } from '../../../types';

export const VideoHistory = ({ videos, onUploadClick }: VideoHistoryProps) => {
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
        {videos.map((vid, idx) => (
          <div key={idx} className="relative rounded-2xl overflow-hidden h-28 border border-gray-100 group cursor-pointer shadow-2xs">
            <img src={vid.bg} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            
            <span className="absolute top-2 right-2 bg-emerald-500/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs">
              تم التحليل
            </span>

            <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[9px] px-2 py-0.5 rounded-md">
              {vid.tag}
            </span>

            <div className="absolute bottom-2 right-2 left-2 flex justify-between items-end text-white">
              <div>
                <h5 className="font-bold text-xs leading-tight mb-0.5">{vid.title}</h5>
                <span className="text-[10px] text-gray-300 font-medium">{vid.date}</span>
              </div>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-200">{vid.duration}</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-8 h-8 rounded-full bg-[#2B43A1] text-white flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 fill-white mr-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;

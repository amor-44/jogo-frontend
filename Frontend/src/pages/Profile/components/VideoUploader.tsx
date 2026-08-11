import { CheckCircle2, UploadCloud, X } from 'lucide-react';
import type { VideoUploaderProps } from '../../../types';

export const VideoUploader = ({
  uploadedVideoUrl,
  videoName,
  onClearVideo,
  onTriggerUpload,
}: VideoUploaderProps) => {
  return (
    <div className="bg-[#F4F6FF] border-2 border-dashed border-[#2B43A1]/30 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center justify-center shadow-2xs relative overflow-hidden transition-all">
      {uploadedVideoUrl ? (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-bold text-[#1C2C5E] truncate max-w-xs">{videoName}</span>
            <button 
              onClick={onClearVideo}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
              title="حذف الفيديو"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-gray-200">
            <video src={uploadedVideoUrl} controls className="w-full max-h-96 object-contain" />
          </div>

          <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> تم تجهيز الفيديو للتحليل بواسطة Jogo AI
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[#2B43A1] text-white flex items-center justify-center mb-3 shadow-md">
            <UploadCloud className="w-6 h-6" />
          </div>
          
          <h3 className="font-extrabold text-[#1C2C5E] text-base mb-1">رفع فيديو للتحليل بالذكاء الاصطناعي</h3>
          <p className="text-gray-400 text-xs mb-4 font-medium">ارفع فيديو جديد لتحليل الأداء والحصول على تقرير شامل</p>

          <button 
            onClick={onTriggerUpload}
            className="bg-[#2B43A1] text-white font-bold text-xs px-8 py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-sm cursor-pointer mb-2"
          >
            اختر ملف فيديو
          </button>
          
          <p className="text-gray-400 text-[10px] font-medium">
            أو اسحب الملف هنا <br />
            يدعم MP4, AVI, MOV, MKV | الحد الأقصى 2GB
          </p>
        </>
      )}
    </div>
  );
};

export default VideoUploader;

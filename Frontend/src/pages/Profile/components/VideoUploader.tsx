import { CheckCircle2, UploadCloud, X, Loader2, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import type { VideoUploaderProps } from '../../../types';

export const VideoUploader = ({
  uploadedVideoUrl,
  videoName,
  isUploading,
  currentVideoId,
  currentVideoStatus,
  onClearVideo,
  onTriggerUpload,
  onAnalyze,
  onRetry,
}: VideoUploaderProps) => {
  return (
    <div className="bg-[#F4F6FF] border-2 border-dashed border-[#2B43A1]/30 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center justify-center shadow-2xs relative overflow-hidden transition-all font-sans" dir="rtl">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 animate-spin text-[#2B43A1] mb-4" />
          <h3 className="font-extrabold text-[#1C2C5E] text-base mb-1">جاري رفع الفيديو إلى الخادم...</h3>
          <p className="text-gray-400 text-xs font-medium">يرجى الانتظار ثوانٍ معدودة</p>
        </div>
      ) : uploadedVideoUrl ? (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-bold text-[#1C2C5E] truncate max-w-xs">{videoName}</span>
            <button 
              onClick={onClearVideo}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
              title="إغلاق / حذف العرض"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-gray-200">
            <video src={uploadedVideoUrl} controls className="w-full max-h-96 object-contain" />
          </div>

          {/* Dynamic Action & Status Area Below Video */}
          <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentVideoStatus === 'Processing' && (
              <div className="w-full bg-[#2B43A1]/10 border border-[#2B43A1]/30 text-[#2B43A1] px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#2B43A1]" />
                <span>جاري معالجة وتحليل الفيديو بالذكاء الاصطناعي... سيظهر التقرير فور الانتهاء تلقائياً</span>
              </div>
            )}

            {currentVideoStatus === 'Analyzed' && (
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تحليل هذا الفيديو بنجاح! التقرير الفني وخطة التدريب معروضة بالأسفل</span>
              </div>
            )}

            {currentVideoStatus === 'Failed' && (
              <div className="w-full bg-red-50 border border-red-200 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>تعذر إتمام التحليل لهذا الفيديو</span>
                </div>
                {currentVideoId && onRetry && (
                  <button
                    onClick={() => onRetry(currentVideoId)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
                  </button>
                )}
              </div>
            )}

            {(currentVideoStatus === 'Pending' || currentVideoStatus === 'Ready' || !currentVideoStatus) && currentVideoId && onAnalyze && (
              <button
                onClick={() => onAnalyze(currentVideoId)}
                className="w-full bg-linear-to-l from-[#2B43A1] to-[#3D5BC9] hover:opacity-95 text-white font-black text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>بدء التحليل الفني بالذكاء الاصطناعي الآن</span>
              </button>
            )}

            {(!currentVideoStatus || currentVideoStatus === 'Ready') && !currentVideoId && (
              <div className="w-full bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> تم تجهيز الفيديو للتحليل بواسطة Jogo AI
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[#2B43A1] text-white flex items-center justify-center mb-3 shadow-md">
            <UploadCloud className="w-6 h-6" />
          </div>
          
          <h3 className="font-extrabold text-[#1C2C5E] text-base mb-1">رفع فيديو للتحليل بالذكاء الاصطناعي</h3>
          <p className="text-gray-400 text-xs mb-4 font-medium">ارفع فيديو لمباراتك أو تدريباتك للحصول على تقرير شامل وفوري</p>

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

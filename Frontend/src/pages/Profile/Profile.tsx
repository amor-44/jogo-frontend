import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { playerService } from '../../services/playerService';
import { videoService } from '../../services/videoService';
import { reportService } from '../../services/reportService';
// import { aiService } from '../../services/aiService'; // DEMO_MODE_OFF
import { getArabicErrorMessage } from '../../services/api';
import { getFullImageUrl } from '../../utils/url';
import { formatDuration } from '../../utils/formatters';
import type { VideoHistoryItem, PlayerProfileDto, VideoDto, AnalysisReportDto } from '../../types';
import { VideoStatus } from '../../types';
// DEMO_MODE: dynamic generator for AI analysis
import { generateDynamicAnalysisReport } from '../../data/mockAiData';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import VideoHistory from './components/VideoHistory';
import VideoUploader from './components/VideoUploader';
import PerformanceSummary from './components/PerformanceSummary';
import StrengthsWeaknesses from './components/StrengthsWeaknesses';
import AIAnalysisBox from './components/AIAnalysisBox';
import TrainingPlan from './components/TrainingPlan';
import EditProfileModal from './components/EditProfileModal';
import ClubProfile from './ClubProfile';

const PlayerProfileView = () => {
  const { user, playerProfile: contextProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PlayerProfileDto | null>(contextProfile);
  const [videos, setVideos] = useState<VideoDto[]>([]);

  // ── localStorage key for persisting analysis reports across navigation/refresh
  const REPORTS_STORAGE_KEY = 'saved_ai_analysis_reports';

  // Initialise reports from localStorage so they survive page refresh & navigation
  const [reports, setReports] = useState<AnalysisReportDto[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AnalysisReportDto[]) : [];
    } catch {
      return [];
    }
  });

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Helper: persist reports list to localStorage whenever it changes ──────────
  const persistReports = (updated: AnalysisReportDto[]) => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // quota exceeded — fail silently
    }
  };

  const handleProfileUpdated = (updatedProfile: PlayerProfileDto) => {
    setProfile(updatedProfile);
  };

  const handleAvatarUploaded = (newAvatarUrl: string) => {
    setProfile((prev) => prev ? { ...prev, profilePictureUrl: newAvatarUrl } : prev);
  };

  // Clear error after 8 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    let isMounted = true;

    // Read locally-persisted reports first — our source of truth for demo mode
    let localReports: AnalysisReportDto[] = [];
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      localReports = saved ? (JSON.parse(saved) as AnalysisReportDto[]) : [];
    } catch {
      // ignore parsing error
    }

    async function loadData() {
      try {
        const [profileRes, videosRes, reportsRes] = await Promise.allSettled([
          playerService.getMe(),
          videoService.getVideos(1, 20),
          reportService.getReports({ page: 1, pageSize: 20 }),
        ]);

        if (isMounted) {
          if (profileRes.status === 'fulfilled' && profileRes.value) {
            setProfile(profileRes.value);
          }

          if (videosRes.status === 'fulfilled' && videosRes.value) {
            const videoList = videosRes.value.items || [];
            const backendReports = (reportsRes.status === 'fulfilled' && reportsRes.value?.items) || [];

            // ── Merge: backend reports first, then fill gaps with local persisted reports ──
            // Local reports only apply if the video still exists on the server
            const videoIdSet = new Set(videoList.map(v => v.id));
            const mergedReports: AnalysisReportDto[] = [
              ...backendReports,
              ...localReports.filter(
                lr => videoIdSet.has(lr.videoId) && !backendReports.some(br => br.videoId === lr.videoId)
              ),
            ];

            // ── Mark videos as Analyzed if we have a report for them (local or backend) ──
            const analyzedIds = new Set(mergedReports.map(r => r.videoId));
            const enrichedVideos = videoList.map(v =>
              analyzedIds.has(v.id) ? { ...v, status: VideoStatus.Analyzed } : v
            );

            setVideos(enrichedVideos);
            if (enrichedVideos.length > 0) {
              const firstVid = enrichedVideos[0];
              setSelectedVideoId((prev) => prev || firstVid.id);
              setUploadedVideoUrl((prev) => prev || getFullImageUrl(firstVid.storageUrl));
              setVideoName((prev) => prev || firstVid.originalFileName);
            }
            // Only overwrite if merged has real content; else keep the localStorage-init state
            if (mergedReports.length > 0) {
              setReports(mergedReports);
              persistReports(mergedReports); // keep localStorage fresh
            }
          } else if (reportsRes.status === 'fulfilled' && reportsRes.value) {
            const backendReports = reportsRes.value.items || [];
            // If backend returned real reports, use them; else keep what localStorage gave us
            if (backendReports.length > 0) {
              setReports(backendReports);
            }
          }
        }
      } catch (err) {
        console.error('فشل تحميل البيانات:', err);
        setErrorMessage(getArabicErrorMessage(err));
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Sync reports to localStorage whenever they change ──────────────────────────
  useEffect(() => {
    if (reports.length > 0) {
      persistReports(reports);
    }
  }, [reports]);

  // Selected active video and active report
  const activeVideo = videos.find((v) => v.id === selectedVideoId) || (videos.length > 0 ? videos[0] : null);
  
  const activeReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId)
    : selectedVideoId
    ? reports.find((r) => r.videoId === selectedVideoId) || null
    : reports.length > 0 ? reports[0] : null;

  const firstName = profile?.fullName?.trim()
    ? profile.fullName.trim().split(' ')[0]
    : user?.name?.trim()
    ? user.name.trim().split(' ')[0]
    : 'اللاعب';

  // Best AI score across all reports — drives the "Best Performance" card in ProfileSidebar
  const bestAiScore = reports.length > 0
    ? Math.max(...reports.map(r => r.overallScore || 0))
    : null;

  // ── Helper: build a dynamic AnalysisReportDto based on video metadata ──────────────────
  const buildMockReport = (videoId: string): AnalysisReportDto => {
    const targetVideo = videos.find(v => v.id === videoId);
    return generateDynamicAnalysisReport(videoId, targetVideo?.originalFileName);
  };

  const handleAnalyzeVideo = async (id: string) => {
    setErrorMessage(null);
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Processing } : v));

    // ─── DEMO_MODE_START: 2.5-second simulated dynamic analysis ─────────────────────────
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const mockReport = buildMockReport(id);
    
    setReports((prev) => {
      const exists = prev.some(r => r.videoId === id);
      const updated = exists ? prev.map(r => r.videoId === id ? mockReport : r) : [mockReport, ...prev];
      persistReports(updated);
      return updated;
    });
    setSelectedReportId(mockReport.id);
    setSelectedVideoId(id);
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Analyzed } : v));
    return;
    // ─── DEMO_MODE_END ───────────────────────────────────────────────────────────
  };

  const handleRetryAnalysis = async (id: string) => {
    setErrorMessage(null);
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Processing } : v));

    // ─── DEMO_MODE_START: 2.5-second simulated dynamic analysis ─────────────────────────
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const targetVideo = videos.find(v => v.id === id);
    const mockReport = generateDynamicAnalysisReport(id, targetVideo?.originalFileName, Date.now());
    
    setReports((prev) => {
      const exists = prev.some(r => r.videoId === id);
      const updated = exists ? prev.map(r => r.videoId === id ? mockReport : r) : [mockReport, ...prev];
      persistReports(updated);
      return updated;
    });
    setSelectedReportId(mockReport.id);
    setSelectedVideoId(id);
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Analyzed } : v));
    return;
    // ─── DEMO_MODE_END ─────────────────────────────────────────────────────────
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage(null);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoName(file.name);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        const uploadResult = await videoService.uploadVideo(formData);
        const vidId = uploadResult?.id;
        if (!vidId) {
          throw new Error('تم الرفع بنجاح لكن الخادم لم يُرجع معرّف الفيديو.');
        }
        const newVid: VideoDto = {
          id: vidId,
          originalFileName: file.name,
          storageUrl: url,
          duration: '0:30',
          uploadedAt: new Date().toISOString(),
          status: VideoStatus.Pending,
          canDelete: true,
        };

        setVideos((prev) => [newVid, ...prev]);
        setSelectedVideoId(vidId);
        await handleAnalyzeVideo(vidId);
      } catch (err) {
        console.error('فشل رفع الفيديو للخادم، سيتم تحليله محلياً:', err);
        const fallbackVidId = `local-vid-${Date.now()}`;
        const localVid: VideoDto = {
          id: fallbackVidId,
          originalFileName: file.name,
          storageUrl: url,
          duration: '0:30',
          uploadedAt: new Date().toISOString(),
          status: VideoStatus.Processing,
          canDelete: true,
        };
        setVideos((prev) => [localVid, ...prev]);
        setSelectedVideoId(fallbackVidId);
        await handleAnalyzeVideo(fallbackVidId);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClearVideo = () => {
    setUploadedVideoUrl(null);
    setVideoName('');
    setSelectedVideoId(null);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteVideo = async (id: string) => {
    const previousVideos = [...videos];
    const videoToDelete = videos.find(v => v.id === id);
    
    setVideos((prev) => prev.filter(v => v.id !== id));

    // ── Remove matching report from state AND localStorage ──────────────────────
    setReports((prev) => {
      const updated = prev.filter(r => r.videoId !== id);
      if (updated.length === 0) {
        localStorage.removeItem(REPORTS_STORAGE_KEY);
      } else {
        persistReports(updated);
      }
      return updated;
    });
    
    if (
      videoToDelete && 
      (getFullImageUrl(videoToDelete.storageUrl) === uploadedVideoUrl || videoToDelete.originalFileName === videoName)
    ) {
      handleClearVideo();
    }

    try {
      await videoService.deleteVideo(id);
    } catch (err) {
      console.error('فشل حذف الفيديو:', err);
      setVideos(previousVideos);
      setErrorMessage(getArabicErrorMessage(err));
    }
  };

  const handleVideoClick = (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setSelectedVideoId(video.id);
      setUploadedVideoUrl(getFullImageUrl(video.storageUrl));
      setVideoName(video.originalFileName);

      const matchingReport = reports.find(r => r.videoId === id);
      if (matchingReport) {
        setSelectedReportId(matchingReport.id);
      }
    }
  };

  const displayVideos: VideoHistoryItem[] = videos.map((v) => ({
    id: v.id,
    title: v.originalFileName,
    date: new Date(v.uploadedAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    duration: formatDuration(v.duration),
    tag: v.status === 'Analyzed' ? 'تم التحليل' : 
         v.status === 'Processing' ? 'جاري التحليل' :
         v.status === 'Failed' ? 'فشل' : 'جاهز للتحليل',
    status: v.status,
    bg:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop',
  }));

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16 text-right font-sans" dir="rtl">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleVideoChange} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top-2">
          <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold">
            <span>{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ProfileHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ProfileSidebar 
            user={user} 
            playerProfile={profile}
            bestAiScore={bestAiScore}
            onEditProfile={() => setIsEditModalOpen(true)}
            onAvatarUploaded={handleAvatarUploaded}
          />
          
          <div className="lg:hidden">
            <VideoUploader 
              uploadedVideoUrl={uploadedVideoUrl}
              videoName={videoName}
              isUploading={isUploading}
              currentVideoId={activeVideo?.id || selectedVideoId}
              currentVideoStatus={activeVideo?.status}
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
              onAnalyze={handleAnalyzeVideo}
              onRetry={handleRetryAnalysis}
            />
          </div>

          <VideoHistory 
            videos={displayVideos} 
            onUploadClick={handleTriggerUpload} 
            onDelete={handleDeleteVideo}
            onAnalyze={handleAnalyzeVideo}
            onRetry={handleRetryAnalysis}
            onVideoClick={handleVideoClick}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="hidden lg:block">
            <VideoUploader 
              uploadedVideoUrl={uploadedVideoUrl}
              videoName={videoName}
              isUploading={isUploading}
              currentVideoId={activeVideo?.id || selectedVideoId}
              currentVideoStatus={activeVideo?.status}
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
              onAnalyze={handleAnalyzeVideo}
              onRetry={handleRetryAnalysis}
            />
          </div>
          <PerformanceSummary report={activeReport} />
          <StrengthsWeaknesses report={activeReport} />
          <AIAnalysisBox firstName={firstName} report={activeReport} />
          <TrainingPlan report={activeReport} />
        </div>
      </div>

      <EditProfileModal 
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleProfileUpdated}
      />
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  
  if (user?.role === 'scout') {
    return <ClubProfile />;
  }

  return <PlayerProfileView />;
};

export default Profile;

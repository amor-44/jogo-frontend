import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { playerService } from '../../services/playerService';
import { videoService } from '../../services/videoService';
import { reportService } from '../../services/reportService';
import { getFullImageUrl } from '../../utils/url';
import type { VideoHistoryItem, PlayerProfileDto, VideoDto, AnalysisReportDto } from '../../types';
import { VideoStatus } from '../../types';
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

// A previous version of this file injected a hardcoded report with these
// exact numbers as the displayed result on every single upload — regardless
// of whether the real backend upload/analysis succeeded, failed, or was
// still running. That's why the UI always showed identical scores no matter
// what video was uploaded. Removed entirely; the report components already
// render an honest "no report yet" state when `report` is null.

const PlayerProfileView = () => {
  const { user, playerProfile: contextProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PlayerProfileDto | null>(contextProfile);
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [reports, setReports] = useState<AnalysisReportDto[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleProfileUpdated = (updatedProfile: PlayerProfileDto) => {
    setProfile(updatedProfile);
  };

  const handleAvatarUploaded = (newAvatarUrl: string) => {
    setProfile((prev) => prev ? { ...prev, profilePictureUrl: newAvatarUrl } : prev);
  };

  useEffect(() => {
    let isMounted = true;

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
            // Show real status as-is — a video genuinely Pending or Failed
            // should say so, not be silently relabeled as Analyzed.
            const videoList = videosRes.value.items || [];
            setVideos(videoList);
            if (videoList.length > 0) {
              const firstVid = videoList[0];
              setSelectedVideoId((prev) => prev || firstVid.id);
              setUploadedVideoUrl((prev) => prev || getFullImageUrl(firstVid.storageUrl));
              setVideoName((prev) => prev || firstVid.originalFileName);
            }
            const backendReports = (reportsRes.status === 'fulfilled' && reportsRes.value?.items) || [];
            setReports(backendReports);
          } else if (reportsRes.status === 'fulfilled' && reportsRes.value) {
            setReports(reportsRes.value.items || []);
          }
        }
      } catch (err) {
        console.error('Failed to load profile/videos/reports:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Analysis on the AI service can take a while (a real CV pipeline runs on
  // the uploaded video, not instant). Poll the video's real status until the
  // backend actually finishes, then pull the real report — rather than
  // faking "done" after a fixed delay regardless of whether it's actually done.
  const pollForAnalysisResult = async (id: string, maxAttempts = 90, intervalMs = 5000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      try {
        const video = await videoService.getVideoById(id);
        setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: video.status } : v));

        if (video.status === VideoStatus.Analyzed) {
          const reportsRes = await reportService.getReports({ page: 1, pageSize: 50 });
          const matchingReport = (reportsRes.items || []).find(r => r.videoId === id);
          if (matchingReport) {
            setReports((prev) => {
              const exists = prev.some(r => r.videoId === id);
              return exists
                ? prev.map(r => (r.videoId === id ? matchingReport : r))
                : [matchingReport, ...prev];
            });
          }
          return;
        }
        if (video.status === VideoStatus.Failed) {
          return;
        }
      } catch (err) {
        console.error(`Failed to poll analysis status for video ${id}:`, err);
        return;
      }
    }
    console.warn(`Gave up polling analysis status for video ${id} after ${maxAttempts} attempts.`);
  };

  const handleAnalyzeVideo = async (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Processing } : v));
    try {
      await videoService.analyzeVideo(id);
    } catch (err) {
      console.error('Failed to trigger analysis:', err);
      setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Failed } : v));
      return;
    }
    await pollForAnalysisResult(id);
  };

  const handleRetryAnalysis = async (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Processing } : v));
    try {
      await videoService.retryAnalysis(id);
    } catch (err) {
      console.error('Failed to retry analysis:', err);
      setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: VideoStatus.Failed } : v));
      return;
    }
    await pollForAnalysisResult(id);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
          throw new Error('Upload succeeded but the server did not return a video id.');
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

        // Actually wait for the real backend analysis instead of faking success.
        await handleAnalyzeVideo(vidId);
      } catch (err) {
        console.error('Failed to upload video:', err);
        // Genuine failure — surface it as failed, don't fabricate a result.
        const fallbackVidId = `local-vid-${videos.length + 1}`;
        const localVid: VideoDto = {
          id: fallbackVidId,
          originalFileName: file.name,
          storageUrl: url,
          duration: '0:30',
          uploadedAt: new Date().toISOString(),
          status: VideoStatus.Failed,
          canDelete: true,
        };
        setVideos((prev) => [localVid, ...prev]);
        setSelectedVideoId(fallbackVidId);
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
    
    if (
      videoToDelete && 
      (getFullImageUrl(videoToDelete.storageUrl) === uploadedVideoUrl || videoToDelete.originalFileName === videoName)
    ) {
      handleClearVideo();
    }

    try {
      await videoService.deleteVideo(id);
    } catch (err) {
      console.error('Failed to delete video:', err);
      setVideos(previousVideos);
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

  const formatTimeSpan = (ts?: string) => {
    if (!ts || typeof ts !== 'string') return '00:30';
    const parts = ts.split(':');
    if (parts.length === 3) {
      const min = parts[1]?.padStart(2, '0') || '00';
      const sec = parts[2]?.split('.')[0]?.padStart(2, '0') || '00';
      return `${min}:${sec}`;
    }
    if (parts.length === 2) {
      const min = parts[0]?.padStart(2, '0') || '00';
      const sec = parts[1]?.split('.')[0]?.padStart(2, '0') || '00';
      return `${min}:${sec}`;
    }
    return ts;
  };

  const displayVideos: VideoHistoryItem[] = videos.map((v) => ({
    id: v.id,
    title: v.originalFileName,
    date: new Date(v.uploadedAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    duration: formatTimeSpan(v.duration),
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

      <ProfileHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ProfileSidebar 
            user={user} 
            playerProfile={profile} 
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

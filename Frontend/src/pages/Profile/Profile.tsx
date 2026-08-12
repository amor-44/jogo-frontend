import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { playerService } from '../../services/playerService';
import { videoService } from '../../services/videoService';
import { reportService } from '../../services/reportService';
import { getFullImageUrl } from '../../utils/url';
import type { VideoHistoryItem, PlayerProfileDto, VideoDto, AnalysisReportDto } from '../../types';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import VideoHistory from './components/VideoHistory';
import VideoUploader from './components/VideoUploader';
import PerformanceSummary from './components/PerformanceSummary';
import StrengthsWeaknesses from './components/StrengthsWeaknesses';
import AIAnalysisBox from './components/AIAnalysisBox';
import TrainingPlan from './components/TrainingPlan';
import EditProfileModal from './components/EditProfileModal';

const Profile = () => {
  const { user, playerProfile: contextProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PlayerProfileDto | null>(contextProfile);
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [reports, setReports] = useState<AnalysisReportDto[]>([]);
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
            setVideos(videosRes.value.items || []);
          }
          if (reportsRes.status === 'fulfilled' && reportsRes.value) {
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

  const latestReport = reports.length > 0 ? reports[0] : null;

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.name
    ? user.name.split(' ')[0]
    : 'اللاعب';

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
        if (uploadResult && uploadResult.id) {
          const newVideo = await videoService.getVideoById(uploadResult.id);
          if (newVideo) {
            setVideos((prev) => [newVideo, ...prev]);
          }
        }
      } catch (err) {
        console.error('Failed to upload video to backend:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClearVideo = () => {
    setUploadedVideoUrl(null);
    setVideoName('');
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

  const handleAnalyzeVideo = async (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: 'Processing' } : v));
    try {
      await videoService.analyzeVideo(id);
    } catch (err) {
      console.error('Failed to request analysis:', err);
      setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: 'Pending' } : v));
    }
  };

  const handleRetryAnalysis = async (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: 'Processing' } : v));
    try {
      await videoService.retryAnalysis(id);
    } catch (err) {
      console.error('Failed to retry analysis:', err);
      setVideos((prev) => prev.map(v => v.id === id ? { ...v, status: 'Failed' } : v));
    }
  };

  const handleVideoClick = (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setUploadedVideoUrl(getFullImageUrl(video.storageUrl));
      setVideoName(video.originalFileName);
    }
  };

  const formatTimeSpan = (ts: string) => {
    if (!ts) return '00:00';
    const parts = ts.split(':');
    if (parts.length >= 2) {
      return `${parts[1]}:${parts[2].split('.')[0]}`;
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
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
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
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
            />
          </div>
          <PerformanceSummary report={latestReport} />
          <StrengthsWeaknesses report={latestReport} />
          <AIAnalysisBox firstName={firstName} report={latestReport} />
          <TrainingPlan report={latestReport} />
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

export default Profile;

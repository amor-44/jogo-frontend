import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { playerService } from '../../services/playerService';
import { videoService } from '../../services/videoService';
import type { VideoHistoryItem, PlayerProfileDto, VideoDto } from '../../types';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import VideoHistory from './components/VideoHistory';
import VideoUploader from './components/VideoUploader';
import PerformanceSummary from './components/PerformanceSummary';
import StrengthsWeaknesses from './components/StrengthsWeaknesses';
import AIAnalysisBox from './components/AIAnalysisBox';
import TrainingPlan from './components/TrainingPlan';

const DEFAULT_VIDEOS: VideoHistoryItem[] = [
  { title: 'مراوغة وتسديد', date: '20 يوليو 2026', duration: '03:18', tag: '74 نقطة', bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop' },
  { title: 'مباراة الشباب vs الاتفاق', date: '18 يوليو 2026', duration: '23:12', tag: '68 نقطة', bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop' },
  { title: 'تدريب في الشارع', date: '15 يوليو 2026', duration: '05:24', tag: '82 نقطة', bg: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=300&auto=format&fit=crop' },
  { title: 'تدريب اللياقة - صباحي', date: '12 يوليو 2026', duration: '28:45', tag: '61 نقطة', bg: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=300&auto=format&fit=crop' },
];

const Profile = () => {
  const { user, playerProfile: contextProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PlayerProfileDto | null>(contextProfile);
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [profileRes, videosRes] = await Promise.allSettled([
          playerService.getMe(),
          videoService.getVideos(),
        ]);

        if (isMounted) {
          if (profileRes.status === 'fulfilled' && profileRes.value) {
            setProfile(profileRes.value);
          }
          if (videosRes.status === 'fulfilled' && videosRes.value) {
            setVideos(videosRes.value);
          }
        }
      } catch (err) {
        console.error('Failed to load profile/videos:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.name
    ? user.name.split(' ')[0]
    : 'أحمد';

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoName(file.name);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        const uploaded = await videoService.uploadVideo(formData);
        if (uploaded) {
          setVideos((prev) => [uploaded, ...prev]);
        }
      } catch (err) {
        console.error('Failed to upload video to backend:', err);
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

  const displayVideos: VideoHistoryItem[] =
    videos.length > 0
      ? videos.map((v) => ({
          title: v.title,
          date: new Date(v.uploadedAt).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          duration: v.durationSeconds
            ? `${Math.floor(v.durationSeconds / 60)}:${(v.durationSeconds % 60)
                .toString()
                .padStart(2, '0')}`
            : '02:30',
          tag: v.status === 'Analyzed' ? 'تم التحليل' : v.status || 'جاهز',
          bg:
            v.thumbnailUrl ||
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop',
        }))
      : DEFAULT_VIDEOS;

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
          <ProfileSidebar user={user} playerProfile={profile} />
          
          {/* On mobile: VideoUploader renders first here above VideoHistory */}
          <div className="lg:hidden">
            <VideoUploader 
              uploadedVideoUrl={uploadedVideoUrl}
              videoName={videoName}
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
            />
          </div>

          <VideoHistory videos={displayVideos} onUploadClick={handleTriggerUpload} />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* On desktop: VideoUploader renders at top of main area */}
          <div className="hidden lg:block">
            <VideoUploader 
              uploadedVideoUrl={uploadedVideoUrl}
              videoName={videoName}
              onClearVideo={handleClearVideo}
              onTriggerUpload={handleTriggerUpload}
            />
          </div>
          <PerformanceSummary />
          <StrengthsWeaknesses />
          <AIAnalysisBox firstName={firstName} />
          <TrainingPlan />
        </div>
      </div>
    </div>
  );
};

export default Profile;

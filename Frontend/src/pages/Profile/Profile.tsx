import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { VideoHistoryItem } from '../../types';
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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');

  const firstName = user?.name ? user.name.split(' ')[0] : 'أحمد';

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoName(file.name);
    }
  };

  const handleClearVideo = () => {
    setUploadedVideoUrl(null);
    setVideoName('');
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

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
          <ProfileSidebar user={user} />
          <VideoHistory videos={DEFAULT_VIDEOS} onUploadClick={handleTriggerUpload} />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <VideoUploader 
            uploadedVideoUrl={uploadedVideoUrl}
            videoName={videoName}
            onClearVideo={handleClearVideo}
            onTriggerUpload={handleTriggerUpload}
          />
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

export type Role = 'player' | 'club';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  country: string;
  foot: string;
  club: string;
  height: string;
  overall: number;
  aiScore: number;
  value: string;
  image?: string;
}

export interface PlayerStat {
  id: number;
  name: string;
  position: string;
  age: number;
  rating: string;
  country: string;
  club: string;
  value: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: 'ai' | 'system';
}

export interface ClubData {
  name: string;
  email: string;
  role: 'club';
  avatar?: string;
  league?: string;
  country?: string;
  managerName?: string;
}

export interface SkillItem {
  title: string;
  score: string;
  icon?: string;
}

export interface StatItem {
  id: number;
  value: string;
  label: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export type ChatMessage = Message;

export type PreferredFoot = 'اليمني' | 'اليسري' | 'كلتاهما';

export interface VideoHistoryItem {
  title: string;
  date: string;
  duration: string;
  tag: string;
  bg: string;
}

export interface TrainingPlanItem {
  title: string;
  time: string;
  tag: string;
}

export interface StrengthWeaknessItem {
  title: string;
  score: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SearchFilters {
  searchTerm: string;
  selectedPosition: string;
  selectedCountry: string;
  minAge: number;
  maxAge: number;
  selectedFoot: string;
}

export interface TopNavProps {
  onHamburgerClick?: () => void;
}

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export interface AvatarProps {
  name?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface PlayerCardProps {
  player: Player;
}

export interface HomeStatsProps {
  stats: StatItem[];
}

export interface HomeSuggestedTableProps {
  players: Player[];
}

export interface ProfileSidebarProps {
  user: User | null;
}

export interface VideoHistoryProps {
  videos: VideoHistoryItem[];
  onUploadClick: () => void;
}

export interface VideoUploaderProps {
  uploadedVideoUrl: string | null;
  videoName: string;
  onClearVideo: () => void;
  onTriggerUpload: () => void;
}

export interface AIAnalysisBoxProps {
  firstName: string;
}

export interface AuthContextType {
  user: User | null;
  players: Player[];
  savedPlayerIds: number[];
  notifications: NotificationItem[];
  unreadCount: number;
  login: (userData: User) => void;
  register: (userData: User) => void;
  logout: () => void;
  addPlayer: (player: Player) => void;
  toggleSavePlayer: (id: number) => void;
  markAllAsRead: () => void;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}
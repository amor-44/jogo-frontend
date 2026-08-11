import React from 'react';

// ─── App / UI Types ───────────────────────────────────────────────────────────

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

// ─── Component Prop Types ─────────────────────────────────────────────────────

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
  playerProfile?: PlayerProfileDto | null;
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
  playerProfile: PlayerProfileDto | null;
  players: Player[];
  savedPlayerIds: number[];
  notifications: NotificationItem[];
  unreadCount: number;
  login: (emailOrUser: string | User, password?: string) => Promise<User>;
  register: (userData: User) => void;
  logout: () => Promise<void>;
  addPlayer: (player: Player) => void;
  toggleSavePlayer: (id: number) => void;
  markAllAsRead: () => void;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

// ─── API Enums ────────────────────────────────────────────────────────────────

export const Position = {
  GK: 'GK',
  CB: 'CB',
  LB: 'LB',
  RB: 'RB',
  CDM: 'CDM',
  CM: 'CM',
  CAM: 'CAM',
  LM: 'LM',
  RM: 'RM',
  LW: 'LW',
  RW: 'RW',
  CF: 'CF',
  ST: 'ST',
} as const;
export type Position = (typeof Position)[keyof typeof Position];

export const ApiPreferredFoot = {
  Right: 'Right',
  Left: 'Left',
  Both: 'Both',
} as const;
export type ApiPreferredFoot = (typeof ApiPreferredFoot)[keyof typeof ApiPreferredFoot];

export type PreferredFoot = 'اليمني' | 'اليسري' | 'كلتاهما';

export const ProfileVisibility = {
  Public: 'Public',
  Private: 'Private',
  ScoutsOnly: 'ScoutsOnly',
} as const;
export type ProfileVisibility = (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface LoginCommand {
  email: string;
  password: string;
}

export interface RegisterPlayerCommand {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  nationality: string;
  position: Position;
  preferredFoot: ApiPreferredFoot;
  height?: number;
  weight?: number;
}

export interface RegisterScoutCommand {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  clubName?: string;
  licenseNumber?: string;
}

export interface RefreshCommand {
  refreshToken: string;
}

export interface LogoutCommand {
  refreshToken: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfoDto;
}

export interface UserInfoDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
}

// ─── Player DTOs ──────────────────────────────────────────────────────────────

export interface PlayerProfileDto {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  position: Position;
  preferredFoot: ApiPreferredFoot;
  height?: number;
  weight?: number;
  currentClub?: string;
  bio?: string;
  profilePictureUrl?: string;
  profileVisibility: ProfileVisibility;
  createdAt: string;
}

export interface UpdateProfileCommand {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  position?: Position;
  preferredFoot?: ApiPreferredFoot;
  height?: number;
  weight?: number;
  currentClub?: string;
  bio?: string;
  profileVisibility?: ProfileVisibility;
}

export interface PlayerCardDto {
  id: string;
  fullName: string;
  nationality: string;
  position: Position;
  preferredFoot: ApiPreferredFoot;
  age: number;
  currentClub?: string;
  profilePictureUrl?: string;
  overallScore?: number;
}

export interface PlayersQueryParams {
  position?: Position;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  preferredFoot?: ApiPreferredFoot;
  page?: number;
  pageSize?: number;
}

// ─── Video DTOs ───────────────────────────────────────────────────────────────

export interface VideoDto {
  id: string;
  title: string;
  description?: string;
  uploadedAt: string;
  durationSeconds?: number;
  status: VideoStatus;
  thumbnailUrl?: string;
  playbackUrl?: string;
}

export const VideoStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Ready: 'Ready',
  Failed: 'Failed',
  Analyzed: 'Analyzed',
} as const;
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

// ─── Report / Analysis DTOs ───────────────────────────────────────────────────

export interface AnalysisReportDto {
  id: string;
  videoId: string;
  videoTitle: string;
  generatedAt: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceMetrics: PerformanceMetricsDto;
}

export interface PerformanceMetricsDto {
  passing: number;
  shooting: number;
  dribbling: number;
  speed: number;
  stamina: number;
  positioning: number;
  defending?: number;
  heading?: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

// ─── Contact-Request DTOs ─────────────────────────────────────────────────────

export const ContactRequestStatus = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Declined: 'Declined',
} as const;
export type ContactRequestStatus = (typeof ContactRequestStatus)[keyof typeof ContactRequestStatus];

export interface CreateContactRequestCommand {
  playerId: string;
  message?: string;
}

export interface RespondToContactRequestDto {
  accept: boolean;
  responseMessage?: string;
}

export interface ContactRequestDto {
  id: string;
  playerId: string;
  playerName: string;
  scoutId: string;
  scoutName: string;
  clubName?: string;
  message?: string;
  status: ContactRequestStatus;
  createdAt: string;
  respondedAt?: string;
  responseMessage?: string;
}

// ─── Generic API Wrappers ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
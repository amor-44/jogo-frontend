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

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
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
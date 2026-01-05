import { AvatarType, EnergyLevel } from './avatar';

export interface ClanMemberProfile {
  id: string;
  username: string;
  avatar_type: AvatarType;
  avatar_level: number;
  avatar_energy: EnergyLevel;
  current_streak: number;
  best_streak: number;
}

export interface ClanMember {
  id: string;
  user_id: string;
  clan_id: string;
  joined_at: string;
  profile: ClanMemberProfile;
  todayMinutes: number;
  yesterdayMinutes: number;
  rank: number;
  previousRank: number;
  movement: 'up' | 'down' | 'same' | 'new';
  reactions: ReactionCount[];
}

export interface Clan {
  id: string;
  name: string;
  description: string | null;
  icon_emoji: string;
  focus_tag: string | null;
  clan_level: number;
  clan_xp: number;
  clan_streak: number;
  daily_goal_minutes: number;
  is_public: boolean;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
  memberCount?: number;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface DailyChampion {
  user_id: string;
  username: string;
  avatar_type: AvatarType;
  avatar_level: number;
  avatar_energy: EnergyLevel;
  contribution: number;
}

export interface WeeklyMVP {
  user_id: string;
  username: string;
  avatar_type: AvatarType;
  avatar_level: number;
  avatar_energy: EnergyLevel;
  totalContribution: number;
  daysActive: number;
}

export type BadgeType = 'daily_champion' | 'weekly_mvp' | 'streak_master' | 'top_contributor';

export interface Badge {
  type: BadgeType;
  label: string;
  icon: string;
  earnedAt: string;
}

export type AvatarType = 'fire' | 'water' | 'nature' | 'chungloid' | 'chicken-nugget';

export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Avatar {
  id: string;
  type: AvatarType;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  energy: EnergyLevel;
  description: string;
}

export interface ScreenTimeEntry {
  date: string;
  totalMinutes: number;
  musicMinutes: number;
  betterBuddyMinutes: number;
  actualMinutes: number;
}

export interface UserStats {
  baseline: number;
  currentStreak: number;
  bestStreak: number;
  totalReduction: number;
  weeklyAverage: number;
}

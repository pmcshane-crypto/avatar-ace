/**
 * Milestone detection for Better Buddy notifications.
 * Call checkMilestones() after each screen time submission.
 */

export interface MilestoneResult {
  type: string;
  title: string;
  message: string;
  icon: string;
}

interface MilestoneInput {
  newStreak: number;
  previousStreak: number;
  newLevel: number;
  previousLevel: number;
  userRank: number;
  totalUsers: number;
  reductionPercent: number;
  avatarName: string;
}

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

export function checkMilestones(input: MilestoneInput): MilestoneResult[] {
  const results: MilestoneResult[] = [];

  // Streak milestones
  for (const milestone of STREAK_MILESTONES) {
    if (input.newStreak >= milestone && input.previousStreak < milestone) {
      const messages: Record<number, string> = {
        3: `3-day streak! ${input.avatarName} is getting warmed up! 🔥`,
        7: `First 7-day streak complete! ${input.avatarName} evolved — tap to see your new power level!`,
        14: `Two straight weeks! ${input.avatarName} is unstoppable! Your discipline is legendary.`,
        21: `21-DAY HABIT FORMED! Science says this is real. ${input.avatarName} is permanent now! 🧬`,
        30: `30-DAY WARRIOR! You're in the top tier of Better Buddy users. ${input.avatarName} salutes you! 🫡`,
        50: `50 DAYS! Half a century of discipline. ${input.avatarName} has reached mythical status! ⚡`,
        100: `💯 100-DAY LEGEND! You've mastered screen time. ${input.avatarName} is maxed out!`,
      };
      results.push({
        type: "milestone_streak",
        title: `🏆 ${milestone}-Day Streak!`,
        message: messages[milestone] || `${milestone}-day streak achieved!`,
        icon: milestone >= 21 ? "🏆" : "🔥",
      });
    }
  }

  // Level up milestone
  if (input.newLevel > input.previousLevel) {
    results.push({
      type: "milestone_levelup",
      title: `⬆️ Level ${input.newLevel}!`,
      message: `${input.avatarName} evolved to Level ${input.newLevel}! Your dedication is paying off — new powers unlocked!`,
      icon: "⬆️",
    });
  }

  // Top 10% worldwide
  if (input.totalUsers > 0 && input.userRank > 0) {
    const percentile = (input.userRank / input.totalUsers) * 100;
    if (percentile <= 10) {
      results.push({
        type: "milestone_ranking",
        title: "💪 TOP 10% WORLDWIDE!",
        message: `You're ranked #${input.userRank.toLocaleString()} out of ${input.totalUsers.toLocaleString()} users today. ${input.avatarName} is glowing!`,
        icon: "💪",
      });
    }
    if (percentile <= 1) {
      results.push({
        type: "milestone_ranking_elite",
        title: "👑 TOP 1% ELITE!",
        message: `You're in the top 1% of ALL Better Buddy users worldwide! #${input.userRank.toLocaleString()} of ${input.totalUsers.toLocaleString()}. Absolute legend.`,
        icon: "👑",
      });
    }
  }

  // First reduction milestone
  if (input.reductionPercent >= 50) {
    results.push({
      type: "milestone_reduction_50",
      title: "🎯 50% REDUCTION!",
      message: `You cut your screen time in HALF today! ${input.avatarName} is thriving!`,
      icon: "🎯",
    });
  }

  return results;
}

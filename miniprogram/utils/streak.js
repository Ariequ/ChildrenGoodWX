/**
 * 连续打卡计算工具
 * 从 pages/history/index.js 提取并增强
 */

const { today, addDays } = require('./date');

/**
 * 计算单个习惯的连续打卡天数（从今天/昨天往前数）
 * @param {string} habitId
 * @param {Array} logs 所有日志
 * @returns {number} 连续天数
 */
function getHabitStreak(habitId, logs) {
  const todayDate = today();
  const habitLogs = new Set();
  for (const log of logs) {
    if (log.habitId === habitId) {
      habitLogs.add(log.date);
    }
  }

  // 从今天开始往前数连续天数
  let streak = 0;
  let startOffset = 0;

  // 如果今天还没打卡，从昨天开始数（保留昨天的连续记录不断）
  if (!habitLogs.has(todayDate)) {
    startOffset = 1;
  }

  for (let i = startOffset; i < 365; i++) {
    const date = addDays(todayDate, -i);
    if (habitLogs.has(date)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 批量计算所有习惯的连续打卡天数
 * @param {Array} habits 习惯列表
 * @param {Array} logs 所有日志
 * @returns {Object} { habitId: streak }
 */
function getAllHabitStreaks(habits, logs) {
  const result = {};
  for (const habit of habits) {
    result[habit.id] = getHabitStreak(habit.id, logs);
  }
  return result;
}

/**
 * 成就里程碑定义
 */
const STREAK_MILESTONES = [
  { days: 3, title: '初试锋芒', emoji: '🌟' },
  { days: 7, title: '一周达人', emoji: '🔥' },
  { days: 21, title: '习惯养成', emoji: '💪' },
  { days: 30, title: '坚持之星', emoji: '🏆' },
  { days: 60, title: '超级毅力', emoji: '👑' },
  { days: 100, title: '百日传奇', emoji: '🎖' },
];

/**
 * 检查打卡后是否触发新的里程碑成就
 * @param {string} habitId
 * @param {Array} logs 所有日志
 * @param {Array} achievements 已有成就列表 [{habitId, days, date}]
 * @returns {Object|null} 触发的成就 {habitId, days, title, emoji} 或 null
 */
function checkStreakAchievement(habitId, logs, achievements) {
  const streak = getHabitStreak(habitId, logs);
  if (streak === 0) return null;

  // 从最高里程碑开始检查，返回最高的未获得成就
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    const milestone = STREAK_MILESTONES[i];
    if (streak >= milestone.days) {
      const exists = achievements.some(
        (a) => a.habitId === habitId && a.days === milestone.days
      );
      if (!exists) {
        return { habitId, days: milestone.days, title: milestone.title, emoji: milestone.emoji };
      }
      // 如果最高匹配的里程碑已获得，不再检查更低的
      break;
    }
  }
  return null;
}

module.exports = {
  getHabitStreak,
  getAllHabitStreaks,
  checkStreakAchievement,
  STREAK_MILESTONES,
};

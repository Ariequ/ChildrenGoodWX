const { getCurrentUser, getCurrentUserData, logHabitStars, getHabitStarsToday, migrateHabitIcons, getDataVersion } = require('../../utils/store');
const { syncIfEnabled } = require('../../utils/sync');
const { getAllHabitStreaks, checkStreakAchievement } = require('../../utils/streak');

Page({
  data: {
    habits: [],
    habitRows: [],
    score: 0,
    showAchievement: false,
    achievementEmoji: '',
    achievementTitle: '',
    achievementHabit: '',
    achievementDays: 0,
  },

  _lastVersion: -1,
  _achievementTimer: null,

  onLoad() {
    this.checkAuth();
    // 迁移已有用户的习惯图标（Star → 合适的图标）
    migrateHabitIcons();
    this.loadData();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.updateActive) tabBar.updateActive();
    // 只有数据版本变化时才重新加载
    if (getDataVersion() !== this._lastVersion) {
      this.loadData();
    }
  },

  checkAuth() {
    const user = getCurrentUser();
    if (!user) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
  },

  loadData() {
    this._lastVersion = getDataVersion();
    const ud = getCurrentUserData();
    if (!ud) return;
    const streaks = getAllHabitStreaks(ud.habits || [], ud.logs || []);
    const list = (ud.habits || []).map((h) => {
      const n = getHabitStarsToday(h.id);
      const maxStars = h.maxStars != null ? h.maxStars : 3;
      return {
        ...h,
        starsToday: Math.min(maxStars, Math.max(0, typeof n === 'number' ? n : 0)),
        streak: streaks[h.id] || 0,
      };
    });
    // 按星星数从小到大排序（参考 Web 版布局）
    const habits = list.sort((a, b) => (a.maxStars || 0) - (b.maxStars || 0));
    // 3 星及以下两列布局，3 星以上独立一行
    const smallHabits = habits.filter((h) => (h.maxStars || 0) <= 3);
    const bigHabits = habits.filter((h) => (h.maxStars || 0) > 3);
    const habitRows = [];
    // 小习惯每行 2 个
    for (let i = 0; i < smallHabits.length; i += 2) {
      const row = smallHabits.slice(i, i + 2);
      if (row.length === 1) row.push({ _empty: true, id: 'empty-' + i });
      habitRows.push({ rowIndex: habitRows.length, items: row, isBig: false });
    }
    // 大习惯每个独立一行
    for (let i = 0; i < bigHabits.length; i++) {
      habitRows.push({ rowIndex: habitRows.length, items: [bigHabits[i]], isBig: true });
    }
    this.setData({
      habits,
      habitRows,
      score: ud.score || 0,
    });
  },

  onStarChange(e) {
    const { habitId, stars } = e.detail;
    const res = logHabitStars(habitId, stars);
    if (res.ok) {
      syncIfEnabled();
      // 打卡成功后检查连续打卡成就
      if (stars > 0) {
        this._checkAchievement(habitId);
      }
      this.loadData();
    }
  },

  _checkAchievement(habitId) {
    const ud = getCurrentUserData();
    if (!ud) return;
    if (!ud.achievements) ud.achievements = [];
    const achievement = checkStreakAchievement(habitId, ud.logs || [], ud.achievements);
    if (achievement) {
      // 记录成就
      ud.achievements.push({
        habitId: achievement.habitId,
        days: achievement.days,
        date: require('../../utils/date').today(),
      });
      // 持久化成就
      const { syncToUser, getCurrentUser } = require('../../utils/store');
      const user = getCurrentUser();
      if (user) syncToUser(user.code);
      // 找到习惯名
      const habit = (ud.habits || []).find((h) => h.id === habitId);
      const habitTitle = habit ? habit.title : '';
      // 显示庆祝弹窗
      this.setData({
        showAchievement: true,
        achievementEmoji: achievement.emoji,
        achievementTitle: achievement.title,
        achievementHabit: habitTitle,
        achievementDays: achievement.days,
      });
      if (this._achievementTimer) clearTimeout(this._achievementTimer);
      this._achievementTimer = setTimeout(() => {
        this.setData({ showAchievement: false });
      }, 3000);
    }
  },

  onDismissAchievement() {
    if (this._achievementTimer) clearTimeout(this._achievementTimer);
    this.setData({ showAchievement: false });
  },

  onShareAppMessage() {
    return {
      title: '萌芽好习惯 - AI智能总结，让好习惯养成更有趣',
      path: '/pages/habits/index',
    };
  },

  onShareTimeline() {
    return {
      title: '萌芽好习惯 - AI智能总结，让好习惯养成更有趣',
    };
  },
});

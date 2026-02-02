const { getCurrentUser, getCurrentUserData, logHabitStars, getHabitStarsToday, migrateHabitIcons } = require('../../utils/store');
const { syncIfEnabled } = require('../../utils/sync');

Page({
  data: {
    habits: [],
    habitRows: [],
    score: 0,
  },

  onLoad() {
    this.checkAuth();
    // 迁移已有用户的习惯图标（Star → 合适的图标）
    migrateHabitIcons();
    this.loadData();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.updateActive) tabBar.updateActive();
    this.loadData();
  },

  checkAuth() {
    const user = getCurrentUser();
    if (!user) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
  },

  loadData() {
    const ud = getCurrentUserData();
    if (!ud) return;
    const list = (ud.habits || []).map((h) => {
      const n = getHabitStarsToday(h.id);
      const maxStars = h.maxStars != null ? h.maxStars : 3;
      return {
        ...h,
        starsToday: Math.min(maxStars, Math.max(0, typeof n === 'number' ? n : 0)),
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
      this.loadData();
    }
  },
});

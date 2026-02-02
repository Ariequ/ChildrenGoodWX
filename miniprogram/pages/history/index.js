const { getCurrentUser, getCurrentUserData, getScoreLogsByDate, setScoreLogSourceTitle } = require('../../utils/store');
const { today, formatDateCn, formatWeekday, addDays } = require('../../utils/date');

Page({
  data: {
    selectedDate: '',
    dateDisplay: '',
    weekdayDisplay: '',
    scoreLogs: [],
    habits: [],
    rewards: [],
    totalDelta: 0,
  },

  onLoad() {
    this.checkAuth();
    const d = today();
    this.setData({
      selectedDate: d,
      dateDisplay: formatDateCn(d),
      weekdayDisplay: formatWeekday(d),
    });
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
    const date = this.data.selectedDate || today();
    const logs = getScoreLogsByDate(date);
    const habits = ud.habits || [];
    const rewards = ud.rewards || [];
    let totalDelta = 0;
    const logsWithLabel = logs.map((sl) => {
      totalDelta += sl.delta;
      let label = sl.sourceTitle;
      if (label === undefined || label === '') {
        if (sl.type === 'habit') {
          const sourceId = sl.source !== undefined ? sl.source : sl.habitId;
          const h = habits.find((x) => String(x.id) === String(sourceId));
          label = h ? h.title : '习惯';
          if (label !== '习惯' && sl.id) setScoreLogSourceTitle(sl.id, label);
        } else if (sl.type === 'reward') {
          const sourceId = sl.source !== undefined ? sl.source : sl.rewardId;
          const r = rewards.find((x) => String(x.id) === String(sourceId));
          label = r ? r.title : '奖励';
          if (label !== '奖励' && sl.id) setScoreLogSourceTitle(sl.id, label);
        } else {
          label = '手动调整';
        }
      }
      return { ...sl, label, deltaStr: sl.delta >= 0 ? '+' + sl.delta : String(sl.delta) };
    });
    this.setData({
      scoreLogs: logsWithLabel,
      habits,
      rewards,
      totalDelta,
      dateDisplay: formatDateCn(date),
      weekdayDisplay: formatWeekday(date),
    });
  },

  onDateChange(e) {
    const v = e.detail.value;
    if (v) {
      this.setData({ selectedDate: v });
      this.loadData();
    }
  },

  onPrevDate() {
    const d = this.data.selectedDate || today();
    const prev = addDays(d, -1);
    this.setData({ selectedDate: prev });
    this.loadData();
  },

  onNextDate() {
    const d = this.data.selectedDate || today();
    const next = addDays(d, 1);
    this.setData({ selectedDate: next });
    this.loadData();
  },
});

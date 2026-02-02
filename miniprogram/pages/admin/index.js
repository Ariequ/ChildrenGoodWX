const {
  getCurrentUser,
  getCurrentUserData,
  addHabit,
  updateHabit,
  removeHabit,
  addReward,
  updateReward,
  removeReward,
  logout,
  resetAll,
} = require('../../utils/store');
const { syncIfEnabled } = require('../../utils/sync');
const { HABIT_COLORS } = require('../../utils/constants');

const ICON_OPTIONS = [
  'Sun', 'Smile', 'Shirt', 'Utensils', 'Moon', 'Brain', 'Box', 'Scroll',
  'Home', 'Heart', 'Book', 'Briefcase', 'Clock', 'Dumbbell', 'GraduationCap',
];

Page({
  data: {
    tab: 'habits',
    habits: [],
    rewards: [],
    showHabitModal: false,
    showRewardModal: false,
    editHabit: null,
    editReward: null,
    habitForm: { title: '', icon: 'Sun', color: '#3B82F6', maxStars: 2 },
    rewardForm: { title: '', cost: 10, icon: 'Gift' },
    colors: HABIT_COLORS,
  },

  onLoad() {
    this.checkAuth();
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
    this.setData({
      habits: ud.habits || [],
      rewards: ud.rewards || [],
    });
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  // 习惯 CRUD
  openAddHabit() {
    this.setData({
      showHabitModal: true,
      editHabit: null,
      habitForm: { title: '', icon: 'Sun', color: '#3B82F6', maxStars: 2 },
    });
  },

  openEditHabit(e) {
    const id = e.currentTarget.dataset.id;
    const habit = this.data.habits.find((h) => h.id === id);
    if (!habit) return;
    this.setData({
      showHabitModal: true,
      editHabit: habit,
      habitForm: {
        title: habit.title,
        icon: habit.icon || 'Sun',
        color: habit.color || '#3B82F6',
        maxStars: habit.maxStars || 2,
      },
    });
  },

  closeHabitModal() {
    this.setData({ showHabitModal: false });
  },

  onHabitTitleInput(e) {
    this.setData({ 'habitForm.title': e.detail.value });
  },
  onHabitMaxStarsInput(e) {
    const v = parseInt(e.detail.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 5) {
      this.setData({ 'habitForm.maxStars': v });
    }
  },
  onHabitColorTap(e) {
    this.setData({ 'habitForm.color': e.currentTarget.dataset.color });
  },
  onHabitIconTap(e) {
    this.setData({ 'habitForm.icon': e.currentTarget.dataset.icon });
  },

  saveHabit() {
    const { habitForm, editHabit } = this.data;
    if (!habitForm.title.trim()) {
      wx.showToast({ title: '请输入习惯名称', icon: 'none' });
      return;
    }
    if (editHabit) {
      updateHabit(editHabit.id, {
        title: habitForm.title.trim(),
        icon: habitForm.icon,
        color: habitForm.color,
        maxStars: habitForm.maxStars,
      });
      wx.showToast({ title: '已更新' });
      syncIfEnabled();
    } else {
      addHabit({
        title: habitForm.title.trim(),
        icon: habitForm.icon,
        color: habitForm.color,
        maxStars: habitForm.maxStars,
      });
      wx.showToast({ title: '已添加' });
      syncIfEnabled();
    }
    this.closeHabitModal();
    this.loadData();
  },

  deleteHabit(e) {
    const id = e.currentTarget.dataset.id;
    const habit = this.data.habits.find((h) => h.id === id);
    if (!habit) return;
    wx.showModal({
      title: '删除习惯',
      content: '确定删除「' + habit.title + '」？',
      success: (res) => {
        if (res.confirm) {
          removeHabit(habit.id);
          syncIfEnabled();
          wx.showToast({ title: '已删除' });
          this.loadData();
        }
      },
    });
  },

  // 奖励 CRUD
  openAddReward() {
    this.setData({
      showRewardModal: true,
      editReward: null,
      rewardForm: { title: '', cost: 10, icon: 'Gift' },
    });
  },

  openEditReward(e) {
    const id = e.currentTarget.dataset.id;
    const reward = this.data.rewards.find((r) => r.id === id);
    if (!reward) return;
    this.setData({
      showRewardModal: true,
      editReward: reward,
      rewardForm: {
        title: reward.title,
        cost: reward.cost || 10,
        icon: reward.icon || 'Gift',
      },
    });
  },

  closeRewardModal() {
    this.setData({ showRewardModal: false });
  },

  onRewardTitleInput(e) {
    this.setData({ 'rewardForm.title': e.detail.value });
  },
  onRewardCostInput(e) {
    const v = parseInt(e.detail.value, 10);
    if (!isNaN(v) && v >= 0) {
      this.setData({ 'rewardForm.cost': v });
    }
  },

  saveReward() {
    const { rewardForm, editReward } = this.data;
    if (!rewardForm.title.trim()) {
      wx.showToast({ title: '请输入奖励名称', icon: 'none' });
      return;
    }
    if (editReward) {
      updateReward(editReward.id, {
        title: rewardForm.title.trim(),
        cost: rewardForm.cost,
        icon: rewardForm.icon,
      });
      wx.showToast({ title: '已更新' });
      syncIfEnabled();
    } else {
      addReward({
        title: rewardForm.title.trim(),
        cost: rewardForm.cost,
        icon: rewardForm.icon,
      });
      wx.showToast({ title: '已添加' });
      syncIfEnabled();
    }
    this.closeRewardModal();
    this.loadData();
  },

  deleteReward(e) {
    const id = e.currentTarget.dataset.id;
    const reward = this.data.rewards.find((r) => r.id === id);
    if (!reward) return;
    wx.showModal({
      title: '删除奖励',
      content: '确定删除「' + reward.title + '」？',
      success: (res) => {
        if (res.confirm) {
          removeReward(reward.id);
          syncIfEnabled();
          wx.showToast({ title: '已删除' });
          this.loadData();
        }
      },
    });
  },

  onLogout() {
    wx.showModal({
      title: '登出',
      content: '确定要登出吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          wx.redirectTo({ url: '/pages/login/index?showForm=1' });
        }
      },
    });
  },

  onResetAll() {
    wx.showModal({
      title: '重置全部',
      content: '将清空所有习惯、奖励和打卡记录，确定继续？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          resetAll();
          syncIfEnabled();
          wx.showToast({ title: '已重置' });
          this.loadData();
        }
      },
    });
  },
});

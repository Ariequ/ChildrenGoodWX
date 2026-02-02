const { getCurrentUser, getCurrentUserData, redeemReward } = require('../../utils/store');
const { syncIfEnabled } = require('../../utils/sync');

Page({
  data: {
    rewards: [],
    score: 0,
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
      rewards: ud.rewards || [],
      score: ud.score || 0,
    });
  },

  onRedeem(e) {
    const { reward } = e.detail;
    const res = redeemReward(reward);
    if (res.ok) {
      syncIfEnabled();
      wx.showToast({ title: '兑换成功' });
      this.loadData();
    } else {
      wx.showToast({ title: res.msg || '兑换失败', icon: 'none' });
    }
  },
});

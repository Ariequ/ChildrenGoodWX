const { getCurrentUser, getCurrentUserData, redeemReward, getDataVersion } = require('../../utils/store');
const { syncIfEnabled } = require('../../utils/sync');
const { formatDateTime } = require('../../utils/date');
const { getShareTitle } = require('../../utils/share');

const EMOJI_MAP = {
  star: '⭐', icecream: '🍦', tv: '📺', moon: '🌙', ferriswheel: '🎡',
  bookopen: '📖', palette: '🎨', shoppingcart: '🛒', puzzle: '🧩',
  ticket: '🎫', partypopper: '🎉', banknote: '💰', users: '👥',
  headphones: '🎧', ghost: '👻', gift: '🎁',
};

function getEmojiIcon(iconName) {
  if (!iconName) return '🎁';
  const key = String(iconName).toLowerCase().replace(/[^a-z]/g, '');
  return EMOJI_MAP[key] || '🎁';
}

Page({
  data: {
    rewards: [],
    score: 0,
    rewardLogs: [],
    // 确认弹窗
    showConfirm: false,
    confirmReward: null,
  },

  _lastVersion: -1,

  onLoad() {
    this.checkAuth();
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
    const rawLogs = ud.rewardLogs || [];
    const rewardLogs = rawLogs
      .slice()
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .map((log) => ({
        ...log,
        dateDisplay: formatDateTime(log.timestamp),
        iconDisplay: getEmojiIcon(log.rewardIcon),
      }));
    this.setData({
      rewards: ud.rewards || [],
      score: ud.score || 0,
      rewardLogs,
    });
  },

  onRedeem(e) {
    const { reward } = e.detail;
    this.setData({ showConfirm: true, confirmReward: reward });
  },

  onConfirmCancel() {
    this.setData({ showConfirm: false, confirmReward: null });
  },

  onConfirmOk() {
    const reward = this.data.confirmReward;
    if (!reward) return;
    const res = redeemReward(reward);
    this.setData({ showConfirm: false, confirmReward: null });
    if (res.ok) {
      syncIfEnabled();
      wx.showToast({ title: '兑换成功' });
      this.loadData();
    } else {
      wx.showToast({ title: res.msg || '兑换失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    return {
      title: getShareTitle(),
      path: '/pages/habits/index',
    };
  },

  onShareTimeline() {
    return {
      title: getShareTitle(),
    };
  },
});

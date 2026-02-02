const { getCurrentUser, getCurrentUserData, completeOnboarding } = require('../../utils/store');
const { getHabitsByAge, getRewardsByAge } = require('../../data/recommendations');
const { GENDERS, AGE_GROUPS } = require('../../utils/constants');

Page({
  data: {
    step: 1,
    gender: null,
    ageGroup: null,
    genders: GENDERS,
    ageGroups: AGE_GROUPS,
  },

  onLoad() {
    const user = getCurrentUser();
    if (!user) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
    const ud = getCurrentUserData();
    if (ud && ud.isSetup) {
      wx.switchTab({ url: '/pages/habits/index' });
    }
  },

  onChooseGender(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ gender: key, step: 2 });
  },

  onChooseAge(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ageGroup: key });
    this.doComplete();
  },

  doComplete() {
    const { gender, ageGroup } = this.data;
    if (!ageGroup) return;
    const habits = getHabitsByAge(ageGroup);
    const rewards = getRewardsByAge(ageGroup);
    completeOnboarding({ gender, ageGroup }, habits, rewards);
    wx.switchTab({ url: '/pages/habits/index' });
  },

  back() {
    if (this.data.step === 2) {
      this.setData({ step: 1, ageGroup: null });
    }
  },
});

const { getCurrentUser, getCurrentUserData, setCurrentUser, getUserDataByCode, createNewUserWithDefaultData } = require('../../utils/store');
const { apiLogin } = require('../../utils/api');
const { ROOT_CODE } = require('../../utils/constants');

Page({
  data: {
    showForm: false,
    code: '',
    loading: false,
    errMsg: '',
  },

  onLoad(options) {
    const user = getCurrentUser();
    if (user) {
      wx.switchTab({ url: '/pages/habits/index' });
      return;
    }
    const showForm = options.showForm === '1' || options.showForm === 'true';
    this.setData({ showForm });
    if (!showForm) {
      createNewUserWithDefaultData();
      wx.switchTab({ url: '/pages/habits/index' });
    }
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value, errMsg: '' });
  },

  onEnterAsNew() {
    createNewUserWithDefaultData();
    wx.switchTab({ url: '/pages/habits/index' });
  },

  async onSubmit() {
    const code = (this.data.code || '').trim();
    if (!code) {
      this.setData({ errMsg: '请输入邀请码' });
      return;
    }
    this.setData({ loading: true, errMsg: '' });
    try {
      let res = await apiLogin(code);
      if (!res.success && code === ROOT_CODE) {
        res = {
          success: true,
          user: { id: 'local', name: '家长', role: 'admin', code: ROOT_CODE, allowSync: false },
          data: null,
        };
      }
      if (res.success && res.user) {
        setCurrentUser(res.user, res.data);
        wx.switchTab({ url: '/pages/habits/index' });
        return;
      }
      // 云端失败时尝试本地登录：若该邀请码已有数据（如从 Web 导入），用本地数据登录
      const localData = getUserDataByCode(code);
      const hasLocalData = localData && (
        localData.isSetup ||
        (Array.isArray(localData.habits) && localData.habits.length > 0) ||
        (Array.isArray(localData.rewards) && localData.rewards.length > 0)
      );
      if (hasLocalData) {
        setCurrentUser(
          { id: code, name: '导入用户', code, role: 'user', allowSync: false },
          null
        );
        wx.switchTab({ url: '/pages/habits/index' });
        return;
      }
      let msg = res.message || res.errMsg || '邀请码无效';
      if (res.isCloudNotDeployed) {
        msg = '云函数未部署。请使用邀请码 888888 本地登录，或在开发者工具中右键 cloudfunctions/habitApi 选择「上传并部署」';
      }
      this.setData({ errMsg: msg });
    } catch (e) {
      const msg = (e && (e.message || e.errMsg)) || '网络错误，请重试';
      this.setData({ errMsg: msg });
      console.error('[login]', e);
    } finally {
      this.setData({ loading: false });
    }
  },
});

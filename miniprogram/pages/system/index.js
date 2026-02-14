const { syncIfEnabled } = require('../../utils/sync');
const {
  getCurrentUser,
  addScoreManual,
  resetTodayLogs,
  resetAll,
  setUserDataByCode,
  setCurrentUser,
  getUserDataByCode,
  syncToUser,
} = require('../../utils/store');
const {
  apiInviteCreate,
  apiInviteList,
  apiInviteDelete,
  apiInviteToggleSync,
  apiSaveData,
} = require('../../utils/api');
const { ROOT_CODE } = require('../../utils/constants');

Page({
  data: {
    invites: [],
    showCreateModal: false,
    createForm: { name: '', role: 'user', allowSync: false },
    newCode: '',
    loading: false,
    importBaseUrl: 'http://212.85.13.125:3001',
    importCode: '680090',
    importLoading: false,
  },

  onLoad() {
    this.checkAuth();
    this.loadInvites();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.updateActive) tabBar.updateActive();
    this.loadInvites();
  },

  checkAuth() {
    const user = getCurrentUser();
    if (!user || user.code !== ROOT_CODE) {
      wx.switchTab({ url: '/pages/habits/index' });
    }
  },

  loadInvites() {
    apiInviteList().then((res) => {
      const invites = res.invites || [];
      this.setData({ invites });
    });
  },

  openCreateModal() {
    this.setData({
      showCreateModal: true,
      createForm: { name: '', role: 'user', allowSync: false },
      newCode: '',
    });
  },

  closeCreateModal() {
    this.setData({ showCreateModal: false });
  },

  onCreateNameInput(e) {
    this.setData({ 'createForm.name': e.detail.value });
  },

  onCreateAllowSyncChange(e) {
    this.setData({ 'createForm.allowSync': e.detail.value });
  },

  async createInvite() {
    const { name } = this.data.createForm;
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    const res = await apiInviteCreate({
      adminCode: getCurrentUser().code,
      name: name.trim(),
      role: this.data.createForm.role,
      allowSync: this.data.createForm.allowSync,
    });
    this.setData({ loading: false });
    if (res.success && res.code) {
      this.setData({ newCode: res.code });
      wx.showToast({ title: '创建成功' });
      this.loadInvites();
    } else {
      wx.showToast({ title: res.message || '创建失败', icon: 'none' });
    }
  },

  deleteInvite(e) {
    const code = e.currentTarget.dataset.code;
    if (code === ROOT_CODE) {
      wx.showToast({ title: '不能删除根管理员', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '删除邀请码',
      content: '确定删除邀请码 ' + code + '？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          apiInviteDelete(code).then((r) => {
            if (r.success) {
              wx.showToast({ title: '已删除' });
              this.loadInvites();
            } else {
              wx.showToast({ title: r.message || '删除失败', icon: 'none' });
            }
          });
        }
      },
    });
  },

  toggleSync(e) {
    const code = e.currentTarget.dataset.code;
    const allowSync = e.detail.value;
    if (code === ROOT_CODE) return;
    apiInviteToggleSync(code, allowSync).then((r) => {
      if (r.success) {
        wx.showToast({ title: '已更新' });
        this.loadInvites();
        const cur = getCurrentUser();
        if (cur && cur.code === code) {
          cur.allowSync = allowSync;
          syncToUser(code);
        }
        // 开启同步时：若本地有该账号数据，立即上传到云端，便于其他设备拉取
        if (allowSync) {
          const localData = getUserDataByCode(code);
          if (localData && (localData.isSetup || (localData.habits && localData.habits.length) || (localData.rewards && localData.rewards.length))) {
            apiSaveData(code, localData).then((res) => {
              if (res.success) {
                wx.showToast({ title: '已同步到云端', icon: 'none' });
              }
            });
          }
        }
      } else {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    });
  },

  copyCode(e) {
    const code = e.currentTarget.dataset.code;
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '已复制' }),
    });
  },

  // 调试工具
  onAddScore() {
    wx.showModal({
      title: '加积分',
      content: '增加 10 积分',
      success: (res) => {
        if (res.confirm) {
          addScoreManual(10);
          syncIfEnabled();
          wx.showToast({ title: '已加 10 积分' });
        }
      },
    });
  },

  onResetToday() {
    wx.showModal({
      title: '重置今日打卡',
      content: '清空今日所有习惯打卡记录',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          resetTodayLogs();
          syncIfEnabled();
          wx.showToast({ title: '已重置' });
        }
      },
    });
  },

  onResetAll() {
    wx.showModal({
      title: '重置全部',
      content: '清空所有习惯、奖励和打卡记录',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          resetAll();
          syncIfEnabled();
          wx.showToast({ title: '已重置' });
        }
      },
    });
  },

  // 从 Web 导入用户数据
  onImportBaseUrlInput(e) {
    this.setData({ importBaseUrl: (e.detail && e.detail.value) || '' });
  },
  onImportCodeInput(e) {
    this.setData({ importCode: (e.detail && e.detail.value) || '' });
  },
  onGoOfficial() {
    wx.navigateTo({ url: '/pages/official/index' });
  },

  onImportFromWeb() {
    const baseUrl = (this.data.importBaseUrl || '').replace(/\/+$/, '');
    const code = (this.data.importCode || '').trim();
    if (!baseUrl || !code) {
      wx.showToast({ title: '请填写地址和邀请码', icon: 'none' });
      return;
    }
    // 与 Web 端一致：使用 POST /api/login，返回 { success, user, data }
    const url = baseUrl + '/api/login';
    this.setData({ importLoading: true });
    wx.request({
      url,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { code },
      success: (res) => {
        this.setData({ importLoading: false });
        if (res.statusCode !== 200) {
          wx.showToast({ title: '请求失败 ' + res.statusCode, icon: 'none' });
          return;
        }
        let body = res.data;
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body);
          } catch (e) {
            wx.showToast({ title: '返回数据格式错误', icon: 'none' });
            return;
          }
        }
        if (!body || typeof body !== 'object') {
          wx.showToast({ title: '返回数据格式错误', icon: 'none' });
          return;
        }
        // 兼容多种返回格式：{ data }（login）、{ userData }、或 body 本身为 UserData
        const data = body.data !== undefined ? body.data
          : body.userData !== undefined ? body.userData
          : (body.habits !== undefined || body.rewards !== undefined) ? body
          : null;
        if (!data || typeof data !== 'object') {
          wx.showToast({ title: '返回数据格式错误', icon: 'none' });
          return;
        }
        const userName = (body.user && body.user.name) ? body.user.name : '导入用户';
        setUserDataByCode(code, data);
        setCurrentUser(
          { id: code, name: userName, code, role: 'user', allowSync: false },
          data
        );
        wx.showToast({ title: '导入成功' });
        wx.switchTab({ url: '/pages/habits/index' });
      },
      fail: (err) => {
        this.setData({ importLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
        console.error('[Import]', err);
      },
    });
  },
});

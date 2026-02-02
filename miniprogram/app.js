const { getCurrentUser } = require('./utils/store');

App({
  onLaunch() {
    this.globalData = {
      // 云环境 ID：顶部点「云开发」打开控制台，在左上角或设置里复制，如 'cloud1-xxxxx'
      env: 'cloud1-7g3zbpz88e9c4fd4',
      showSystemTab: false,
    };
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    this.updateSystemTab();
  },

  onShow() {
    this.updateSystemTab();
  },

  updateSystemTab() {
    const user = getCurrentUser();
    const show = !!(user && user.code === '888888');
    if (this.globalData.showSystemTab !== show) {
      this.globalData.showSystemTab = show;
    }
  },
});

// 公众号图文发表指南：小程序一键发表至公众号、公众图文展示
// 参考：https://developers.weixin.qq.com/miniprogram/dev/api/share/wx.shareToOfficialAccount.html

const DEFAULT_TITLE = '萌芽好习惯 - 用小程序养成好习惯';
const DEFAULT_CONTENT = '分享一款好用的习惯养成小程序，孩子每天打卡赚星星、换奖励，养成好习惯更有趣。\n\n#来微信做个小程序';
const DEFAULT_TAGS = ['来微信做个小程序'];

Page({
  data: {},

  onLoad() {},

  onShareToOfficialAccount() {
    if (typeof wx.shareToOfficialAccount !== 'function') {
      wx.showToast({
        title: '当前微信版本不支持，请升级',
        icon: 'none',
      });
      return;
    }
    wx.shareToOfficialAccount({
      title: DEFAULT_TITLE,
      content: DEFAULT_CONTENT,
      tags: DEFAULT_TAGS,
      path: '/pages/habits/index',
      success: () => {
        wx.showToast({ title: '已发表到公众号' });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          return;
        }
        const msg = (err.errMsg || '').toLowerCase();
        const tip = msg.indexOf('platform not supported') !== -1 || msg.indexOf('not supported') !== -1
          ? '该功能仅在手机微信中可用，请用真机扫码预览或发布后体验'
          : (err.errMsg || '发表失败');
        wx.showToast({
          title: tip,
          icon: 'none',
          duration: 3000,
        });
      },
    });
  },
});

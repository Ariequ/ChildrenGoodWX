/**
 * 订阅消息 - 每日打卡提醒
 * 微信订阅消息是一次性的，每次授权只能发一条，所以每天首次打卡后弹一次授权请求
 */

const { apiSaveSubscription } = require('./api');
const { today } = require('./date');
const { getCurrentUser } = require('./store');

const TEMPLATE_ID = 'N2f2olNXoxkFrRc3UrIQclNV_gYnYRJuCDCpo4tuL9c';
const STORAGE_KEY = 'subscribe_asked_date';

/**
 * 请求订阅消息授权（每天仅弹一次）
 * 打卡成功后调用
 */
function requestSubscribe() {
  const askedDate = wx.getStorageSync(STORAGE_KEY);
  if (askedDate === today()) return;

  wx.setStorageSync(STORAGE_KEY, today());

  wx.requestSubscribeMessage({
    tmplIds: [TEMPLATE_ID],
    success(res) {
      if (res[TEMPLATE_ID] === 'accept') {
        const user = getCurrentUser();
        if (user) {
          apiSaveSubscription(user.code).catch((err) => {
            console.error('[subscribe] save subscription error', err);
          });
        }
      }
    },
    fail(err) {
      console.warn('[subscribe] requestSubscribeMessage fail', err);
    },
  });
}

module.exports = { requestSubscribe, TEMPLATE_ID };

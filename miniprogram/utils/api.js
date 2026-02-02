/**
 * API 封装 - 云函数调用
 * 云函数 habitApi 需在 cloudfunctions 中创建
 */

const CLOUD_FUNC_NAME = 'habitApi';

/**
 * 登录
 * @param {string} code 邀请码
 * @returns {Promise<{ success, user, data }>}
 */
function apiLogin(code) {
  if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
    return Promise.resolve({
      success: false,
      errMsg: '云开发未初始化，请检查 app.js 中 env 配置',
      isCloudNotDeployed: true,
    });
  }
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'login', code: String(code).trim() },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] login error', err);
      const errMsg = err.errMsg || err.message || '网络错误';
      const isFunctionNotFound = errMsg.indexOf('FUNCTION_NOT_FOUND') !== -1 ||
        errMsg.indexOf('FunctionName parameter could not be found') !== -1 ||
        (err.errCode !== undefined && err.errCode === -501000);
      return {
        success: false,
        errMsg,
        isCloudNotDeployed: !!isFunctionNotFound,
      };
    });
}

/**
 * 保存用户数据到云端
 * @param {string} code 邀请码
 * @param {Object} data UserData
 */
function apiSaveData(code, data) {
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'saveData', code: String(code).trim(), data },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] saveData error', err);
      return { success: false, errMsg: err.errMsg };
    });
}

/**
 * 创建邀请码
 * @param {Object} params { adminCode, name, role, allowSync }
 */
function apiInviteCreate(params) {
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'inviteCreate', ...params },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] inviteCreate error', err);
      return { success: false, errMsg: err.errMsg };
    });
}

/**
 * 邀请码列表
 */
function apiInviteList() {
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'inviteList' },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] inviteList error', err);
      return { invites: [], errMsg: err.errMsg };
    });
}

/**
 * 删除邀请码
 * @param {string} targetCode
 */
function apiInviteDelete(targetCode) {
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'inviteDelete', targetCode: String(targetCode).trim() },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] inviteDelete error', err);
      return { success: false, errMsg: err.errMsg };
    });
}

/**
 * 开关跨设备同步
 * @param {string} targetCode
 * @param {boolean} allowSync
 */
function apiInviteToggleSync(targetCode, allowSync) {
  return wx.cloud
    .callFunction({
      name: CLOUD_FUNC_NAME,
      data: { type: 'inviteToggleSync', targetCode: String(targetCode).trim(), allowSync: !!allowSync },
    })
    .then((res) => res.result)
    .catch((err) => {
      console.error('[api] inviteToggleSync error', err);
      return { success: false, errMsg: err.errMsg };
    });
}

module.exports = {
  apiLogin,
  apiSaveData,
  apiInviteCreate,
  apiInviteList,
  apiInviteDelete,
  apiInviteToggleSync,
};

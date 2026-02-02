/**
 * 云端同步 - 当用户 allowSync 时，本地修改后同步到云端
 */
const { getCurrentUser, getCurrentUserData } = require('./store');
const { apiSaveData } = require('./api');

/**
 * 若当前用户开启同步，则上传数据到云端
 */
function syncIfEnabled() {
  const user = getCurrentUser();
  if (!user || !user.allowSync) return Promise.resolve();
  const data = getCurrentUserData();
  if (!data) return Promise.resolve();
  return apiSaveData(user.code, data).then((res) => {
    if (!res.success) {
      const msg = res.message || res.errMsg || '未知原因';
      console.warn('[sync] saveData failed:', msg, res);
    }
    return res;
  });
}

module.exports = { syncIfEnabled };

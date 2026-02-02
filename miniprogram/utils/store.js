/**
 * 全局 Store - 替代 Zustand，结构与 Web 版 UserData 一致
 * 持久化：wx.setStorageSync(STORAGE_KEY, ...)
 */

const { STORAGE_KEY } = require('./constants');
const { today } = require('./date');
const { getDefaultUserData } = require('../data/defaultUserData');

// 空 UserData 结构
function emptyUserData() {
  return {
    habits: [],
    rewards: [],
    logs: [],
    rewardLogs: [],
    scoreLogs: [],
    score: 0,
    isSetup: false,
    childProfile: null,
  };
}

function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

// 单例 Store
let _store = null;

function loadFromStorage() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[Store] load error', e);
  }
  return {
    userData: {},
    currentUser: null,
  };
}

function saveToStorage(data) {
  try {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] save error', e);
  }
}

function getStore() {
  if (!_store) {
    _store = loadFromStorage();
  }
  if (!_store.userData || typeof _store.userData !== 'object') {
    _store.userData = {};
  }
  return _store;
}

/**
 * 获取当前用户
 */
function getCurrentUser() {
  return getStore().currentUser || null;
}

/**
 * 获取当前用户数据（内存中顶层数据）
 */
function getCurrentUserData() {
  const user = getCurrentUser();
  if (!user) return null;
  const store = getStore();
  const ud = store.userData[user.code] || emptyUserData();
  return ud;
}

/**
 * 加载用户到内存（从 userData 载入）
 */
function loadUser(code) {
  const store = getStore();
  let ud = store.userData[code];
  if (!ud) {
    ud = emptyUserData();
    store.userData[code] = ud;
  }
  return ud;
}

/**
 * 写回 userData 并持久化；若 allowSync 则触发云端同步（由调用方通过 api 处理）
 */
function syncToUser(code) {
  const store = getStore();
  const ud = store.userData[code];
  if (ud) {
    saveToStorage(store);
    return ud;
  }
  return null;
}

/**
 * 登录：设置 currentUser，载入 userData
 * @param {Object} user { id, name, role, code, allowSync }
 * @param {Object} data 服务端返回的 UserData，可选
 */
function setCurrentUser(user, data) {
  if (!user || !user.code) return;
  const store = getStore();
  store.currentUser = user;
  if (!store.userData) store.userData = {};
  if (data) {
    store.userData[user.code] = data;
  } else {
    loadUser(user.code);
  }
  saveToStorage(store);
}

/**
 * 登出
 */
function logout() {
  const store = getStore();
  store.currentUser = null;
  saveToStorage(store);
}

/**
 * 完成引导，写入 childProfile、habits、rewards、isSetup
 */
function completeOnboarding(childProfile, habits, rewards) {
  const user = getCurrentUser();
  if (!user) return;
  const store = getStore();
  let ud = store.userData[user.code];
  if (!ud) ud = emptyUserData();
  ud.childProfile = childProfile;
  ud.habits = habits;
  ud.rewards = rewards;
  ud.isSetup = true;
  store.userData[user.code] = ud;
  saveToStorage(store);
}

/**
 * 习惯打卡：更新 logs、scoreLogs、score
 * @param {string} habitId
 * @param {number} stars 1~maxStars
 */
function logHabitStars(habitId, stars) {
  const user = getCurrentUser();
  if (!user) return { ok: false };
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return { ok: false };
  const habit = ud.habits.find((h) => h.id === habitId);
  if (!habit || stars < 1 || stars > habit.maxStars) return { ok: false };
  const date = today();
  const existing = ud.logs.find((l) => l.habitId === habitId && l.date === date);
  const oldStars = existing ? existing.stars : 0;
  const delta = stars - oldStars;
  if (existing) {
    existing.stars = stars;
    existing.timestamp = Date.now();
  } else {
    ud.logs.push({
      id: genId(),
      habitId,
      date,
      stars,
      timestamp: Date.now(),
    });
  }
  ud.scoreLogs.push({
    id: genId(),
    source: habitId,
    type: 'habit',
    sourceTitle: habit.title,
    delta,
    timestamp: Date.now(),
    date,
  });
  ud.score += delta;
  saveToStorage(store);
  return { ok: true, delta, isFull: stars === habit.maxStars };
}

/**
 * 兑换奖励
 * @param {Object} reward { id, title, cost, icon }
 */
function redeemReward(reward) {
  const user = getCurrentUser();
  if (!user) return { ok: false, msg: '未登录' };
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return { ok: false, msg: '无用户数据' };
  if (ud.score < reward.cost) return { ok: false, msg: '积分不足' };
  ud.rewardLogs.push({
    id: genId(),
    rewardId: reward.id,
    rewardTitle: reward.title,
    rewardIcon: reward.icon,
    cost: reward.cost,
    date: today(),
    timestamp: Date.now(),
  });
  ud.scoreLogs.push({
    id: genId(),
    source: reward.id,
    type: 'reward',
    sourceTitle: reward.title,
    delta: -reward.cost,
    timestamp: Date.now(),
    date: today(),
  });
  ud.score -= reward.cost;
  saveToStorage(store);
  return { ok: true };
}

/**
 * 添加习惯
 */
function addHabit(habit) {
  const user = getCurrentUser();
  if (!user) return null;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return null;
  const h = { ...habit, id: habit.id || genId() };
  ud.habits.push(h);
  saveToStorage(store);
  return h;
}

/**
 * 更新习惯
 */
function updateHabit(habitId, updates) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  const idx = ud.habits.findIndex((h) => h.id === habitId);
  if (idx < 0) return false;
  ud.habits[idx] = { ...ud.habits[idx], ...updates };
  saveToStorage(store);
  return true;
}

/**
 * 删除习惯
 */
function removeHabit(habitId) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  ud.habits = ud.habits.filter((h) => h.id !== habitId);
  ud.logs = ud.logs.filter((l) => l.habitId !== habitId);
  saveToStorage(store);
  return true;
}

/**
 * 添加奖励
 */
function addReward(reward) {
  const user = getCurrentUser();
  if (!user) return null;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return null;
  const r = { ...reward, id: reward.id || genId() };
  ud.rewards.push(r);
  saveToStorage(store);
  return r;
}

/**
 * 更新奖励
 */
function updateReward(rewardId, updates) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  const idx = ud.rewards.findIndex((r) => r.id === rewardId);
  if (idx < 0) return false;
  ud.rewards[idx] = { ...ud.rewards[idx], ...updates };
  saveToStorage(store);
  return true;
}

/**
 * 删除奖励
 */
function removeReward(rewardId) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  ud.rewards = ud.rewards.filter((r) => r.id !== rewardId);
  saveToStorage(store);
  return true;
}

/**
 * 手动加积分（调试）
 */
function addScoreManual(delta) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  ud.scoreLogs.push({
    id: genId(),
    source: 'manual',
    type: 'manual',
    sourceTitle: '手动调整',
    delta,
    timestamp: Date.now(),
    date: today(),
  });
  ud.score += delta;
  saveToStorage(store);
  return true;
}

/**
 * 重置今日打卡（删除今日 logs 及相关 scoreLogs）
 */
function resetTodayLogs() {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud) return false;
  const date = today();
  const habitIds = ud.logs.filter((l) => l.date === date).map((l) => l.habitId);
  ud.logs = ud.logs.filter((l) => l.date !== date);
  let scoreDelta = 0;
  ud.scoreLogs = ud.scoreLogs.filter((sl) => {
    if (sl.date === date && sl.type === 'habit') {
      scoreDelta += sl.delta;
      return false;
    }
    return true;
  });
  ud.score -= scoreDelta;
  saveToStorage(store);
  return true;
}

/**
 * 重置全部（清空当前用户数据，保留结构）
 */
function resetAll() {
  const user = getCurrentUser();
  if (!user) return;
  const store = getStore();
  store.userData[user.code] = {
    habits: [],
    rewards: [],
    logs: [],
    rewardLogs: [],
    scoreLogs: [],
    score: 0,
    isSetup: false,
    childProfile: store.userData[user.code]?.childProfile || null,
  };
  saveToStorage(store);
}

/**
 * 获取指定日期的 scoreLogs
 */
function getScoreLogsByDate(date) {
  const ud = getCurrentUserData();
  if (!ud) return [];
  return (ud.scoreLogs || []).filter((sl) => sl.date === date);
}

/**
 * 为旧记录补全 sourceTitle（迁移用，解析到标题后写回）
 * @param {string} scoreLogId
 * @param {string} sourceTitle
 */
function setScoreLogSourceTitle(scoreLogId, sourceTitle) {
  if (!scoreLogId || sourceTitle === undefined) return false;
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud || !Array.isArray(ud.scoreLogs)) return false;
  const log = ud.scoreLogs.find((sl) => String(sl.id) === String(scoreLogId));
  if (!log) return false;
  log.sourceTitle = sourceTitle;
  saveToStorage(store);
  return true;
}

/**
 * 获取习惯当日打卡星星数
 */
function getHabitStarsToday(habitId) {
  const ud = getCurrentUserData();
  if (!ud) return 0;
  const log = (ud.logs || []).find((l) => l.habitId === habitId && l.date === today());
  return log ? log.stars : 0;
}

/**
 * 规范化单条 scoreLog（兼容 Web/旧数据：habitId→source，rewardId→source 等）
 */
function normalizeScoreLog(sl) {
  if (!sl || typeof sl !== 'object') return sl;
  const out = { ...sl };
  if (out.type === 'habit' && out.source === undefined && out.habitId !== undefined) out.source = out.habitId;
  if (out.type === 'reward' && out.source === undefined && out.rewardId !== undefined) out.source = out.rewardId;
  if (out.sourceTitle === undefined && out.habitTitle !== undefined) out.sourceTitle = out.habitTitle;
  if (out.sourceTitle === undefined && out.rewardTitle !== undefined) out.sourceTitle = out.rewardTitle;
  return out;
}

/**
 * 规范化 Web 版导入的 UserData（保证结构完整，并规范化 scoreLogs 字段以兼容旧格式）
 */
function normalizeUserData(raw) {
  if (!raw || typeof raw !== 'object') return emptyUserData();
  const scoreLogs = Array.isArray(raw.scoreLogs)
    ? raw.scoreLogs.map(normalizeScoreLog)
    : [];
  return {
    habits: Array.isArray(raw.habits) ? raw.habits : [],
    rewards: Array.isArray(raw.rewards) ? raw.rewards : [],
    logs: Array.isArray(raw.logs) ? raw.logs : [],
    rewardLogs: Array.isArray(raw.rewardLogs) ? raw.rewardLogs : [],
    scoreLogs,
    score: typeof raw.score === 'number' ? raw.score : 0,
    isSetup: !!raw.isSetup,
    childProfile: raw.childProfile || null,
  };
}

/**
 * 按邀请码写入用户数据（用于从 Web 导入）
 * @param {string} code 邀请码
 * @param {Object} data UserData（可为 Web 版返回的原始结构）
 */
function setUserDataByCode(code, data) {
  if (!code) return null;
  const store = getStore();
  if (!store.userData) store.userData = {};
  const ud = normalizeUserData(data);
  store.userData[code] = ud;
  saveToStorage(store);
  return ud;
}

/**
 * 按邀请码读取本地用户数据（用于登录时校验是否已有导入数据）
 * @param {string} code 邀请码
 * @returns {Object|null} UserData 或 null
 */
function getUserDataByCode(code) {
  if (!code) return null;
  const store = getStore();
  return (store.userData && store.userData[code]) || null;
}

/**
 * 习惯图标迁移映射：标题 → 新图标
 * 用于将使用默认 Star 图标的习惯更新为更合适的图标
 */
const HABIT_ICON_MIGRATION = {
  '阅读一本小羊上山': 'BookOpen',
  '整理书架': 'Book',
  '创作一个漫画故事': 'PenTool',
  '不发脾气': 'Smile',
  '周末早上叠被子': 'Home',
  '周末午睡半小时': 'Moon',
  '认真上外教课，不走神。': 'GraduationCap',
  '跳绳1分钟150次': 'Dumbbell',
  '自己成功睡觉': 'Moon',
  '独立拼完一个乐高': 'Puzzle',
  '早晚主动刷牙洗脸': 'Smile',
};

/**
 * 迁移已有用户的习惯图标（将 Star 默认图标替换为更合适的图标）
 * @returns {boolean} 是否有更新
 */
function migrateHabitIcons() {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getStore();
  const ud = store.userData[user.code];
  if (!ud || !Array.isArray(ud.habits)) return false;

  let hasChange = false;
  ud.habits.forEach((habit) => {
    // 只迁移使用默认 Star 图标的习惯
    if (habit.icon === 'Star' || !habit.icon) {
      const newIcon = HABIT_ICON_MIGRATION[habit.title];
      if (newIcon) {
        habit.icon = newIcon;
        hasChange = true;
      }
    }
  });

  if (hasChange) {
    saveToStorage(store);
  }
  return hasChange;
}

/**
 * 新用户直接进入：生成 6 位用户 id，写入默认习惯/商店数据，设为当前用户
 * @returns {Object} 新用户 { id, name, code, role, allowSync }
 */
function createNewUserWithDefaultData() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const store = getStore();
  if (!store.userData) store.userData = {};
  const userData = getDefaultUserData();
  store.userData[code] = userData;
  store.currentUser = {
    id: code,
    name: '用户',
    code,
    role: 'user',
    allowSync: false,
  };
  saveToStorage(store);
  return store.currentUser;
}

module.exports = {
  getCurrentUser,
  getCurrentUserData,
  loadUser,
  syncToUser,
  setCurrentUser,
  getUserDataByCode,
  createNewUserWithDefaultData,
  getScoreLogsByDate,
  setScoreLogSourceTitle,
  migrateHabitIcons,
  logout,
  completeOnboarding,
  logHabitStars,
  redeemReward,
  addHabit,
  updateHabit,
  removeHabit,
  addReward,
  updateReward,
  removeReward,
  addScoreManual,
  resetTodayLogs,
  resetAll,
  getHabitStarsToday,
  normalizeUserData,
  setUserDataByCode,
};

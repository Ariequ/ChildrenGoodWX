const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const ROOT_CODE = '888888';
const COLLECTION = 'users';

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

// 确保根管理员存在
async function ensureRootUser() {
  try {
    const res = await db.collection(COLLECTION).where({ code: ROOT_CODE }).get();
    if (res.data.length === 0) {
      await db.collection(COLLECTION).add({
        data: {
          code: ROOT_CODE,
          name: '家长',
          role: 'admin',
          data: emptyUserData(),
          allowSync: true,
          createdAt: db.serverDate(),
        },
      });
    }
  } catch (e) {
    console.error('ensureRootUser error', e);
  }
}

// 登录
async function login(event) {
  const { code } = event;
  if (!code || typeof code !== 'string') {
    return { success: false, message: '邀请码不能为空' };
  }
  const c = String(code).trim();
  try {
    await ensureRootUser();
    const res = await db.collection(COLLECTION).where({ code: c }).get();
    if (res.data.length === 0) {
      return { success: false, message: '邀请码无效' };
    }
    const doc = res.data[0];
    const user = {
      id: doc._id,
      name: doc.name || '用户',
      role: doc.role || 'user',
      code: doc.code,
      allowSync: !!doc.allowSync,
    };
    const data = doc.data || emptyUserData();
    return { success: true, user, data };
  } catch (e) {
    console.error('login error', e);
    return { success: false, message: e.message || '登录失败' };
  }
}

// 保存用户数据
async function saveData(event) {
  const { code, data } = event;
  if (!code || !data) return { success: false, message: '参数缺失' };
  try {
    const res = await db.collection(COLLECTION).where({ code: String(code).trim() }).get();
    if (res.data.length === 0) return { success: false, message: '邀请码不存在' };
    const doc = res.data[0];
    if (!doc.allowSync) return { success: false, message: '该账号未开启跨设备同步' };
    await db.collection(COLLECTION).doc(doc._id).update({
      data: { data },
    });
    return { success: true };
  } catch (e) {
    console.error('saveData error', e);
    return { success: false, message: e.message || '保存失败' };
  }
}

// 创建邀请码
async function inviteCreate(event) {
  const { adminCode, name, role, allowSync } = event;
  if (!name || typeof name !== 'string') return { success: false, message: '名称不能为空' };
  const genCode = () => String(Math.floor(100000 + Math.random() * 900000));
  let code = genCode();
  for (let i = 0; i < 10; i++) {
    const exists = await db.collection(COLLECTION).where({ code }).get();
    if (exists.data.length === 0) break;
    code = genCode();
  }
  try {
    await db.collection(COLLECTION).add({
      data: {
        code,
        name: String(name).trim(),
        role: role || 'user',
        data: emptyUserData(),
        allowSync: !!allowSync,
        createdAt: db.serverDate(),
      },
    });
    return { success: true, code };
  } catch (e) {
    console.error('inviteCreate error', e);
    return { success: false, message: e.message };
  }
}

// 邀请码列表
async function inviteList() {
  try {
    const res = await db.collection(COLLECTION).get();
    const invites = res.data.map((d) => ({
      code: d.code,
      name: d.name,
      role: d.role,
      allowSync: !!d.allowSync,
      createdAt: d.createdAt,
    }));
    return { invites };
  } catch (e) {
    console.error('inviteList error', e);
    return { invites: [] };
  }
}

// 删除邀请码
async function inviteDelete(event) {
  const { targetCode } = event;
  if (!targetCode) return { success: false };
  const tc = String(targetCode).trim();
  if (tc === ROOT_CODE) return { success: false, message: '不能删除根管理员' };
  try {
    const res = await db.collection(COLLECTION).where({ code: tc }).get();
    if (res.data.length === 0) return { success: false };
    await db.collection(COLLECTION).doc(res.data[0]._id).remove();
    return { success: true };
  } catch (e) {
    console.error('inviteDelete error', e);
    return { success: false };
  }
}

// 开关同步
async function inviteToggleSync(event) {
  const { targetCode, allowSync } = event;
  if (!targetCode) return { success: false };
  try {
    const res = await db.collection(COLLECTION).where({ code: String(targetCode).trim() }).get();
    if (res.data.length === 0) return { success: false };
    await db.collection(COLLECTION).doc(res.data[0]._id).update({
      data: { allowSync: !!allowSync },
    });
    return { success: true };
  } catch (e) {
    console.error('inviteToggleSync error', e);
    return { success: false };
  }
}

exports.main = async (event, context) => {
  const { type } = event;
  switch (type) {
    case 'login':
      return await login(event);
    case 'saveData':
      return await saveData(event);
    case 'inviteCreate':
      return await inviteCreate(event);
    case 'inviteList':
      return await inviteList();
    case 'inviteDelete':
      return await inviteDelete(event);
    case 'inviteToggleSync':
      return await inviteToggleSync(event);
    default:
      return { success: false, message: '未知操作' };
  }
};

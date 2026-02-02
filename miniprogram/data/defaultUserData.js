/**
 * 默认习惯与商店数据（来自 http://212.85.13.125:3001/ 用户 680090）
 * 新用户进入时使用此数据，可在家长页继续编辑
 */

function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

// Tailwind 颜色类名 -> 十六进制（小程序用）
const TW_COLOR = {
  'bg-orange-400': '#fb923c',
  'bg-pink-400': '#ec4899',
  'bg-green-400': '#22c55e',
  'bg-indigo-400': '#818cf8',
  'bg-purple-400': '#a855f7',
  'bg-red-400': '#f87171',
  'bg-indigo-500': '#6366f1',
  'bg-amber-400': '#fbbf24',
  'bg-rose-400': '#fb7185',
  'bg-emerald-400': '#34d399',
  'bg-blue-500': '#3b82f6',
};

function toHex(c) {
  return (c && TW_COLOR[c]) || '#4D96FF';
}

// 默认习惯（来自 212.85.13.125:3001 用户 680090）
const DEFAULT_HABITS_TEMPLATE = [
  { title: '闹钟响后5分钟内起床/不赖床', icon: 'Sun', color: 'bg-orange-400', maxStars: 1 },
  { title: '自己穿衣服/穿袜子/不磨蹭', icon: 'Shirt', color: 'bg-pink-400', maxStars: 1 },
  { title: '自己吃饭/规定时间内吃完/不挑食', icon: 'Utensils', color: 'bg-green-400', maxStars: 1 },
  { title: '10:00 前上床熄灯', icon: 'Moon', color: 'bg-indigo-400', maxStars: 1 },
  { title: '专注做一件事15-20分钟/中途不离开（玩玩具，画画，跟妹妹做游戏）', icon: 'Brain', color: 'bg-purple-400', maxStars: 2 },
  { title: '认识10个新汉字', icon: 'Languages', color: 'bg-red-400', maxStars: 2 },
  { title: '每天3～5本 RAZ 绘本，2本英语绘本，40分钟英语动画片，1小时英语音频（周末3小时）', icon: 'GraduationCap', color: 'bg-indigo-500', maxStars: 5 },
  { title: '玩完玩具后自己收拾归位', icon: 'Box', color: 'bg-amber-400', maxStars: 1 },
  { title: '背诵一首新唐诗', icon: 'Scroll', color: 'bg-rose-400', maxStars: 5 },
  { title: '帮忙摆碗筷/擦桌子或折叠衣物', icon: 'Home', color: 'bg-emerald-400', maxStars: 1 },
  { title: '见到长辈主动问好/不说脏话/不说谎', icon: 'Heart', color: 'bg-red-400', maxStars: 1 },
  { title: '认真学习20分钟数学', icon: 'Calculator', color: 'bg-blue-500', maxStars: 2 },
  { title: '阅读一本小羊上山', icon: 'BookOpen', color: 'bg-blue-500', maxStars: 2 },
  { title: '整理书架', icon: 'Book', color: 'bg-blue-500', maxStars: 1 },
  { title: '创作一个漫画故事', icon: 'PenTool', color: 'bg-blue-500', maxStars: 3 },
  { title: '不发脾气', icon: 'Smile', color: 'bg-blue-500', maxStars: 2 },
  { title: '周末早上叠被子', icon: 'Home', color: 'bg-blue-500', maxStars: 1 },
  { title: '周末午睡半小时', icon: 'Moon', color: 'bg-blue-500', maxStars: 1 },
  { title: '认真上外教课，不走神。', icon: 'GraduationCap', color: 'bg-blue-500', maxStars: 3 },
  { title: '跳绳1分钟150次', icon: 'Dumbbell', color: 'bg-blue-500', maxStars: 5 },
  { title: '自己成功睡觉', icon: 'Moon', color: 'bg-blue-500', maxStars: 5 },
  { title: '独立拼完一个乐高', icon: 'Puzzle', color: 'bg-blue-500', maxStars: 5 },
  { title: '早晚主动刷牙洗脸', icon: 'Smile', color: 'bg-blue-500', maxStars: 1 },
];

// 默认奖励（来自 212.85.13.125:3001 用户 680090）
const DEFAULT_REWARDS_TEMPLATE = [
  { title: '兑换爱吃的零食一份', icon: 'IceCream', cost: 10 },
  { title: '看最爱的动画片一集', icon: 'Tv', cost: 15 },
  { title: '挑选一张漂亮的贴纸或一个小印章', icon: 'Star', cost: 15 },
  { title: '获得一张"晚睡券"', icon: 'Moon', cost: 20 },
  { title: '去公园/游乐场玩一次', icon: 'FerrisWheel', cost: 50 },
  { title: '和爸爸妈妈一起做手工或烘焙饼干', icon: 'Palette', cost: 60 },
  { title: '去超市拥有20元的"自由支配额度"', icon: 'ShoppingCart', cost: 80 },
  { title: '拥有一套心仪已久的乐高或大玩具', icon: 'Puzzle', cost: 300 },
  { title: '去动物园/海洋馆/迪士尼玩一整天', icon: 'Ticket', cost: 400 },
  { title: '举办家庭派对或买漂亮的裙子/鞋子', icon: 'PartyPopper', cost: 500 },
  { title: '吃一次锅盔', icon: 'Gift', cost: 40 },
  { title: '看拼多多10分钟', icon: 'Gift', cost: 20 },
  { title: '买一本新书', icon: 'Gift', cost: 50 },
  { title: '送给妹妹一个礼物', icon: 'Gift', cost: 100 },
];

/**
 * 生成带新 id 的默认习惯列表
 */
function getDefaultHabits() {
  return DEFAULT_HABITS_TEMPLATE.map((t) => ({
    id: genId(),
    title: t.title,
    icon: t.icon,
    color: toHex(t.color),
    maxStars: t.maxStars,
  }));
}

/**
 * 生成带新 id 的默认奖励列表
 */
function getDefaultRewards() {
  return DEFAULT_REWARDS_TEMPLATE.map((t) => ({
    id: genId(),
    title: t.title,
    cost: t.cost,
    icon: t.icon || 'Gift',
  }));
}

/**
 * 生成新用户的完整 UserData（习惯+商店默认，已设置 isSetup）
 */
function getDefaultUserData() {
  return {
    habits: getDefaultHabits(),
    rewards: getDefaultRewards(),
    logs: [],
    rewardLogs: [],
    scoreLogs: [],
    score: 0,
    isSetup: true,
    childProfile: null,
  };
}

module.exports = { getDefaultHabits, getDefaultRewards, getDefaultUserData };

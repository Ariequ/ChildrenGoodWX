/**
 * 年龄段推荐习惯与奖励 - 对应 spec 引导流程
 * 根据年龄段生成默认习惯和奖励
 */

const HABIT_TEMPLATES = {
  '3-6': [
    { title: '早起', icon: 'Sun', color: '#F59E0B', maxStars: 1 },
    { title: '自己刷牙', icon: 'Smile', color: '#3B82F6', maxStars: 1 },
    { title: '好好吃饭', icon: 'Utensils', color: '#10B981', maxStars: 1 },
    { title: '按时睡觉', icon: 'Moon', color: '#8B5CF6', maxStars: 1 },
    { title: '整理玩具', icon: 'Box', color: '#EC4899', maxStars: 1 },
  ],
  '7-12': [
    { title: '早起', icon: 'Sun', color: '#F59E0B', maxStars: 2 },
    { title: '整理书包', icon: 'Briefcase', color: '#3B82F6', maxStars: 2 },
    { title: '完成作业', icon: 'Book', color: '#10B981', maxStars: 2 },
    { title: '帮忙家务', icon: 'Home', color: '#8B5CF6', maxStars: 2 },
    { title: '阅读30分钟', icon: 'Scroll', color: '#06B6D4', maxStars: 2 },
    { title: '按时睡觉', icon: 'Moon', color: '#84CC16', maxStars: 2 },
  ],
  '13-16': [
    { title: '早起', icon: 'Sun', color: '#F59E0B', maxStars: 3 },
    { title: '晨间运动', icon: 'Dumbbell', color: '#10B981', maxStars: 3 },
    { title: '完成作业', icon: 'Book', color: '#3B82F6', maxStars: 3 },
    { title: '控制手机使用', icon: 'SmartphoneOff', color: '#EF4444', maxStars: 3 },
    { title: '自主学习', icon: 'Brain', color: '#8B5CF6', maxStars: 3 },
    { title: '帮忙家务', icon: 'Home', color: '#EC4899', maxStars: 3 },
    { title: '按时睡觉', icon: 'Moon', color: '#84CC16', maxStars: 3 },
  ],
};

const REWARD_TEMPLATES = {
  '3-6': [
    { title: '吃冰淇淋', icon: 'IceCream', cost: 3 },
    { title: '看一集动画', icon: 'Tv', cost: 5 },
    { title: '买一个玩具', icon: 'ShoppingCart', cost: 10 },
    { title: '去游乐场', icon: 'FerrisWheel', cost: 15 },
  ],
  '7-12': [
    { title: '吃冰淇淋', icon: 'IceCream', cost: 5 },
    { title: '看一集节目', icon: 'Tv', cost: 8 },
    { title: '买一本书', icon: 'BookOpen', cost: 15 },
    { title: '周末去玩', icon: 'FerrisWheel', cost: 25 },
    { title: '新文具', icon: 'Palette', cost: 20 },
  ],
  '13-16': [
    { title: '零食自由', icon: 'IceCream', cost: 10 },
    { title: '游戏时间', icon: 'Tv', cost: 15 },
    { title: '买书', icon: 'BookOpen', cost: 25 },
    { title: '和朋友聚会', icon: 'Users', cost: 30 },
    { title: '耳机/小礼物', icon: 'Headphones', cost: 50 },
  ],
};

function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

/**
 * 根据年龄段生成习惯列表
 * @param {string} ageGroup 3-6 | 7-12 | 13-16
 * @returns {Array} habits
 */
function getHabitsByAge(ageGroup) {
  const templates = HABIT_TEMPLATES[ageGroup] || HABIT_TEMPLATES['7-12'];
  return templates.map((t) => ({
    id: genId(),
    title: t.title,
    icon: t.icon,
    color: t.color,
    maxStars: t.maxStars,
  }));
}

/**
 * 根据年龄段生成奖励列表
 * @param {string} ageGroup
 * @returns {Array} rewards
 */
function getRewardsByAge(ageGroup) {
  const templates = REWARD_TEMPLATES[ageGroup] || REWARD_TEMPLATES['7-12'];
  return templates.map((t) => ({
    id: genId(),
    title: t.title,
    cost: t.cost,
    icon: t.icon,
  }));
}

module.exports = { getHabitsByAge, getRewardsByAge };

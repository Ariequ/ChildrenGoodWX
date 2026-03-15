/**
 * 分享工具 — 动态标题 + Canvas 分享图生成
 */

const { getCurrentUserData, getHabitStarsToday } = require('./store');
const { getAllHabitStreaks } = require('./streak');
const { COLORS } = require('./constants');

/**
 * 生成动态分享标题
 * @returns {string}
 */
function getShareTitle() {
  const ud = getCurrentUserData();
  if (!ud) return '萌芽好习惯 - 让好习惯养成更有趣';

  const name = (ud.childProfile && ud.childProfile.name) || '';
  const habits = ud.habits || [];
  const logs = ud.logs || [];

  if (habits.length === 0) return '萌芽好习惯 - 让好习惯养成更有趣';

  const streaks = getAllHabitStreaks(habits, logs);

  // 找最长连续打卡 ≥ 3 天的习惯
  let bestHabit = null;
  let bestStreak = 0;
  for (const h of habits) {
    const s = streaks[h.id] || 0;
    if (s >= 3 && s > bestStreak) {
      bestStreak = s;
      bestHabit = h;
    }
  }
  if (bestHabit) {
    var prefix = name ? name : '宝贝';
    return prefix + bestHabit.title + '连续打卡' + bestStreak + '天！来一起养成好习惯';
  }

  // 今日有打卡 → 统计星星数
  let todayStars = 0;
  for (const h of habits) {
    todayStars += getHabitStarsToday(h.id) || 0;
  }
  if (todayStars > 0) {
    var prefix2 = name ? name : '宝贝';
    return prefix2 + '今天获得了' + todayStars + '颗星星！来一起养成好习惯';
  }

  return '萌芽好习惯 - 让好习惯养成更有趣';
}

/**
 * 获取分享数据摘要（供 Canvas 绘图使用）
 */
function getShareData() {
  const ud = getCurrentUserData();
  if (!ud) return null;

  const name = (ud.childProfile && ud.childProfile.name) || '小朋友';
  const habits = ud.habits || [];
  const logs = ud.logs || [];
  const totalScore = ud.score || 0;

  const streaks = getAllHabitStreaks(habits, logs);
  let bestHabitTitle = '';
  let bestStreak = 0;
  for (const h of habits) {
    const s = streaks[h.id] || 0;
    if (s > bestStreak) {
      bestStreak = s;
      bestHabitTitle = h.title;
    }
  }

  return { name: name, bestHabitTitle: bestHabitTitle, bestStreak: bestStreak, totalScore: totalScore };
}

/**
 * 在页面 Canvas 节点上绘制分享卡片并导出临时文件
 * @param {Page} pageInstance - 页面 this
 * @returns {Promise<string|null>} 临时文件路径
 */
function generateShareImage(pageInstance) {
  return new Promise(function (resolve) {
    var data = getShareData();
    if (!data) return resolve(null);

    var query = pageInstance.createSelectorQuery();
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec(function (res) {
        if (!res || !res[0] || !res[0].node) {
          console.warn('[Share] canvas node not found');
          return resolve(null);
        }

        try {
          var canvas = res[0].node;
          var dpr = wx.getWindowInfo().pixelRatio || 2;
          var width = 500;
          var height = 400;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          var ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);

          // 背景渐变
          var grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#FFFDF5');
          grad.addColorStop(1, '#F0F9FF');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // 顶部品牌条
          ctx.fillStyle = COLORS.brandGreen;
          ctx.fillRect(0, 0, width, 70);

          ctx.font = 'bold 24px sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('\uD83C\uDF31 萌芽好习惯', 30, 45);

          // 孩子名字
          ctx.font = 'bold 28px sans-serif';
          ctx.fillStyle = COLORS.textPrimary;
          ctx.fillText('\u2B50 ' + data.name + ' 的打卡成就', 30, 130);

          // 分割线
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(30, 150);
          ctx.lineTo(width - 30, 150);
          ctx.stroke();

          // 最佳连续打卡
          ctx.font = '22px sans-serif';
          ctx.fillStyle = COLORS.textPrimary;
          if (data.bestStreak > 0 && data.bestHabitTitle) {
            ctx.fillText('\uD83D\uDD25 ' + data.bestHabitTitle + ' 连续 ' + data.bestStreak + ' 天', 40, 200);
          } else {
            ctx.fillText('\uD83D\uDD25 开始养成好习惯吧！', 40, 200);
          }

          // 累计星星
          ctx.fillText('\u2B50 累计 ' + data.totalScore + ' 颗星星', 40, 245);

          // 引导语
          ctx.font = '20px sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText('快来和我一起养成好习惯！', 30, 320);

          // 底部装饰条
          ctx.fillStyle = COLORS.brandYellow;
          ctx.fillRect(0, height - 15, width, 15);

          // 导出为临时文件
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: canvas.width,
            height: canvas.height,
            destWidth: canvas.width,
            destHeight: canvas.height,
            fileType: 'png',
            success: function (tmpRes) {
              console.log('[Share] image generated:', tmpRes.tempFilePath);
              resolve(tmpRes.tempFilePath);
            },
            fail: function (err) {
              console.warn('[Share] canvasToTempFilePath fail', err);
              resolve(null);
            },
          });
        } catch (e) {
          console.warn('[Share] generateShareImage error', e);
          resolve(null);
        }
      });
  });
}

module.exports = {
  getShareTitle: getShareTitle,
  getShareData: getShareData,
  generateShareImage: generateShareImage,
};

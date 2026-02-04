/**
 * 日期工具 - 替代 date-fns，小程序兼容
 */

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * 格式化为 yyyy-MM-dd
 * @param {Date} d
 * @returns {string}
 */
function formatDate(d) {
  if (typeof d === 'string') d = new Date(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 格式化为中文 M月d日
 * @param {Date|string} d
 * @returns {string}
 */
function formatDateCn(d) {
  if (typeof d === 'string') d = new Date(d + 'T12:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}月${day}日`;
}

/**
 * 获取星期几
 * @param {Date|string} d
 * @returns {string}
 */
function formatWeekday(d) {
  if (typeof d === 'string') d = new Date(d + 'T12:00:00');
  return WEEKDAYS[d.getDay()];
}

/**
 * 今天日期 yyyy-MM-dd
 * @returns {string}
 */
function today() {
  return formatDate(new Date());
}

/**
 * 日期加减天数
 * @param {string} dateStr yyyy-MM-dd
 * @param {number} delta 天数
 * @returns {string}
 */
function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return formatDate(d);
}

/**
 * 比较日期：a < b 返回 -1，a === b 返回 0，a > b 返回 1
 */
function compareDate(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * 格式化时间戳为 "M月d日 HH:mm"
 * @param {number} timestamp 毫秒时间戳
 * @returns {string}
 */
function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}月${day}日 ${h}:${min}`;
}

module.exports = { formatDate, formatDateCn, formatWeekday, today, addDays, compareDate, formatDateTime };

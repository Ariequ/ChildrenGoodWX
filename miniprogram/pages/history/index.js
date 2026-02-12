const { getCurrentUser, getCurrentUserData, getScoreLogsByDate, setScoreLogSourceTitle, getDataVersion } = require('../../utils/store');
const { today, formatDateCn, formatWeekday, addDays } = require('../../utils/date');

Page({
  data: {
    selectedDate: '',
    dateDisplay: '',
    weekdayDisplay: '',
    scoreLogs: [],
    habits: [],
    rewards: [],
    totalDelta: 0,
    // 左右箭头显隐
    hasPrevRecord: false,
    hasNextRecord: false,
    // AI 总结相关
    showSummary: false,
    summaryText: '',
    summaryLoading: false,
    // 日历弹窗相关
    showCalendar: false,
    calendarYear: 2026,
    calendarMonth: 2,
    calendarDays: [],
  },

  // 防止重复调用 AI
  _lastSummaryDate: null,
  _lastSummaryLogsCount: 0,
  _lastVersion: -1,

  onLoad() {
    this.checkAuth();
    const d = today();
    this.setData({
      selectedDate: d,
      dateDisplay: formatDateCn(d),
      weekdayDisplay: formatWeekday(d),
    });
    this.loadData();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.updateActive) tabBar.updateActive();
    // 只有数据版本变化时才重新加载
    if (getDataVersion() !== this._lastVersion) {
      this.loadData();
    }
    // 切换到记录页时，自动生成当日行为总结
    this.tryGenerateAISummary();
  },

  checkAuth() {
    const user = getCurrentUser();
    if (!user) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
  },

  loadData() {
    this._lastVersion = getDataVersion();
    const ud = getCurrentUserData();
    if (!ud) return;
    const date = this.data.selectedDate || today();
    const allLogs = getScoreLogsByDate(date);
    // 只显示习惯/手动调整，商店兑换记录仅在商店页展示
    const rawLogs = allLogs.filter((sl) => sl.type !== 'reward');
    // 相同习惯只保留最后一条「增加星星」记录（delta>0 且该习惯下时间戳最新）
    const habitLogs = rawLogs.filter((sl) => sl.type === 'habit');
    const otherLogs = rawLogs.filter((sl) => sl.type !== 'habit');
    const lastAddBySource = {};
    for (const sl of habitLogs) {
      if (sl.delta <= 0) continue;
      const key = sl.source !== undefined ? String(sl.source) : String(sl.habitId || '');
      const ts = sl.timestamp || 0;
      if (!lastAddBySource[key] || ts > (lastAddBySource[key].timestamp || 0)) lastAddBySource[key] = sl;
    }
    const filteredHabitLogs = Object.values(lastAddBySource);
    const logs = [...filteredHabitLogs, ...otherLogs].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const habits = ud.habits || [];
    const rewards = ud.rewards || [];
    let totalDelta = 0;
    const logsWithLabel = logs.map((sl) => {
      totalDelta += sl.delta;
      let label = sl.sourceTitle;
      if (label === undefined || label === '') {
        if (sl.type === 'habit') {
          const sourceId = sl.source !== undefined ? sl.source : sl.habitId;
          const h = habits.find((x) => String(x.id) === String(sourceId));
          label = h ? h.title : '习惯';
          if (label !== '习惯' && sl.id) setScoreLogSourceTitle(sl.id, label);
        } else {
          label = '手动调整';
        }
      }
      return { ...sl, label, deltaStr: sl.delta >= 0 ? '+' + sl.delta : String(sl.delta) };
    });
    // 检查是否有更早/更晚的记录
    const allScoreLogs = ud.scoreLogs || [];
    const allDates = [...new Set(allScoreLogs.map((sl) => sl.date).filter(Boolean))];
    const hasPrevRecord = allDates.some((d) => d < date);
    const hasNextRecord = allDates.some((d) => d > date);
    this.setData({
      scoreLogs: logsWithLabel,
      habits,
      rewards,
      totalDelta,
      hasPrevRecord,
      hasNextRecord,
      dateDisplay: formatDateCn(date),
      weekdayDisplay: formatWeekday(date),
    });
  },

  onDateChange(e) {
    const v = e.detail.value;
    if (v) {
      this.setData({ selectedDate: v });
      this.loadData();
    }
  },

  onPrevDate() {
    const d = this.data.selectedDate || today();
    const prev = addDays(d, -1);
    this.setData({ selectedDate: prev });
    this.loadData();
  },

  onNextDate() {
    const d = this.data.selectedDate || today();
    const next = addDays(d, 1);
    this.setData({ selectedDate: next });
    this.loadData();
  },

  // 日历弹窗相关方法
  openCalendar() {
    const d = this.data.selectedDate || today();
    const [y, m] = d.split('-').map(Number);
    this.setData({ showCalendar: true, calendarYear: y, calendarMonth: m });
    this.buildCalendarDays(y, m);
  },

  closeCalendar() {
    this.setData({ showCalendar: false });
  },

  buildCalendarDays(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0=周日
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // 周一为起始
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    const selected = this.data.selectedDate;
    const todayStr = today();
    const days = [];
    // 上月补位
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({ day: d, inMonth: false, date: '', isToday: false, isSelected: false });
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      days.push({
        day: d,
        inMonth: true,
        date: dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selected,
      });
    }
    // 下月补位（填满6行=42格）
    const remain = 42 - days.length;
    for (let d = 1; d <= remain; d++) {
      days.push({ day: d, inMonth: false, date: '', isToday: false, isSelected: false });
    }
    this.setData({ calendarDays: days });
  },

  onCalendarPrevMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth--;
    if (calendarMonth < 1) { calendarMonth = 12; calendarYear--; }
    this.setData({ calendarYear, calendarMonth });
    this.buildCalendarDays(calendarYear, calendarMonth);
  },

  onCalendarNextMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth++;
    if (calendarMonth > 12) { calendarMonth = 1; calendarYear++; }
    this.setData({ calendarYear, calendarMonth });
    this.buildCalendarDays(calendarYear, calendarMonth);
  },

  onCalendarDayTap(e) {
    const { date } = e.currentTarget.dataset;
    if (!date) return;
    this.setData({ selectedDate: date, showCalendar: false });
    this.loadData();
  },

  /**
   * 尝试生成 AI 总结（仅当日且有记录时触发，记录变化时重新生成）
   */
  tryGenerateAISummary() {
    const currentDate = this.data.selectedDate || today();
    const todayDate = today();
    // 仅当查看当日记录时触发
    if (currentDate !== todayDate) return;
    // 无记录则不弹
    const logs = this.data.scoreLogs;
    if (!logs || logs.length === 0) return;
    // 如果是同一天且记录数量没变化，不重复弹
    const logsCount = logs.length;
    if (this._lastSummaryDate === todayDate && this._lastSummaryLogsCount === logsCount) return;
    // 记录当前状态
    this._lastSummaryDate = todayDate;
    this._lastSummaryLogsCount = logsCount;
    // 生成 AI 总结
    this.generateAISummary(logs);
  },

  /**
   * 分析习惯的坚持情况（最近7天）
   */
  analyzeHabitStreak() {
    const ud = getCurrentUserData();
    if (!ud) return { streakHabits: [], missedHabits: [] };
    const habits = ud.habits || [];
    const allLogs = ud.logs || [];
    const todayDate = today();
    
    // 获取最近7天的日期列表
    const recentDays = [];
    for (let i = 0; i < 7; i++) {
      recentDays.push(addDays(todayDate, -i));
    }
    
    const streakHabits = []; // 连续打卡的习惯
    const missedHabits = []; // 今天断档的习惯（之前有打卡但今天没有）
    
    habits.forEach((habit) => {
      // 统计最近7天每天是否打卡
      const dayLogs = recentDays.map((date) => {
        return allLogs.some((log) => log.habitId === habit.id && log.date === date);
      });
      
      const todayLogged = dayLogs[0]; // 今天是否打卡
      const yesterdayLogged = dayLogs[1]; // 昨天是否打卡
      
      // 计算连续打卡天数（从今天往前数）
      let streak = 0;
      for (let i = 0; i < dayLogs.length; i++) {
        if (dayLogs[i]) streak++;
        else break;
      }
      
      if (streak >= 3) {
        // 连续打卡3天以上
        streakHabits.push({ title: habit.title, streak });
      } else if (!todayLogged && yesterdayLogged) {
        // 今天没打卡但昨天打卡了（断档）
        missedHabits.push({ title: habit.title });
      }
    });
    
    return { streakHabits, missedHabits };
  },

  /**
   * 调用腾讯混元大模型生成行为总结
   */
  async generateAISummary(logs) {
    if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
      console.warn('[AI] wx.cloud.extend.AI 不可用，请确保基础库 >= 3.7.1');
      return;
    }
    
    // 分析习惯坚持情况
    const { streakHabits, missedHabits } = this.analyzeHabitStreak();
    
    // 构建今日行为描述
    const behaviorLines = logs.map((log) => {
      const prefix = log.type === 'reward' ? '兑换奖励：' : '';
      const delta = log.delta >= 0 ? `+${log.delta}星` : `${log.delta}星`;
      return `- ${prefix}${log.label} ${delta}`;
    });
    const behaviorText = behaviorLines.join('\n');
    
    // 构建坚持习惯描述
    let streakText = '';
    if (streakHabits.length > 0) {
      streakText = '\n\n连续坚持的好习惯：\n' + streakHabits.map((h) => `- ${h.title}（已连续${h.streak}天）`).join('\n');
    }
    
    // 构建断档习惯描述
    let missedText = '';
    if (missedHabits.length > 0) {
      missedText = '\n\n今天还没完成的习惯：\n' + missedHabits.map((h) => `- ${h.title}`).join('\n');
    }
    
    const systemPrompt = `你是一个儿童习惯养成助手，名叫"萌芽"。请根据以下信息，用温暖鼓励的语气，为孩子写一段简短的总结（80-120字）。
要求：
1. 语气亲切可爱，像大姐姐一样
2. 肯定今天做得好的地方
3. 如果有连续坚持的习惯，要特别表扬这种坚持
4. 如果有今天还没完成的习惯，用温柔鼓励的方式提醒（不要批评）
5. 如果有兑换奖励，说明这是对努力的奖励
6. 最后给予鼓励`;
    
    const userInput = `今日完成的行为：\n${behaviorText}${streakText}${missedText}`;

    this.setData({ showSummary: true, summaryLoading: true, summaryText: '' });

    try {
      // 使用腾讯混元大模型
      const model = wx.cloud.extend.AI.createModel('hunyuan-exp');
      const res = await model.streamText({
        data: {
          model: 'hunyuan-turbos-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput },
          ],
        },
      });
      let fullText = '';
      for await (let str of res.textStream) {
        fullText += str;
        this.setData({ summaryText: fullText });
      }
      this.setData({ summaryLoading: false });
    } catch (err) {
      console.error('[AI] 生成总结失败', err);
      this.setData({
        summaryLoading: false,
        summaryText: '今天也很棒哦！继续保持好习惯吧～',
      });
    }
  },

  /**
   * 关闭 AI 总结弹窗
   */
  closeSummary() {
    this.setData({ showSummary: false });
  },

  onShareAppMessage() {
    return {
      title: '萌芽好习惯 - AI智能总结，让好习惯养成更有趣',
      path: '/pages/habits/index',
    };
  },

  onShareTimeline() {
    return {
      title: '萌芽好习惯 - AI智能总结，让好习惯养成更有趣',
    };
  },
});

const { getCurrentUser } = require('../utils/store');

Component({
  data: {
    active: 0,
    list: [
      { page: '/pages/habits/index', text: '习惯', iconType: 'success_no_circle', iconPath: '' },
      { page: '/pages/rewards/index', text: '商店', iconType: '', iconPath: '/images/icons/lucide/gift.svg' },
      { page: '/pages/history/index', text: '记录', iconType: '', iconPath: '/images/icons/home.png' },
      { page: '/pages/admin/index', text: '家长', iconType: '', iconPath: '/images/icons/setting.svg' },
      { page: '/pages/system/index', text: '系统', iconType: '', iconPath: '/images/icons/usercenter.png' },
    ],
    showSystem: false,
  },

  attached() {
    this.updateActive();
    this.updateList();
  },

  methods: {
    updateActive() {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      if (!page) return;
      const route = '/' + (page.route || '');
      const idx = this.data.list.findIndex((item) => item.page === route);
      if (idx >= 0) {
        this.setData({ active: idx });
      }
    },

    updateList() {
      const user = getCurrentUser();
      const showSystem = !!(user && user.code === '888888');
      let list = this.data.list;
      if (!showSystem) {
        list = list.filter((item) => item.text !== '系统');
      } else {
        list = [
          { page: '/pages/habits/index', text: '习惯', iconType: 'success_no_circle', iconPath: '' },
          { page: '/pages/rewards/index', text: '商店', iconType: '', iconPath: '/images/icons/lucide/gift.svg' },
          { page: '/pages/history/index', text: '记录', iconType: '', iconPath: '/images/icons/home.png' },
          { page: '/pages/admin/index', text: '家长', iconType: '', iconPath: '/images/icons/setting.svg' },
          { page: '/pages/system/index', text: '系统', iconType: '', iconPath: '/images/icons/usercenter.png' },
        ];
      }
      this.setData({ list, showSystem });
    },

    switchTab(e) {
      const url = e.currentTarget.dataset.url;
      const idx = e.currentTarget.dataset.index;
      wx.switchTab({ url });
      this.setData({ active: idx });
    },
  },
});

const { formatDateCn, formatWeekday, addDays } = require('../../utils/date');

Component({
  properties: {
    value: {
      type: String,
      value: '',
    },
  },

  data: {
    dateDisplay: '',
    weekdayDisplay: '',
    value: '',
  },

  observers: {
    'value': function (v) {
      if (v) {
        this.setData({
          dateDisplay: formatDateCn(v),
          weekdayDisplay: formatWeekday(v),
          value: v,
        });
      }
    },
  },

  methods: {
    onPrev() {
      const v = this.properties.value || this.data.value;
      if (!v) return;
      const prev = addDays(v, -1);
      this.triggerEvent('change', { value: prev });
    },
    onNext() {
      const v = this.properties.value || this.data.value;
      if (!v) return;
      const next = addDays(v, 1);
      this.triggerEvent('change', { value: next });
    },
    onPicker() {
      wx.showActionSheet({
        itemList: ['选择日期'],
        success: () => {
          const v = this.properties.value || this.data.value;
          const today = new Date();
          const defaultDate = v || today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
          wx.showModal({
            title: '选择日期',
            content: '暂不支持日期选择器，请使用左右箭头切换日期',
            showCancel: false,
          });
        },
      });
    },
  },
});

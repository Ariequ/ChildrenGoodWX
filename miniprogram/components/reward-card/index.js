// Lucide 图标文件名，与 miniprogram/images/icons/lucide/ 对应
const LUCIDE_ICON_FILES = {
  Star: 'star', IceCream: 'ice-cream-cone', Tv: 'tv', Moon: 'moon',
  FerrisWheel: 'ferris-wheel', BookOpen: 'book-open', Palette: 'palette',
  ShoppingCart: 'shopping-cart', Puzzle: 'puzzle', Ticket: 'ticket',
  PartyPopper: 'party-popper', Banknote: 'banknote', Users: 'users',
  Headphones: 'headphones', Ghost: 'ghost', Gift: 'gift',
};
const EMOJI_FALLBACK = {
  Star: '⭐', IceCream: '🍦', Tv: '📺', Moon: '🌙', FerrisWheel: '🎡',
  BookOpen: '📖', Palette: '🎨', ShoppingCart: '🛒', Puzzle: '🧩',
  Ticket: '🎫', PartyPopper: '🎉', Banknote: '💰', Users: '👥',
  Headphones: '🎧', Ghost: '👻', Gift: '🎁',
};

Component({
  properties: {
    reward: {
      type: Object,
      value: {},
    },
    score: {
      type: Number,
      value: 0,
    },
  },

  data: {
    iconDisplay: '🎁',
    iconPath: '',
    canRedeem: false,
  },

  observers: {
    'reward': function (r) {
      if (!r) return;
      const icon = r.icon;
      const file = icon && LUCIDE_ICON_FILES[icon];
      const iconPath = file
        ? '/images/icons/lucide/' + file + '.svg'
        : '';
      const iconDisplay = (icon && EMOJI_FALLBACK[icon]) || '🎁';
      this.setData({ iconPath, iconDisplay });
    },
    'reward, score': function (r, s) {
      if (r && typeof s === 'number') {
        this.setData({ canRedeem: s >= (r.cost || 0) });
      }
    },
  },

  methods: {
    onRedeem() {
      if (this.data.canRedeem) {
        this.triggerEvent('redeem', { reward: this.properties.reward });
      } else {
        wx.showToast({ title: '积分不足', icon: 'none' });
      }
    },
  },
});

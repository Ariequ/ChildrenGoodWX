// Lucide 图标 → 文件名（与 images/icons/lucide/*.svg 对应，见 map.json）
const LUCIDE_ICON_FILES = {
  Sun: 'sun', Smile: 'smile', Shirt: 'shirt', Utensils: 'utensils', Moon: 'moon',
  Brain: 'brain', Box: 'box', Scroll: 'scroll', Home: 'house', Book: 'book',
  Briefcase: 'briefcase', Clock: 'clock', Dumbbell: 'dumbbell', Heart: 'heart',
  GraduationCap: 'graduation-cap', Calculator: 'calculator', PenTool: 'pen-tool',
  SmartphoneOff: 'smartphone', Languages: 'languages',
  Star: 'star', BookOpen: 'book-open', IceCream: 'ice-cream-cone', Tv: 'tv',
  FerrisWheel: 'ferris-wheel', Palette: 'palette', ShoppingCart: 'shopping-cart',
  Puzzle: 'puzzle', Ticket: 'ticket', PartyPopper: 'party-popper', Banknote: 'banknote',
  Users: 'users', Headphones: 'headphones', Gift: 'gift', Ghost: 'ghost',
};
const EMOJI_FALLBACK = {
  Sun: '☀️', Smile: '😊', Shirt: '👕', Utensils: '🍽', Moon: '🌙', Brain: '🧠', Box: '📦',
  Scroll: '📜', Home: '🏠', Book: '📖', Briefcase: '💼', Clock: '⏰', Dumbbell: '🏋️', Heart: '❤️',
  GraduationCap: '🎓', Calculator: '🔢', PenTool: '✏️', SmartphoneOff: '📵', Languages: '🌐',
  Star: '⭐', BookOpen: '📖', IceCream: '🍦', Tv: '📺', FerrisWheel: '🎡', Palette: '🎨',
  ShoppingCart: '🛒', Puzzle: '🧩', Ticket: '🎫', PartyPopper: '🎉', Banknote: '💰',
  Users: '👥', Headphones: '🎧', Gift: '🎁', Ghost: '👻',
};
const DEFAULT_ICON = 'Book';

Component({
  properties: {
    habit: {
      type: Object,
      value: {},
    },
  },

  data: {
    starsToday: 0,
    iconDisplay: '📖',
  },

  observers: {
    'habit.starsToday': function (v) {
      const habit = this.properties.habit;
      const maxStars = habit && (habit.maxStars != null) ? habit.maxStars : 3;
      const n = Math.max(0, parseInt(v, 10) || 0);
      this.setData({ starsToday: Math.min(maxStars, n) });
    },
    'habit': function (h) {
      if (h) {
        const maxStars = h.maxStars != null ? h.maxStars : 3;
        const starsToday = Math.min(maxStars, Math.max(0, parseInt(h.starsToday, 10) || 0));
        let iconName = h.icon || DEFAULT_ICON;
        if (typeof iconName === 'string' && !EMOJI_FALLBACK[iconName] && iconName.length > 0) {
          const pascal = iconName[0].toUpperCase() + iconName.slice(1).toLowerCase();
          if (EMOJI_FALLBACK[pascal]) iconName = pascal;
        }
        const iconDisplay = EMOJI_FALLBACK[iconName] || EMOJI_FALLBACK[DEFAULT_ICON] || '📖';
        this.setData({ starsToday, iconDisplay });
      }
    },
  },

  methods: {
    onStarTap(e) {
      const star = parseInt(e.currentTarget.dataset.star, 10);
      if (isNaN(star) || star < 1) return;
      const habit = this.properties.habit;
      const maxStars = habit.maxStars || 3;
      if (star > maxStars) return;
      this.triggerEvent('starChange', { habitId: habit.id, stars: star });
    },
  },
});

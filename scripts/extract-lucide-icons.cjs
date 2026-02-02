/**
 * 从 ChildrenGood 工程的 lucide-react 提取图标，生成小程序可用的 SVG
 * 运行：在项目根目录执行 node scripts/extract-lucide-icons.cjs
 */
const fs = require('fs');
const path = require('path');

const CHILDREN_GOOD = path.join(__dirname, '../../ChildrenGood');
const LUCIDE_ICONS = path.join(CHILDREN_GOOD, 'node_modules/lucide-react/dist/esm/icons');
const OUT_DIR = path.join(__dirname, '../miniprogram/images/icons/lucide');

// PascalCase / 项目内名称 -> lucide 文件名 (kebab-case)
const ICON_MAP = {
  Sun: 'sun',
  Smile: 'smile',
  Shirt: 'shirt',
  Utensils: 'utensils',
  Moon: 'moon',
  Brain: 'brain',
  Box: 'box',
  Scroll: 'scroll',
  Home: 'house',
  Book: 'book',
  Briefcase: 'briefcase',
  Clock: 'clock',
  Dumbbell: 'dumbbell',
  Heart: 'heart',
  GraduationCap: 'graduation-cap',
  Calculator: 'calculator',
  PenTool: 'pen-tool',
  SmartphoneOff: 'smartphone',
  Languages: 'languages',
  IceCream: 'ice-cream-cone',
  Tv: 'tv',
  Star: 'star',
  FerrisWheel: 'ferris-wheel',
  BookOpen: 'book-open',
  Palette: 'palette',
  ShoppingCart: 'shopping-cart',
  Puzzle: 'puzzle',
  Ticket: 'ticket',
  PartyPopper: 'party-popper',
  Banknote: 'banknote',
  Users: 'users',
  Headphones: 'headphones',
  Gift: 'gift',
  Ghost: 'ghost',
};

function iconNodeToSvg(iconNode) {
  const attrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  const inner = iconNode
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .filter(([k]) => k !== 'key')
        .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
        .join(' ');
      return `<${tag} ${a}/>`;
    })
    .join('');
  return `<svg ${attrStr}>${inner}</svg>`;
}

function extractIconNode(content) {
  if (content.includes("export { default } from '") || content.includes('export { default } from "')) {
    return null;
  }
  const match = content.match(/const __iconNode = (\[[\s\S]*?\]);/);
  if (!match) return null;
  try {
    return eval(match[1]);
  } catch (e) {
    console.error('eval error', e.message);
    return null;
  }
}

function main() {
  if (!fs.existsSync(LUCIDE_ICONS)) {
    console.error('未找到 ChildrenGood/node_modules/lucide-react，请先在 ChildrenGood 目录执行 npm install');
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let count = 0;
  for (const [name, fileName] of Object.entries(ICON_MAP)) {
    const filePath = path.join(LUCIDE_ICONS, fileName + '.js');
    if (!fs.existsSync(filePath)) {
      console.warn('跳过（文件不存在）:', fileName);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const iconNode = extractIconNode(content);
    if (!iconNode) {
      console.warn('跳过（解析失败）:', fileName);
      continue;
    }
    const svg = iconNodeToSvg(iconNode);
    const outPath = path.join(OUT_DIR, fileName + '.svg');
    fs.writeFileSync(outPath, svg, 'utf8');
    console.log('已生成:', fileName + '.svg');
    count++;
  }

  const mapJson = path.join(OUT_DIR, 'map.json');
  fs.writeFileSync(mapJson, JSON.stringify(ICON_MAP, null, 2), 'utf8');
  console.log('\n共生成', count, '个 SVG，映射表已写入', mapJson);
}

main();

# iconfont 图标搜索参考

在 [iconfont.cn](https://www.iconfont.cn/) 搜索以下关键词，可找到与项目（萌芽好习惯）类似的图标。下载后放入 `miniprogram/images/icons/` 或使用字体方式引入。

---

## 习惯卡片图标（习惯页）

| 项目内名称 | 含义 | iconfont 搜索关键词（可多试几个） |
|-----------|------|----------------------------------|
| Sun | 早起/太阳 | **太阳**、sun、日出、早上 |
| Smile | 刷牙/笑脸 | **笑脸**、smile、牙齿、刷牙 |
| Shirt | 穿衣 | **衣服**、shirt、T恤、穿衣 |
| Utensils | 吃饭 | **餐具**、吃饭、叉勺、碗筷 |
| Moon | 睡觉/月亮 | **月亮**、moon、睡觉、夜晚 |
| Box | 整理/盒子 | **盒子**、box、收纳、整理 |
| Briefcase | 书包 | **书包**、公文包、briefcase |
| Book | 作业/书本 | **书本**、book、阅读、作业 |
| Home | 家务/家 | **房子**、home、家务、家 |
| Scroll | 阅读/卷轴 | **卷轴**、scroll、阅读、书 |
| Dumbbell | 运动 | **哑铃**、运动、健身、dumbbell |
| Brain | 学习/大脑 | **大脑**、brain、学习、思考 |
| SmartphoneOff | 少用手机 | **手机**、手机禁用、关机 |
| Clock | 时间 | **时钟**、clock、时间 |
| Heart | 爱心 | **爱心**、heart、喜欢 |
| GraduationCap | 毕业帽 | **学士帽**、毕业、graduation |
| PenTool | 笔 | **笔**、pen、写字 |
| Calculator | 计算器 | **计算器**、calculator |
| Languages | 语言 | **语言**、地球、languages |

---

## 奖励图标（商店页）

| 项目内名称 | 含义 | iconfont 搜索关键词 |
|-----------|------|---------------------|
| IceCream | 冰淇淋 | **冰淇淋**、icecream、甜筒 |
| Tv | 看电视 | **电视**、tv、视频 |
| ShoppingCart | 购物 | **购物车**、cart、购物 |
| FerrisWheel | 游乐场 | **摩天轮**、游乐场、旋转木马 |
| BookOpen | 书 | **打开的书**、book、阅读 |
| Palette | 调色板/文具 | **调色板**、palette、画笔 |
| Users | 聚会/多人 | **多人**、users、人群 |
| Headphones | 耳机 | **耳机**、headphones |
| Gift | 礼物 | **礼物**、gift、礼盒 |
| Star | 星星 | **星星**、star、收藏 |

---

## 底部 TabBar 与通用 UI

| 用途 | iconfont 搜索关键词 |
|------|---------------------|
| 习惯（对勾） | **对勾**、check、完成、success |
| 商店 | **礼物**、gift、商店 |
| 记录 | **日历**、calendar、记录、日期 |
| 家长 | **设置**、setting、齿轮、设置 |
| 系统 | **盾牌**、shield、安全、系统 |
| 星星（评分） | **星星**、star、评分、收藏 |
| 皇冠（满分） | **皇冠**、crown、奖杯 |

---

## 使用步骤（iconfont.cn）

1. 打开 https://www.iconfont.cn/ ，登录（可用淘宝/支付宝）。
2. 在顶部搜索框输入上表中的**中文关键词**（如「太阳」「笑脸」「星星」）。
3. 筛选风格：建议选 **线性/线框** 风格，与网页版 Lucide 接近；或选 **扁平/填充** 更醒目。
4. 将需要的图标加入购物车 → 进入「资源管理」→「我的项目」→ 新建项目（如「萌芽好习惯」）→ 把购物车图标添加进项目。
5. 下载方式二选一：
   - **字体图标**：项目里选「下载至本地」→ 得到 `.ttf`/`.woff` 和 demo 的 class 名，把字体放到 `miniprogram` 下，用 WXSS `@font-face` 引入，用 `<text class="iconfont icon-xxx">` 显示。
   - **PNG/SVG**：在图标详情页选「下载」→ 选 PNG 或 SVG，按 `habit.icon` 命名（如 `sun.png`）放入 `miniprogram/images/icons/habits/`，在习惯卡里用 `<image src="/images/icons/habits/{{habit.icon}}.png"/>` 引用。

---

## 小程序中使用字体图标的简要步骤

1. 把下载包里的 `.ttf` 或 `.woff` 放到 `miniprogram/fonts/`。
2. 在 `app.wxss` 里添加：

```css
@font-face {
  font-family: 'iconfont';
  src: url('/fonts/iconfont.woff2') format('woff2'),
       url('/fonts/iconfont.woff') format('woff');
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: inherit;
}
```

3. 在 iconfont 项目里查看每个图标的 **Unicode** 或 **font-class**（如 `icon-sun`），在 WXML 里用 `<text class="iconfont">&#x Unicode;</text>` 或 `<text class="iconfont icon-sun"></text>` 显示。

若使用 **PNG 图片** 方式，只需在 `habit-card` 里把 `iconDisplay`（emoji）改为 `<image src="/images/icons/habits/{{habit.icon}}.png"/>`，并保证文件名与 `habit.icon` 一致（如 Sun → sun.png）。

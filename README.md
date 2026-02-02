# 习惯小达人（ChildrenGood）

儿童习惯打卡小程序，支持星星评分、积分兑换奖励，多用户通过邀请码登录，可选云端同步。

## 功能

- **登录**：邀请码登录（云函数校验，本地 888888 兜底）
- **引导**：首次使用选择性别、年龄段，自动生成习惯与奖励
- **习惯页**：习惯卡片打星（1~maxStars），满分显示皇冠，自动累计积分
- **商店页**：奖励兑换，积分足够可兑换
- **记录页**：按日期查看积分历史
- **家长页**：管理习惯/奖励（增删改）、登出、重置全部
- **系统页**（仅邀请码 888888）：创建/删除邀请码、跨设备同步开关、调试工具

## 技术栈

- 微信小程序原生
- 云开发（云函数 habitApi + 云数据库 users）
- 本地 Store + wx.setStorageSync 持久化

## 开发

1. 使用微信开发者工具打开项目
2. 在 `miniprogram/app.js` 中配置 `globalData.env` 为云环境 ID（在开发者工具顶部「云开发」里可查看环境 ID）
3. **部署云函数**：在左侧目录树中右键 `cloudfunctions/habitApi`，选择「上传并部署 - 云端安装依赖」。未部署时真机/模拟器会报 `FunctionName parameter could not be found`，此时可用邀请码 **888888** 本地登录。
4. 首次运行会自动创建根管理员（邀请码 888888）

## 云函数

- `habitApi`：登录、保存数据、邀请码管理
- 云数据库集合 `users`：存储用户及 UserData

## 项目结构

```
miniprogram/
├── app.js, app.json, app.wxss
├── custom-tab-bar/          # 自定义 TabBar
├── utils/                   # store, api, date, constants, sync
├── data/recommendations.js  # 年龄段推荐习惯与奖励
├── components/              # habit-card, reward-card, date-picker
└── pages/                   # login, onboarding, habits, rewards, history, admin, system
cloudfunctions/
└── habitApi/                # 云函数
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**萌芽好习惯 (Sprout Good Habits)** — a WeChat Mini Program for children's habit tracking with star ratings, point rewards, and parent management. Built with native WeChat Mini Program SDK (no external framework), vanilla JavaScript, and WeChat Cloud Development backend.

## Development Environment

- **IDE**: WeChat Developer Tool (微信开发者工具) — no npm/yarn build pipeline
- **Cloud Functions**: Deploy by right-clicking `cloudfunctions/habitApi` → "上传并部署 - 云端安装依赖" in the dev tool
- **Cloud Function Dependencies**: `cd cloudfunctions/habitApi && npm install`
- **Testing**: Use the simulator or real device preview in WeChat Developer Tool

## Architecture

### Frontend (`miniprogram/`)

Each page/component follows WeChat's file convention: `index.js`, `index.wxml` (template), `index.wxss` (styles), `index.json` (config).

**State Management** (`utils/store.js`): Custom Zustand-like singleton store. All app state flows through this module — user login/logout, habit/reward CRUD, score tracking, and data persistence via `wx.setStorageSync`. Uses version tracking (`getDataVersion()`) to optimize re-renders.

**Data Model** (`data/defaultUserData.js`): UserData contains `habits[]`, `rewards[]`, `logs[]` (daily star entries), `rewardLogs[]`, `scoreLogs[]`, `score` (point balance), `childProfile`, and `isSetup` flag.

**Key Pages**:
- `login/` — Invitation code login
- `habits/` — Daily habit tracking with star ratings
- `rewards/` — Reward shop (spend points)
- `admin/` — Parent management (habits, rewards, profile)
- `system/` — System admin (code 888888 only)
- `onboarding/` — First-time child profile setup

**Components**: `habit-card` (star rating UI), `reward-card`, `date-picker`, `custom-tab-bar`

### Backend (`cloudfunctions/habitApi/`)

Single consolidated cloud function handling all API endpoints via `action` parameter: login, saveData, inviteCreate, inviteDelete, inviteList. Legacy separate cloud functions exist but are being phased out.

### Cloud Sync (`utils/sync.js`, `utils/api.js`)

Optional cloud sync toggled per user (`allowSync` flag). When enabled, login fetches from cloud and local changes POST via `apiSaveData()`. Default is local-only storage.

## Key Conventions

- **Auth**: Invitation code system. Code **888888** is the root admin with special permissions (system page access, invite management)
- **Multi-user**: Single device stores multiple users' data locally, indexed by invitation code
- **Icons**: Emoji-based with Lucide SVG fallbacks (`images/icons/lucide/map.json`)
- **Scoring**: Stars per habit per day; clicking same star count unchecks it; delta = new - old stars
- **Styling**: WXSS with brand colors defined in `utils/constants.js`; global background `#F7F9FC`
- **No external libraries**: All utilities (date formatting, state management, API wrappers) are hand-written

## Important Files

- `miniprogram/utils/store.js` — State management core (600+ lines)
- `miniprogram/app.js` — Cloud init and app lifecycle
- `miniprogram/app.json` — Page routes and tabBar config
- `cloudfunctions/habitApi/index.js` — All backend logic
- `miniprogram/utils/constants.js` — Colors, age groups, app version
- `PROJECT_SPEC.md` — Detailed product specification (from original Web version)

# Line Game

一个基于 React 的线条游戏应用。

## 项目介绍

Line Game 是一个简单有趣的线条游戏，使用 React 和 Vite 构建。玩家可以通过交互创建线条并享受游戏的乐趣。

## 技术栈

- React 18
- Vite 6
- Less
- JavaScript

## 项目结构

```
line-game/
├── node_modules/          # 项目依赖包
├── public/                # 静态资源目录
├── src/                   # 源代码目录
│   ├── assets/            # 静态资源文件
│   ├── components/        # 组件目录
│   │   ├── Confetti/      # 庆祝效果组件
│   │   ├── Game/          # 游戏主要组件
│   │   ├── Header/        # 页头组件
│   │   └── Layout/        # 布局组件
│   ├── constant/          # 常量定义
│   ├── utils/             # 工具函数
│   │   ├── game.js        # 游戏逻辑工具
│   │   ├── sound.js       # 声音工具
│   │   └── index.js       # 工具函数导出
│   ├── App.css            # 应用样式
│   ├── App.jsx            # 应用入口组件
│   ├── index.css          # 全局样式
│   └── main.jsx           # 应用入口文件
├── .eslintrc.json         # ESLint 配置
├── .gitignore             # Git 忽略文件
├── eslint.config.js       # ESLint 配置
├── index.html             # 项目 HTML 入口
├── jsconfig.json          # JavaScript 配置
├── package-lock.json      # 依赖锁定文件
├── package.json           # 项目依赖配置
└── vite.config.js         # Vite 配置
```

## 功能特点

- 交互式线条游戏
- 动画效果
- 声音反馈
- 响应式设计

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

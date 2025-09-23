<h1 align='center'>🔥🔥🔥Prydia🔥🔥🔥</h1>

---

## 项目介绍

Nuxt3 Prydia

- [![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

### 环境要求

- Node.js v18.0.0以上

## Nuxt 3 项目启动

查看[Nuxt3 文档](https://nuxt.com/docs/getting-started/introduction)了解更多信息

### 安装

安装项目依赖:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 开发服务器

启动本地开发环境 `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

### 生产环境

打包生产环境:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

本地运行预览生产版本:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

升级nuxt版本:

```bash
npx nuxi upgrade --force
```

### 服务器部署
总体流程：先提交代码到master分支，然后ssh登录对应的服务器，进入到代码路径(/root/repo/seein-official-website-3.15.4)，执行部署的脚本.  
测试环境：
```
bash deploy-dev.sh
```
生产环境：
```
bash deploy-prod.sh
```

查看[部署文档](https://nuxt.com/docs/getting-started/deployment)了解更多信息。

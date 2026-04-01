# 匿名在线论坛（话题讨论 + 意见箱）

一个“无需登录、匿名参与”的在线论坛：
- 公开区：任何人可浏览/发起话题、发表评论。
- 意见箱：任何人可匿名提交意见；普通用户不可查看已提交意见；仅管理员可查看。
- 隐私：除管理员外不记录用户信息（后端不保存用户身份字段）。
- 管理员只读：管理员不能发帖/评论/提交意见，只能查看。

## 本地开发

### 1) 安装依赖

```bash
pnpm install
```

### 2) 启动（推荐）

```bash
pnpm dev
```

- 前端端口默认 `5173`，若被占用会自动顺延。
- 后端端口默认 `3001`，若被占用会自动选择可用端口，并同步给前端代理（前端 `/api/*` 始终可用）。

### 3) 管理员密钥（可选）

默认管理员密钥为 `dev-admin-token`。你可以新建 `.env` 覆盖：

```bash
ADMIN_TOKEN=replace-with-a-strong-random-string
```

可以参考示例文件：`.env.example`。

## 访问入口

- 前端：`http://localhost:5173/`（或自动顺延端口）
- 管理员：`/admin`

## API 概览

- 健康检查：`GET /api/health`
- 话题：
  - `GET /api/topics`
  - `POST /api/topics`
  - `GET /api/topics/:id`
  - `POST /api/topics/:id/comments`
- 意见：
  - `POST /api/opinions`
- 管理员（只读）：
  - `POST /api/admin/login`
  - `GET /api/admin/opinions`
  - `GET /api/admin/opinions/:id`

管理员请求需在 Header 带 `x-admin-token: <ADMIN_TOKEN>`。

## 目录结构

- `src/`：前端页面与组件
- `api/`：后端 API（Express）
- `shared/`：前后端共享类型
- `scripts/dev.ts`：本地开发启动脚本（自动端口 + 代理）

## 部署

- 只使用 Nginx（静态托管 + 反代 API）：见 [DEPLOY_NGINX.md](docs/DEPLOY_NGINX.md)

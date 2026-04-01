# 部署文档（Nginx）

本项目包含：
- 前端：Vite + React（构建产物在 `dist/`）
- 后端：Express API（`api/server.ts`）

你提出“只使用 Nginx 部署”的需求，在工程上通常理解为：
- Nginx 负责对外提供 HTTP(S)、静态资源与路由兜底
- Nginx 反代 `/api/*` 到同机的 Node API 进程

仅靠 Nginx 无法直接运行 TypeScript/Node 的业务逻辑（话题/评论/意见 API），因此仍需要一个后端进程承载 API。

完整步骤与可直接复制的配置示例见：
- [DEPLOY_NGINX.md](./DEPLOY_NGINX.md)

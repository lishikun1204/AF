# 使用 Nginx 部署（生产）

目标：
- Nginx 托管前端静态文件（`dist/`）
- Nginx 反代 `/api/*` 到本机 Node API（Express）

## 前置条件

- 一台 Linux 服务器（Ubuntu/Debian/CentOS 均可）
- 已安装 Node.js（建议 LTS）与 pnpm
- 已安装 Nginx

## 1) 构建前端

在你的 CI 或服务器上执行：

```bash
pnpm install
pnpm build
```

构建产物在 `dist/`。

## 2) 准备运行目录

建议目录（可按需调整）：

- 站点目录：`/var/www/lt`（放 `dist/`）
- API 运行目录：`/srv/lt`（放源码 + node_modules）
- 数据目录：`/srv/lt-data`（存放 `forum.json`）

示例：

```bash
sudo mkdir -p /var/www/lt
sudo mkdir -p /srv/lt
sudo mkdir -p /srv/lt-data
sudo chown -R $USER:$USER /var/www/lt /srv/lt /srv/lt-data
```

将前端构建产物拷贝到站点目录：

```bash
cp -r dist/* /var/www/lt/
```

## 3) 启动后端 API（Node）

### 3.1 说明：为什么仍需要 Node

Nginx 只能做静态文件与反代，无法直接运行 Express/TypeScript，所以 API 必须由 Node 进程承载。

### 3.2 使用 systemd 托管（推荐）

1) 在服务器上准备 API 代码（仓库克隆到 `/srv/lt`，并安装依赖）：

```bash
cd /srv/lt
pnpm install
```

2) 配置环境变量

- `ADMIN_TOKEN`：管理员密钥（强随机）
- `PORT`：API 监听端口（建议 `3001`）
- `LT_DATA_DIR`：数据目录（建议 `/srv/lt-data`）

建议把环境变量写到 `/etc/lt-api.env`：

```bash
sudo tee /etc/lt-api.env > /dev/null <<'EOF'
ADMIN_TOKEN=replace-with-a-strong-random-string
PORT=3001
LT_DATA_DIR=/srv/lt-data
EOF
```

3) 创建 systemd service

把仓库中的模板复制到服务器（见 `deploy/systemd/lt-api.service`），或直接创建：

```bash
sudo tee /etc/systemd/system/lt-api.service > /dev/null <<'EOF'
[Unit]
Description=lt anonymous forum API
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/lt
EnvironmentFile=/etc/lt-api.env
ExecStart=/usr/bin/env pnpm run server:prod
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF
```

4) 启动并设为开机自启

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lt-api
sudo systemctl status lt-api
```

## 4) Nginx 配置

把仓库中的模板复制到服务器（见 `deploy/nginx/lt.conf`），或直接创建：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/lt;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

启用站点并检查配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5) 校验

```bash
curl -i http://127.0.0.1:3001/api/health
curl -i http://example.com/api/health
```

## 数据持久化

本项目默认使用 JSON 文件存储。生产环境建议通过 `LT_DATA_DIR=/srv/lt-data` 指定一个持久目录。

注意：如果要做多机/多实例扩展，请将 `api/storage/forumStore.ts` 替换为数据库实现。

# 编码规范（UTF-8）

目标：确保中文（简体/繁体/标点/表情）在“写入 → 存储 → 读取 → 展示”全链路不出现乱码。

## 统一要求

- 源码/配置/模板：统一使用 UTF-8（建议 UTF-8 无 BOM）。
- HTTP：JSON 请求与响应统一 UTF-8。
- 存储：文件存储使用 UTF-8 编码写入。

## 后端（API）

- JSON 请求体：
  - 客户端应发送 `Content-Type: application/json; charset=utf-8`
  - 后端会基于原始字节解析 JSON，并兼容 UTF-8 / UTF-16（含 BOM/charset 推断），避免非 UTF-8 客户端导致中文异常。

- JSON 响应：Express `res.json()` 默认会返回 `application/json; charset=utf-8`。

## 前端

- `index.html` 必须包含 `<meta charset="UTF-8" />`。
- 所有 `fetch` 的 JSON POST 必须使用 `Content-Type: application/json; charset=utf-8`。

## 文件存储

- 本项目默认写入 `forum.json`，以 UTF-8 保存。
- 本地开发默认目录：`api/data/`
- 生产部署建议使用 `LT_DATA_DIR` 指定持久目录（避免与代码目录混在一起）。

## 复现与排查建议

常见乱码场景与定位顺序：
- 接口传输：检查请求 `Content-Type` 是否显式 UTF-8；优先抓包或在服务端记录 `content-type`。
- 文件导入导出：确认写入时使用 UTF-8；避免 Windows 默认 ANSI 编码写入。
- 数据库：如将来引入 DB，统一 `utf8mb4`（MySQL）/ `UTF8`（Postgres），并确保连接字符串显式设置字符集。


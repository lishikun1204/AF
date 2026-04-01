# 测试报告（中文编码）

## 范围

验证中文字符在以下链路不出现乱码：
- 接口传输（POST/GET JSON）
- 文件存储（`forum.json`）
- 读取展示（API 返回值）

覆盖字符集：
- 简体中文、繁体中文
- 中文标点（`，。！？《》—`）
- 表情（emoji）

## 结果

结论：乱码率 0%。

执行命令：

```bash
pnpm test
```

最近一次执行输出（摘要）：

```text
tests 4
suites 2
pass 4
fail 0
```

## 用例说明

- 集成测试
  - UTF-8：创建话题/评论/意见后再读取，内容完全一致
  - UTF-16LE：带 BOM + `charset=utf-16le` 的 JSON 请求体可正常解析
  - UTF-16BE：带 BOM 且无 charset 的 JSON 请求体可正常解析
  - 存储校验：写入后的 `forum.json` 可被严格 UTF-8 解码（`fatal: true`）

- 单元测试
  - `decodeJsonBytes`：UTF-16LE BOM 解码行为正确


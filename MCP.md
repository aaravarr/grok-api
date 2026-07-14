# grok-api MCP

Imagine 图片/视频 + Voice TTS 能力，通过 **远程 MCP（Streamable HTTP）** 接入。  
客户端只需 URL + API Key，不需要拉代码、不需要 `cwd`。

## 前提

先启动 grok-api：

```bash
npm run start
```

MCP 端点随主服务一起提供：

```text
http://127.0.0.1:8787/mcp
```

鉴权与 `/v1` 相同：`Authorization: Bearer gk_...`

## Codex / Claude Desktop 配置（推荐）

```json
{
  "mcpServers": {
    "grok-api": {
      "url": "http://127.0.0.1:8787/mcp",
      "headers": {
        "Authorization": "Bearer gk_xxx"
      }
    }
  }
}
```

可选固定池内账号：

```json
{
  "mcpServers": {
    "grok-api": {
      "url": "http://127.0.0.1:8787/mcp",
      "headers": {
        "Authorization": "Bearer gk_xxx",
        "x-account-id": "your-account-id"
      }
    }
  }
}
```

## Tools

| Tool | 说明 |
|---|---|
| `grok_list_image_models` | 图片模型列表 |
| `grok_list_video_models` | 视频模型列表 |
| `grok_image_generate` | 文生图 |
| `grok_image_edit` | 图编辑 |
| `grok_video_generate` | 文/图生视频（异步，返回 request_id） |
| `grok_video_edit` | 视频编辑（异步） |
| `grok_video_extend` | 视频续写（异步） |
| `grok_video_status` | 查询视频任务 |
| `grok_list_voices` | 内置 TTS 音色列表 |
| `grok_list_custom_voices` | 自定义音色列表 |
| `grok_tts` | 文本转语音（支持情感标签，返回 `audio_base64`） |
| `grok_voice_create_client_secret` | 创建 Realtime Voice 临时 client secret |

## 兼容：本地 stdio 桥（可选）

仅在客户端不支持远程 MCP URL 时使用：

```bash
set GROK_API_BASE=http://127.0.0.1:8787
set GROK_API_KEY=gk_xxx
npm run mcp
```

## Voice / TTS

短剧配音优先用这些工具：

- `grok_list_voices` — 查可用内置音色（如 `eve` / `ara`）
- `grok_tts` — 文本转语音；支持 `<soft>`、`<excited>`、`[laugh]` 等表达标签
- `grok_voice_create_client_secret` — 给浏览器 Realtime Voice 会话拿临时密钥（不负责 WS 长连接）
- `grok_list_custom_voices` — 列出自定义音色（账号有权限时）

`grok_tts` 默认走二进制音频，MCP 会包装成：

```json
{
  "content_type": "audio/mpeg",
  "byte_length": 12345,
  "audio_base64": "...",
  "encoding": "base64"
}
```

也可传 `with_timestamps: true` 获取带时间戳的 JSON 结果。

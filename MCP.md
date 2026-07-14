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

> 工具列表可按用户配置：`GET/PATCH /api/me/mcp-tools`。默认开启常用工具，自定义音色管理工具默认关闭；任意工具都可勾选启用/取消。API Key 归属用户后，`/mcp` 只返回该用户启用的工具。

| Tool | 说明 |
|---|---|
| `grok_list_image_models` | 图片模型列表 |
| `grok_list_video_models` | 视频模型列表 |
| `grok_image_generate` | 文生图（1k/2k，可 batch） |
| `grok_image_edit` | 图编辑（单图 JSON） |
| `grok_video_generate` | 文/图生视频（异步；duration 1–15s） |
| `grok_video_edit` | 视频编辑（异步；输入 ≤ ~8.7s） |
| `grok_video_extend` | 视频续写（异步；输入建议 ≤ ~15s） |
| `grok_video_status` | 查询视频任务 |
| `grok_list_voices` | 内置 TTS 音色列表 |
| `grok_list_custom_voices` | 自定义音色列表（约 30 上限） |
| `grok_get_custom_voice` | 查询单个自定义音色 |
| `grok_create_custom_voice` | 创建自定义音色（参考音频 ≤120s） |
| `grok_update_custom_voice` | 更新自定义音色元数据 |
| `grok_delete_custom_voice` | 删除自定义音色（腾名额） |
| `grok_get_custom_voice_audio` | 下载自定义音色参考音频 |
| `grok_tts` | 文本转语音（≤15000 字，返回 `audio_base64`） |
| `grok_voice_create_client_secret` | Realtime 浏览器临时密钥 |

## 兼容：本地 stdio 桥（可选）

仅在客户端不支持远程 MCP URL 时使用：

```bash
set GROK_API_BASE=http://127.0.0.1:8787
set GROK_API_KEY=gk_xxx
npm run mcp
```

## Image 限制

- **生成 `grok_image_generate`**
  - `aspect_ratio`：`1:1` / `16:9` / `9:16` / `4:3` / `3:4` / `3:2` / `2:3` / `auto` 等
  - `resolution`：`1k` / `2k`
  - `n`：批量生成多张（文档示例可用 4）
  - 返回 URL 通常是**临时链接**，需尽快下载
- **编辑 `grok_image_edit`**
  - 输入：公网 URL 或 `data:image/...;base64,...`
  - 请求体是 **JSON**（不是 OpenAI multipart form）
  - 当前工具按**单图编辑**暴露；官方另有最多约 3 张参考图的多图编辑能力
  - 单图编辑时输出比例通常跟随输入图

## Video 限制（务必遵守，避免 agent 误用）

来自 xAI 官方文档，工具 description 中已同步：

- **生成 `grok_video_generate`**
  - `duration`：1–15 秒
  - `aspect_ratio`：如 `1:1` / `16:9` / `9:16` / `4:3` / `3:4`
  - `resolution`：`480p` / `720p` / `1080p`（视模型）
  - `grok-imagine-video-1.5` **不支持纯文生视频**，必须传 `image_url`（图生视频）
  - `grok-imagine-video` 支持文生视频 / 图生视频
- **编辑 `grok_video_edit`**
  - 输入必须是 **`.mp4`**（H.264 / H.265 / AV1 等）
  - 输入时长最大约 **8.7 秒**
  - **不支持**自定义 `duration` / `aspect_ratio` / `resolution`（输出继承输入；分辨率最高约 720p）
- **续写 `grok_video_extend`**
  - 输入源视频建议 **不超过约 15 秒**
  - `duration` 只表示 **新增续写时长**，不是最终总时长
  - 示例：输入 10s + `duration=5` => 输出约 15s
  - 从最后一帧无缝续写；若要改内容请用 edit，不要用 extend
- **状态 `grok_video_status`**
  - 异步任务需轮询；完成后 `video.url` 为临时链接
  - 服务端会记住 `request_id -> account` 粘性映射

## TTS / Voice 限制

- **`grok_tts`**
  - `text` 最长 **15000** 字符
  - 推荐传 `language`（`zh` / `en` / `auto` 等）
  - `speed`：`0.7`–`1.5`
  - `codec`：`mp3` / `wav` / `pcm` / `mulaw` / `alaw`
  - `sample_rate`：`8000` / `16000` / `22050` / `24000` / `44100` / `48000`
  - `bit_rate`（mp3）：`32000`–`192000`
  - 支持标签：`[pause]` `[laugh]` `[sigh]` 以及 `<soft>` 等风格包裹
  - 默认返回 `audio_base64`（二进制包装）；`with_timestamps=true` 时偏 JSON 时间戳
- **Custom voices（约 30 上限，建议用删除腾位）**
  - 默认不进入 MCP 工具列表；在 Media 页「可选 MCP 工具」开启后，该用户 API Key 才能看到
  - `grok_list_custom_voices`：列表（`limit` / `pagination_token`）
  - `grok_get_custom_voice`：详情
  - `grok_create_custom_voice`：`name` + `audio_base64`；参考音频最长约 **120 秒**；格式 wav/mp3/flac/ogg/m4a/mp4 等
  - `grok_update_custom_voice`：改 `name` / `description` / `language`（不改参考音频）
  - `grok_delete_custom_voice`：删除以释放名额
  - `grok_get_custom_voice_audio`：下载参考音频（`audio_base64`）
  - 部分区域/套餐可能受限；创建失败时先 list 看是否已满 30
- **`grok_voice_create_client_secret`**
  - 只生成**短时**浏览器 Realtime 凭证
  - **不会**替你建立 `wss://api.x.ai/v1/realtime`
  - 不适用于 SIP `call_id` 场景

## Voice / TTS


短剧配音优先用这些工具：

- `grok_list_voices` — 查可用内置音色（如 `eve` / `ara`）
- `grok_tts` — 文本转语音；支持 `<soft>`、`<excited>`、`[laugh]` 等表达标签
- `grok_voice_create_client_secret` — 给浏览器 Realtime Voice 会话拿临时密钥（不负责 WS 长连接）
- `grok_list_custom_voices` / `grok_create_custom_voice` / `grok_update_custom_voice` / `grok_delete_custom_voice` — 管理约 30 个自定义音色名额

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

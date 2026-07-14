export function mediaViewHtml(page: string): string {
  const on = page === "media" ? "on" : "";
  return `
        <!-- MEDIA -->
        <section class="view ${on}" id="view-media">
          <div class="media-shell">
            <div class="media-hero">
              <div class="media-hero-copy">
                <div class="media-kicker" data-i18n="mediaKicker">Imagine Studio</div>
                <h1 data-i18n="mediaTitle">Media</h1>
                <p data-i18n="mediaSub">Generate and edit images/videos with your SuperGrok pool. Pick a key, craft a prompt, ship assets.</p>
              </div>
              <div class="media-hero-meta">
                <span class="pill soft" id="mediaAccountPill">–</span>
                <span class="mono mute" data-i18n="mediaCostHint">Uses SuperGrok credits</span>
              </div>
            </div>

            <div class="media-layout">
              <div class="media-main">
                <div class="panel media-studio">
                  <div class="media-body" id="mediaBody">
                    <div class="media-form">
                      <div class="media-form-scroll">
                      <div class="media-toolbar">
                        <div class="field media-toolbar-field">
                          <label data-i18n="mediaMode">Mode</label>
                          <select id="mediaModeSelect" class="input">
                            <option value="image">Image</option>
                            <option value="image_edit">Edit image</option>
                            <option value="video">Video</option>
                            <option value="video_edit">Edit video</option>
                            <option value="video_extend">Extend</option>
                          </select>
                        </div>
                        <div class="field media-toolbar-field">
                          <label data-i18n="mediaStudioKey">Studio API Key</label>
                          <select id="mediaStudioKey" class="input"></select>
                        </div>
                      </div>

                      <div class="media-form-stack">
                        <div class="field" id="mediaPromptField">
                          <div class="media-label-row">
                            <label data-i18n="mediaPrompt">Prompt</label>
                            <button class="btn btn-ghost btn-sm" type="button" id="btnMediaAiPrompt" data-i18n="mediaAiPrompt">AI polish</button>
                          </div>
                          <textarea id="mediaPrompt" class="input media-prompt" rows="5" data-i18n-placeholder="mediaPromptPh" placeholder="A cinematic neon alley in rain, 35mm film still"></textarea>
                          <div class="media-polish-box">
                            <label class="media-polish-label" for="mediaAiInstruction" data-i18n="mediaAiInstruction">Polish notes (optional)</label>
                            <input id="mediaAiInstruction" class="input media-polish-input" data-i18n-placeholder="mediaAiInstructionPh" placeholder="e.g. more cinematic, keep Chinese, add rain and neon" />
                          </div>
                          <div class="media-help" data-i18n="mediaPromptHelp">Describe subject, lighting, lens and mood. AI polish streams into the prompt box.</div>
                        </div>

                        <div class="field" id="mediaModelField">
                          <label data-i18n="mediaModel">Model</label>
                          <select id="mediaModel" class="input"></select>
                        </div>

                        <div class="media-grid-2" id="mediaImageOpts">
                          <div class="field" id="mediaAspectField">
                            <label data-i18n="mediaAspect">Aspect</label>
                            <select id="mediaAspect" class="input">
                              <option value="auto">auto</option>
                              <option value="1:1">1:1</option>
                              <option value="16:9">16:9</option>
                              <option value="9:16">9:16</option>
                              <option value="4:3">4:3</option>
                              <option value="3:4">3:4</option>
                            </select>
                          </div>
                          <div class="field" id="mediaCountField">
                            <label data-i18n="mediaCount">Count</label>
                            <select id="mediaCount" class="input">
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                            </select>
                          </div>
                        </div>

                        <div class="media-grid-2" id="mediaVideoOpts" hidden>
                          <div class="field" id="mediaVideoAspectField">
                            <label data-i18n="mediaAspect">Aspect</label>
                            <select id="mediaVideoAspect" class="input">
                              <option value="auto">auto</option>
                              <option value="1:1">1:1</option>
                              <option value="16:9">16:9</option>
                              <option value="9:16">9:16</option>
                              <option value="4:3">4:3</option>
                              <option value="3:4">3:4</option>
                            </select>
                          </div>
                          <div class="field">
                            <label data-i18n="mediaDuration">Duration (s)</label>
                            <input id="mediaDuration" class="input" type="number" min="1" max="15" value="6" />
                          </div>
                          <div class="field">
                            <label data-i18n="mediaResolution">Resolution</label>
                            <select id="mediaResolution" class="input">
                              <option value="">default</option>
                              <option value="480p">480p</option>
                              <option value="720p">720p</option>
                            </select>
                          </div>
                        </div>

                        <div class="field" id="mediaImageUrlField" hidden>
                          <label data-i18n="mediaImageUrl">Source image</label>
                          <div class="media-source-card">
                            <label class="media-source-drop" for="mediaImageFile">
                              <div class="media-source-preview" id="mediaImagePreview">
                                <span data-i18n="mediaImageDrop">Click to upload, or paste a URL below</span>
                              </div>
                              <input id="mediaImageFile" type="file" accept="image/*" hidden />
                            </label>
                            <input id="mediaImageUrl" class="input media-source-url" data-i18n-placeholder="mediaImageUrlPh" placeholder="https://... or data:image/..." />
                            <div class="mono mute" id="mediaImageFileName"></div>
                          </div>
                        </div>

                        <div class="field" id="mediaVideoUrlField" hidden>
                          <label data-i18n="mediaVideoUrl">Source video URL</label>
                          <input id="mediaVideoUrl" class="input" data-i18n-placeholder="mediaVideoUrlPh" placeholder="https://..." />
                        </div>

                        <details class="media-advanced">
                          <summary data-i18n="mediaAdvanced">Advanced</summary>
                          <div class="media-advanced-body">
                            <div class="media-grid-2">
                              <div class="field" id="mediaFormatField">
                                <label data-i18n="mediaFormat">Response</label>
                                <select id="mediaFormat" class="input">
                                  <option value="url">url</option>
                                  <option value="b64_json">b64_json</option>
                                </select>
                              </div>
                              <div class="field">
                                <label data-i18n="mediaAccountPin">Pin account id</label>
                                <input id="mediaAccountPin" class="input mono" data-i18n-placeholder="mediaAccountPinPh" placeholder="x-account-id" />
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                      </div>

                      <div class="media-actions">
                        <button class="btn" type="button" id="btnMediaRun" data-i18n="mediaRun">Generate</button>
                        <button class="btn btn-secondary" type="button" id="btnMediaClear" data-i18n="mediaClear">Clear</button>
                        <span class="media-status mono" id="mediaStatusText" hidden></span>
                      </div>
                    </div>

                    <div class="media-result" id="mediaResultPanel" hidden>
                      <div class="media-result-hd">
                        <div class="media-result-hd-main">
                          <strong data-i18n="mediaResult">Result</strong>
                          <div class="media-result-sub mono" id="mediaResultMeta">–</div>
                        </div>
                        <div class="media-result-idbar" id="mediaResultIdBar" hidden>
                          <span class="media-result-id-label" data-i18n="mediaRequestIdLabel">Request ID</span>
                          <code class="media-result-id mono" id="mediaResultRequestId">–</code>
                          <button type="button" class="btn btn-secondary btn-sm" id="btnMediaCopyRequestId" data-i18n="mediaCopyId">Copy ID</button>
                        </div>
                      </div>
                      <div class="media-result-bd" id="mediaResult"></div>
                    </div>
                  </div>
                </div>
              </div>

              <aside class="media-side">
                <div class="panel media-mcp">
                  <div class="panel-hd">
                    <strong data-i18n="mediaMcpTitle">MCP setup</strong>
                    <div class="spacer"></div>
                    <span class="pill soft" data-i18n="mediaMcpBadge">Agents</span>
                  </div>
                  <div class="panel-bd media-mcp-bd">
                    <p class="media-side-copy" data-i18n="mediaMcpSub">Remote MCP: copy the config below. No local checkout or process needed.</p>

                    <div class="field media-field-tight">
                      <label data-i18n="mediaMcpKey">API Key</label>
                      <select id="mediaMcpKey" class="input"></select>
                    </div>

                    <div class="field media-field-tight">
                      <label data-i18n="mediaMcpConfig">Client config</label>
                      <div class="media-codebox">
                        <button class="media-code-copy" type="button" id="btnMediaCopyCfg" title="Copy" aria-label="Copy">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <pre class="media-code-pre" id="mediaMcpConfig" aria-label="MCP config"></pre>
                      </div>
                    </div>

                    <div class="media-steps">
                      <div class="media-step"><strong>1</strong><span data-i18n="mediaStep1">Create or pick an API key</span></div>
                      <div class="media-step"><strong>2</strong><span data-i18n="mediaStep2">Copy the remote MCP config</span></div>
                      <div class="media-step"><strong>3</strong><span data-i18n="mediaStep3">Paste into Codex / Claude Desktop MCP settings</span></div>
                    </div>

                    <details class="media-tools">
                      <summary>
                        <span data-i18n="mediaToolsTitle">Tools</span>
                        <span class="media-tools-caret" aria-hidden="true"></span>
                      </summary>
                      <ul class="media-tool-list">
                        <li><code>grok_list_image_models</code><span data-i18n="mediaToolImgModels">List image models</span></li>
                        <li><code>grok_list_video_models</code><span data-i18n="mediaToolVidModels">List video models</span></li>
                        <li><code>grok_image_generate</code><span data-i18n="mediaToolImgGen">Text → image</span></li>
                        <li><code>grok_image_edit</code><span data-i18n="mediaToolImgEdit">Edit image</span></li>
                        <li><code>grok_video_generate</code><span data-i18n="mediaToolVidGen">Text/image → video</span></li>
                        <li><code>grok_video_edit</code><span data-i18n="mediaToolVidEdit">Edit video</span></li>
                        <li><code>grok_video_extend</code><span data-i18n="mediaToolVidExt">Extend video</span></li>
                        <li><code>grok_video_status</code><span data-i18n="mediaToolVidStatus">Poll job</span></li>
                        <li><code>grok_list_voices</code><span data-i18n="mediaToolVoices">List TTS voices</span></li>
                        <li><code>grok_list_custom_voices</code><span data-i18n="mediaToolCustomVoices">List custom voices</span></li>
                        <li><code>grok_tts</code><span data-i18n="mediaToolTts">Text → speech</span></li>
                        <li><code>grok_voice_create_client_secret</code><span data-i18n="mediaToolVoiceSecret">Realtime client secret</span></li>
                      </ul>
                    </details>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
`;
}

export const mediaI18nZh = {
  navMedia:"媒体",
  subMedia:"Imagine 图片 / 视频 / 语音 · MCP 配置",
  qaMedia:"在线生成图片与视频",
  mediaKicker:"Imagine 工作室",
  mediaTitle:"媒体",
  mediaSub:"用 SuperGrok 池生成与编辑图片/视频，MCP 也可调用 TTS 配音。选择密钥、写提示词，直接产出素材。",
  mediaCostHint:"会消耗 SuperGrok 额度",
  mediaMode:"模式",
  mediaStudioKey:"工作室密钥",
  mediaModeImage:"生图",
  mediaModeImageEdit:"改图",
  mediaModeVideo:"生视频",
  mediaModeVideoEdit:"改视频",
  mediaModeExtend:"续写",
  mediaModeStatus:"查询",
  mediaPrompt:"提示词",
  mediaPromptPh:"雨夜霓虹巷，35mm 胶片静帧，电影感",
  mediaPromptHelp:"描述主体、光影、镜头与氛围。AI 润色会流式写入提示词框，可填可选要求。",
  mediaAiPrompt:"AI 润色",
  mediaAiInstruction:"润色要求（可选）",
  mediaAiInstructionPh:"例如：更电影感、保持中文、加雨夜霓虹",
  mediaAiStreaming:"流式润色中…",
  mediaModel:"模型",
  mediaAspect:"比例",
  mediaDuration:"时长（秒）",
  mediaResolution:"分辨率",
  mediaImageUrl:"源图片",
  mediaImageUrlPh:"https://... 或 data:image/...",
  mediaImageDrop:"点击上传，或在下方粘贴 URL",
  mediaPickImage:"上传图片",
  mediaVideoUrl:"源视频 URL",
  mediaVideoUrlPh:"https://...",
  mediaAdvanced:"高级选项",
  mediaCount:"数量",
  mediaFormat:"返回格式",
  mediaAccountPin:"固定账号 id",
  mediaAccountPinPh:"x-account-id",
  mediaRun:"开始生成",
  mediaClear:"清空",
  mediaResult:"结果",
  mediaEmptyTitle:"准备就绪",
  mediaEmpty:"选择模式、填写提示词，然后生成。",
  mediaMcpTitle:"MCP 配置",
  mediaMcpBadge:"Agents",
  mediaMcpSub:"远程 MCP：复制下方配置即可，无需拉代码或本地启动进程。",
  mediaMcpKey:"密钥",
  mediaMcpConfig:"客户端配置",
  mediaToolsTitle:"工具列表",
  mediaToolImgModels:"图片模型列表",
  mediaToolVidModels:"视频模型列表",
  mediaToolImgGen:"文生图",
  mediaToolImgEdit:"图编辑",
  mediaToolVidGen:"文/图生视频",
  mediaToolVidEdit:"视频编辑",
  mediaToolVidExt:"视频续写",
  mediaToolVidStatus:"任务查询",
  mediaToolVoices:"TTS 音色列表",
  mediaToolCustomVoices:"自定义音色",
  mediaToolTts:"文本转语音",
  mediaToolVoiceSecret:"临时密钥",
  mediaStep1:"创建或选择一个密钥",
  mediaStep2:"复制远程 MCP 配置",
  mediaStep3:"粘贴到 Codex / Claude Desktop 的 MCP 设置",
  mediaRunning:"生成中…",
  mediaPolling:"自动轮询中…",
  mediaProgressTitle:"视频任务进行中",
  mediaProgressDoneTitle:"视频已生成",
  mediaProgressFailTitle:"视频生成失败",
  mediaRequestIdLabel:"Request ID",
  mediaCopyId:"复制 ID",
  mediaProgressQueued:"排队",
  mediaProgressProcessing:"生成中",
  mediaProgressFinalizing:"收尾",
  mediaProgressComplete:"完成",
  mediaProgressFailed:"失败",
  mediaProgressPoll:(n: number | string)=>"第 "+n+" 次查询",
  mediaProgressEta:"自动轮询更新，无需手动查询",
  mediaAiRunning:"AI 润色中…",
  mediaAiDone:"润色完成",
  mediaDone:"生成完成",
  mediaFailed:"失败",
  mediaNeedPrompt:"请先填写提示词",
  mediaNeedImage:"请上传源图片或填写 URL",
  mediaNeedVideo:"请提供源视频 URL",
  mediaNeedKey:"请先选择密钥",
  mediaNoKeySecret:"旧密钥无法回看全文，请新建一个",
  mediaLegacyTitle:"旧密钥需要完整内容",
  mediaLegacySub:"这条密钥没有落库完整明文。可粘贴完整密钥解锁，或快速生成一条同配置新密钥。",
  mediaLegacySelected:"当前选中",
  mediaLegacyPaste:"完整密钥",
  mediaLegacyPastePh:"gk_...",
  mediaLegacyHint:"粘贴原始完整密钥后，可查看/复制并用于媒体与 MCP。",
  mediaLegacyCreate:"快速生成新密钥",
  mediaLegacySave:"保存完整密钥",
  mediaLegacyNeedSecret:"请输入完整密钥",
  mediaLegacySaved:"旧密钥已解锁",
  mediaLegacyCreated:"已生成新密钥并自动选中",
  mediaLegacyNameSuffix:" Media",
  mediaCopied:"已复制",
  mediaLbZoomIn:"放大",
  mediaLbZoomOut:"缩小",
  mediaLbReset:"重置",
  mediaLbClose:"关闭",
  mediaLbHint:"滚轮缩放 · 拖动查看 · Esc 关闭",
  mediaNoModels:"暂无模型",
  mediaNoKeys:"暂无密钥，请先到密钥页创建",
  mediaModelImgFast:"标准文生图，速度快，适合草稿与批量。",
  mediaModelImgQuality:"高质量文生图，细节更好，更吃额度。",
  mediaModelVid:"支持文生视频，也可上传首帧做图生视频。",
  mediaModelVid15:"仅支持图生视频（必须上传首帧图），不支持纯文生视频。",
  mediaNeedImageForModel:"该模型不支持文生视频，请先上传或填写首帧图片。",
  mediaImageRequired:"首帧图片（必填）",
  mediaImageOptional:"源图片（可选首帧）",
  mediaModelGeneric:"可用模型",
} as const;

export const mediaI18nEn = {
  navMedia:"Media",
  subMedia:"Imagine image / video / voice · MCP setup",
  qaMedia:"Generate images & videos",
  mediaKicker:"Imagine Studio",
  mediaTitle:"Media",
  mediaSub:"Generate and edit images/videos with your SuperGrok pool. Pick a key, craft a prompt, ship assets.",
  mediaCostHint:"Uses SuperGrok credits",
  mediaMode:"Mode",
  mediaStudioKey:"Studio key",
  mediaModeImage:"Image",
  mediaModeImageEdit:"Edit image",
  mediaModeVideo:"Video",
  mediaModeVideoEdit:"Edit video",
  mediaModeExtend:"Extend",
  mediaModeStatus:"Status",
  mediaPrompt:"Prompt",
  mediaPromptPh:"A cinematic neon alley in rain, 35mm film still",
  mediaPromptHelp:"Describe subject, lighting, lens and mood. AI polish streams into the prompt box; optional notes supported.",
  mediaAiPrompt:"AI polish",
  mediaAiInstruction:"Polish notes (optional)",
  mediaAiInstructionPh:"e.g. more cinematic, keep Chinese, add rain and neon",
  mediaAiStreaming:"Streaming polish…",
  mediaModel:"Model",
  mediaAspect:"Aspect",
  mediaDuration:"Duration (s)",
  mediaResolution:"Resolution",
  mediaImageUrl:"Source image",
  mediaImageUrlPh:"https://... or data:image/...",
  mediaImageDrop:"Click to upload, or paste a URL below",
  mediaPickImage:"Upload image",
  mediaVideoUrl:"Source video URL",
  mediaVideoUrlPh:"https://...",
  mediaAdvanced:"Advanced",
  mediaCount:"Count",
  mediaFormat:"Response",
  mediaAccountPin:"Pin account id",
  mediaAccountPinPh:"x-account-id",
  mediaRun:"Generate",
  mediaClear:"Clear",
  mediaResult:"Result",
  mediaEmptyTitle:"Ready when you are",
  mediaEmpty:"Choose a mode, write a prompt, and generate.",
  mediaMcpTitle:"MCP setup",
  mediaMcpBadge:"Agents",
  mediaMcpSub:"Remote MCP: copy the config below. No local checkout or process needed.",
  mediaMcpKey:"API key",
  mediaMcpConfig:"Client config",
  mediaToolsTitle:"Tools",
  mediaToolImgModels:"List image models",
  mediaToolVidModels:"List video models",
  mediaToolImgGen:"Text → image",
  mediaToolImgEdit:"Edit image",
  mediaToolVidGen:"Text/image → video",
  mediaToolVidEdit:"Edit video",
  mediaToolVidExt:"Extend video",
  mediaToolVidStatus:"Poll job",
  mediaToolVoices:"List TTS voices",
  mediaToolCustomVoices:"List custom voices",
  mediaToolTts:"Text → speech",
  mediaToolVoiceSecret:"Client secret",
  mediaStep1:"Create or pick an API key",
  mediaStep2:"Copy the remote MCP config",
  mediaStep3:"Paste into Codex / Claude Desktop MCP settings",
  mediaRunning:"Generating…",
  mediaPolling:"Auto-polling…",
  mediaProgressTitle:"Video job in progress",
  mediaProgressDoneTitle:"Video ready",
  mediaProgressFailTitle:"Video generation failed",
  mediaRequestIdLabel:"Request ID",
  mediaCopyId:"Copy ID",
  mediaProgressQueued:"Queued",
  mediaProgressProcessing:"Generating",
  mediaProgressFinalizing:"Finalizing",
  mediaProgressComplete:"Done",
  mediaProgressFailed:"Failed",
  mediaProgressPoll:(n: number | string)=>"Poll #"+n,
  mediaProgressEta:"Auto-polling — no manual status checks",
  mediaAiRunning:"Polishing prompt…",
  mediaAiDone:"Prompt polished",
  mediaDone:"Generated",
  mediaFailed:"Failed",
  mediaNeedPrompt:"Enter a prompt first",
  mediaNeedImage:"Upload a source image or paste a URL",
  mediaNeedVideo:"Provide source video URL",
  mediaNeedKey:"Select an API key first",
  mediaNoKeySecret:"Legacy key cannot be revealed — create a new one",
  mediaLegacyTitle:"Legacy key needs full secret",
  mediaLegacySub:"This key has no stored full secret. Paste the full key to unlock it, or create a new key with the same settings.",
  mediaLegacySelected:"Selected key",
  mediaLegacyPaste:"Full API key",
  mediaLegacyPastePh:"gk_...",
  mediaLegacyHint:"Paste the original full key to enable view/copy and media usage.",
  mediaLegacyCreate:"Create new key",
  mediaLegacySave:"Save full key",
  mediaLegacyNeedSecret:"Enter the full API key",
  mediaLegacySaved:"Legacy key unlocked",
  mediaLegacyCreated:"New key created and selected",
  mediaLegacyNameSuffix:" Media",
  mediaCopied:"Copied",
  mediaLbZoomIn:"Zoom in",
  mediaLbZoomOut:"Zoom out",
  mediaLbReset:"Reset",
  mediaLbClose:"Close",
  mediaLbHint:"Scroll to zoom · drag to pan · Esc to close",
  mediaNoModels:"No models",
  mediaNoKeys:"No keys yet — create one on Keys page",
  mediaModelImgFast:"Standard image generation. Fast drafts and volume.",
  mediaModelImgQuality:"Higher-fidelity image generation. More detail, more credits.",
  mediaModelVid:"Text-to-video, or image-to-video with a first frame.",
  mediaModelVid15:"Image-to-video only (first-frame image required). Text-to-video not supported.",
  mediaNeedImageForModel:"This model does not support text-to-video. Upload a first-frame image first.",
  mediaImageRequired:"First-frame image (required)",
  mediaImageOptional:"Source image (optional first frame)",
  mediaModelGeneric:"Available model",
} as const;

/** Inline browser JS injected into app-page. Uses: $, t, toast, headers, esc, enhanceSelect, allKeys, apiKeysPath */
export const mediaClientJs = String.raw`
    let mediaMode = "image";
    let mediaImageModels = [];
    let mediaVideoModels = [];
    let mediaBusy = false;
    let mediaPollTimer = null;
    let mediaInited = false;
    let mediaKeys = [];

    function mediaBaseUrl() {
      return location.origin.replace(/\/+$/, "");
    }

    function mediaKeySelectId(which) {
      return which === "mcp" ? "mediaMcpKey" : "mediaStudioKey";
    }

    function mediaSelectedKeyId(which) {
      const sel = $(mediaKeySelectId(which));
      return ((sel && sel.value) || "").trim();
    }

    function mediaSelectedKey(which) {
      const keyId = mediaSelectedKeyId(which);
      if (!keyId) return null;
      let k = (mediaKeys || []).find((x) => x && x.id === keyId) || null;
      if (!k && typeof allKeys !== "undefined" && Array.isArray(allKeys)) {
        k = allKeys.find((x) => x && x.id === keyId) || null;
      }
      if (!k) {
        const sel = $(mediaKeySelectId(which));
        const opt = sel && sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null;
        k = {
          id: keyId,
          alias: opt ? String(opt.textContent || "").split(" · ")[0] : keyId,
          keyPrefix: opt ? String(opt.textContent || "") : keyId,
          key: null,
        };
      }
      return k;
    }

    function mediaKeySecret(which) {
      const k = mediaSelectedKey(which);
      if (!k) return "";
      return String(k.key || k.secret || "").trim();
    }

    function mediaHasKeySelection(which) {
      return Boolean(mediaSelectedKeyId(which));
    }

    function mediaAuthHeaders(json, opts) {
      const secret = mediaKeySecret("studio");
      const h = {};
      if (json) h["Content-Type"] = "application/json";
      if (secret) h.Authorization = "Bearer " + secret;
      else Object.assign(h, headers());
      // Help logs identify Media Studio traffic
      h["x-title"] = "Media Studio";
      const pin = ($("mediaAccountPin") && $("mediaAccountPin").value || "").trim();
      const sticky = opts && opts.accountId ? String(opts.accountId).trim() : "";
      const acc = pin || sticky || mediaLastAccountId || "";
      if (acc) h["x-account-id"] = acc;
      return h;
    }

    function rememberMediaAccount(headersObj) {
      const id = headersObj && (headersObj["x-account-id"] || headersObj["x-account-id".toLowerCase()]);
      if (id) mediaLastAccountId = String(id).trim();
      return mediaLastAccountId;
    }

    function mediaPath(sessionPath, publicPath) {
      // Prefer public /v1 when full secret is available; otherwise use session console APIs.
      return mediaKeySecret("studio") ? publicPath : sessionPath;
    }

    function setMediaStatus(text, kind) {
      const el = $("mediaStatusText");
      if (!el) return;
      const val = text == null ? "" : String(text).trim();
      const idle = !val || val === "–" || val === "-";
      if (idle) {
        el.hidden = true;
        el.textContent = "";
        el.className = "media-status mono";
        return;
      }
      el.hidden = false;
      el.textContent = val;
      el.className = "media-status mono"
        + (kind === "err" ? " err" : kind === "ok" ? " ok" : kind === "loading" ? " loading" : "");
    }

    function setMediaAiLoading(on) {
      const btn = $("btnMediaAiPrompt");
      if (!btn) return;
      btn.disabled = !!on;
      btn.classList.toggle("is-loading", !!on);
      btn.setAttribute("aria-busy", on ? "true" : "false");
      if (on) {
        if (!btn.dataset.label) btn.dataset.label = btn.textContent || "";
        btn.innerHTML = '<span class="media-inline-spin" aria-hidden="true"></span><span>' + esc(t("mediaAiRunning")) + "</span>";
      } else {
        btn.textContent = btn.dataset.label || t("mediaAiPrompt");
        delete btn.dataset.label;
      }
    }

    function showMediaResultPanel(on) {
      const panel = $("mediaResultPanel");
      const body = $("mediaBody");
      if (panel) {
        panel.hidden = !on;
        panel.style.display = on ? "" : "none";
      }
      if (body) body.classList.toggle("has-result", !!on);
    }

    function mediaModelDesc(id) {
      const x = String(id || "");
      if (x.includes("image-quality")) return t("mediaModelImgQuality");
      if (x.includes("image")) return t("mediaModelImgFast");
      if (x.includes("video-1.5") || x.includes("video_1.5")) return t("mediaModelVid15");
      if (x.includes("video")) return t("mediaModelVid");
      return t("mediaModelGeneric");
    }

    function mediaModelRequiresImage(id) {
      const x = String(id || "").toLowerCase();
      // grok-imagine-video-1.5 is I2V only (no pure text-to-video)
      return x.includes("video-1.5") || x.includes("video_1.5");
    }

    function mediaSelectedModelId() {
      return (($("mediaModel") && $("mediaModel").value) || "").trim();
    }

    function updateMediaImageFieldLabel() {
      const label = document.querySelector("#mediaImageUrlField > label");
      if (!label) return;
      const need = mediaMode === "image_edit" || (mediaMode === "video" && mediaModelRequiresImage(mediaSelectedModelId()));
      label.textContent = need ? t("mediaImageRequired") : t("mediaImageOptional");
      label.setAttribute("data-i18n", need ? "mediaImageRequired" : "mediaImageOptional");
    }

    function refreshMediaSelect(sel) {
      if (!sel) return;
      enhanceSelect(sel);
      if (sel.parentElement && sel.parentElement._cselectRefresh) sel.parentElement._cselectRefresh();
    }

    function paintMediaModeOptions() {
      const sel = $("mediaModeSelect");
      if (!sel) return;
      const opts = [
        ["image", "mediaModeImage"],
        ["image_edit", "mediaModeImageEdit"],
        ["video", "mediaModeVideo"],
        ["video_edit", "mediaModeVideoEdit"],
        ["video_extend", "mediaModeExtend"],
      ];
      const prev = sel.value || mediaMode;
      sel.innerHTML = opts.map(([v, k]) => '<option value="' + v + '">' + esc(t(k)) + "</option>").join("");
      sel.value = prev;
      mediaMode = sel.value || "image";
      refreshMediaSelect(sel);
    }

    function mediaKeyUsable(k) {
      return !!(k && k.enabled !== false && !k.expired && (k.key || k.secret));
    }

    function mediaPreferredKeyId(keys, prev) {
      if (prev && keys.some((k) => k.id === prev && mediaKeyUsable(k))) return prev;
      const usable = keys.find((k) => mediaKeyUsable(k));
      if (usable) return usable.id;
      if (prev && keys.some((k) => k.id === prev)) return prev;
      return keys[0] ? keys[0].id : "";
    }

    function paintMediaKeySelects() {
      const keys = (mediaKeys || []).filter((k) => k && k.enabled !== false && !k.expired);
      const fill = (selId) => {
        const sel = $(selId);
        if (!sel) return;
        const prev = sel.value;
        if (!keys.length) {
          sel.innerHTML = '<option value="">' + esc(t("mediaNoKeys")) + "</option>";
          sel.value = "";
        } else {
          sel.innerHTML = keys.map((k) => {
            const usable = mediaKeyUsable(k);
            const label = (k.alias || "key") + " · " + (k.keyPrefix || k.id) + (usable ? "" : " · legacy");
            return '<option value="' + esc(k.id) + '">' + esc(label) + "</option>";
          }).join("");
          const next = mediaPreferredKeyId(keys, prev);
          sel.value = next;
          const idx = Array.from(sel.options).findIndex((o) => o.value === next);
          if (idx >= 0) sel.selectedIndex = idx;
        }
        refreshMediaSelect(sel);
      };
      fill("mediaStudioKey");
      fill("mediaMcpKey");
      paintMediaMcpConfig();
    }

    function mediaHighlightJson(obj) {
      const json = JSON.stringify(obj, null, 2);
      const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      let out = "";
      let i = 0;
      const isDigit = (c) => c >= "0" && c <= "9";
      while (i < json.length) {
        const ch = json[i];
        if (ch === '"') {
          let j = i + 1;
          let escaped = false;
          while (j < json.length) {
            const c = json[j];
            if (escaped) escaped = false;
            else if (c === "\\") escaped = true;
            else if (c === '"') break;
            j++;
          }
          const raw = json.slice(i, Math.min(j + 1, json.length));
          let k = j + 1;
          while (k < json.length && /\s/.test(json[k])) k++;
          const isKey = json[k] === ":";
          out += '<span class="j-' + (isKey ? "key" : "str") + '">' + escHtml(raw) + "</span>";
          i = j + 1;
          continue;
        }
        if (ch === "-" || isDigit(ch)) {
          let j = i + 1;
          while (j < json.length && (isDigit(json[j]) || ".eE+-".includes(json[j]))) j++;
          out += '<span class="j-num">' + escHtml(json.slice(i, j)) + "</span>";
          i = j;
          continue;
        }
        if (json.startsWith("true", i) || json.startsWith("false", i)) {
          const word = json.startsWith("true", i) ? "true" : "false";
          out += '<span class="j-bool">' + word + "</span>";
          i += word.length;
          continue;
        }
        if (json.startsWith("null", i)) {
          out += '<span class="j-null">null</span>';
          i += 4;
          continue;
        }
        out += escHtml(ch);
        i++;
      }
      return out;
    }

    function paintMediaMcpConfig() {
      const base = mediaBaseUrl();
      const k = mediaSelectedKey("mcp");
      const secret = mediaKeySecret("mcp");
      const keyValue = secret || (k && (k.keyPrefix || k.alias)) || "gk_xxx";
      const cfg = {
        mcpServers: {
          "grok-api": {
            url: base + "/mcp",
            headers: {
              Authorization: "Bearer " + keyValue
            }
          }
        }
      };
      const el = $("mediaMcpConfig");
      if (el) {
        el.dataset.raw = JSON.stringify(cfg, null, 2);
        el.innerHTML = mediaHighlightJson(cfg);
      }
    }

    function mediaModeMeta(mode) {
      const m = mode || mediaMode;
      return {
        isImage: m === "image" || m === "image_edit",
        isVideo: m === "video" || m === "video_edit" || m === "video_extend",
        needsImage: m === "image_edit" || m === "video",
        needsVideo: m === "video_edit" || m === "video_extend",
      };
    }

    function applyMediaModeUI() {
      if ($("mediaModeSelect")) {
        if ($("mediaModeSelect").value !== mediaMode) $("mediaModeSelect").value = mediaMode;
        refreshMediaSelect($("mediaModeSelect"));
      }
      const meta = mediaModeMeta();
      const show = (id, on) => {
        const el = $(id);
        if (!el) return;
        el.hidden = !on;
        el.style.display = on ? "" : "none";
      };
      show("mediaImageOpts", mediaMode === "image");
      show("mediaVideoOpts", mediaMode === "video" || mediaMode === "video_extend");
      show("mediaVideoAspectField", mediaMode === "video");
      // Always show image source for video mode (optional for base model, required for 1.5)
      show("mediaImageUrlField", mediaMode === "image_edit" || mediaMode === "video");
      show("mediaVideoUrlField", meta.needsVideo);
      show("mediaFormatField", meta.isImage);
      fillMediaModels();
      updateMediaImageFieldLabel();
    }

    function fillMediaModels() {
      const sel = $("mediaModel");
      if (!sel) return;
      const list = mediaModeMeta().isVideo
        ? (mediaVideoModels.length ? mediaVideoModels : ["grok-imagine-video", "grok-imagine-video-1.5"])
        : (mediaImageModels.length ? mediaImageModels : ["grok-imagine-image", "grok-imagine-image-quality"]);
      const prev = sel.value;
      sel.innerHTML = list.map((m) => {
        const desc = mediaModelDesc(m);
        return '<option value="' + esc(m) + '" data-desc="' + esc(desc) + '">' + esc(m) + "</option>";
      }).join("");
      if (prev && list.includes(prev)) sel.value = prev;
      refreshMediaSelect(sel);
      updateMediaImageFieldLabel();
    }

    function extractModelIds(payload) {
      if (!payload) return [];
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data) ? payload.data
        : Array.isArray(payload.models) ? payload.models
        : [];
      return arr.map((x) => {
        if (typeof x === "string") return x;
        return x && (x.id || x.model || x.name) || "";
      }).filter(Boolean);
    }

    async function ensureMediaKeys() {
      try {
        const res = await fetch(apiKeysPath(), { headers: headers() });
        const data = res.ok ? await res.json() : { keys: [] };
        mediaKeys = data.keys || [];
        if (typeof allKeys !== "undefined") allKeys = mediaKeys.slice();
      } catch (e) {
        if (Array.isArray(allKeys) && allKeys.length) mediaKeys = allKeys.slice();
        else mediaKeys = [];
        console.warn("ensureMediaKeys", e);
      }
      paintMediaKeySelects();
    }

    async function loadMediaModels() {
      try {
        const imgPath = mediaPath("/api/me/media/image-models", "/v1/image-generation-models");
        const vidPath = mediaPath("/api/me/media/video-models", "/v1/video-generation-models");
        const [ir, vr] = await Promise.all([
          fetch(imgPath, { headers: mediaAuthHeaders(false) }),
          fetch(vidPath, { headers: mediaAuthHeaders(false) }),
        ]);
        const ij = ir.ok ? await ir.json().catch(() => null) : null;
        const vj = vr.ok ? await vr.json().catch(() => null) : null;
        mediaImageModels = extractModelIds(ij);
        mediaVideoModels = extractModelIds(vj);
        const name = ir.headers.get("x-account-name") || ir.headers.get("x-account-id");
        if (name && $("mediaAccountPill")) $("mediaAccountPill").textContent = name;
      } catch (e) {
        console.warn("loadMediaModels", e);
      }
      fillMediaModels();
    }

    function clearMediaResult() {
      if (mediaPollTimer) { clearTimeout(mediaPollTimer); mediaPollTimer = null; }
      mediaPollAttempt = 0;
      mediaLastProgressPct = 0;
      if ($("mediaResult")) $("mediaResult").innerHTML = "";
      if ($("mediaResultMeta")) $("mediaResultMeta").textContent = "–";
      setMediaRequestId("");
      setMediaStatus("–");
      showMediaResultPanel(false);
    }

    function mediaCostText(body) {
      try {
        const ticks = body && body.usage && body.usage.cost_in_usd_ticks;
        if (ticks == null) return "";
        const usd = Number(ticks) / 1e10;
        if (!Number.isFinite(usd)) return "cost ticks " + ticks;
        return "~$" + usd.toFixed(4);
      } catch { return ""; }
    }

    function updateMediaImagePreview(url) {
      const box = $("mediaImagePreview");
      if (!box) return;
      const u = String(url || "").trim();
      if (u && (u.startsWith("http") || u.startsWith("data:image"))) {
        box.innerHTML = '<img src="' + esc(u) + '" alt="" />';
      } else {
        box.innerHTML = "<span>" + esc(t("mediaImageDrop")) + "</span>";
      }
    }


    let mediaLastRequestId = "";
    let mediaPollAttempt = 0;
    let mediaLastAccountId = "";
    let mediaLastProgressPct = 0;

    function setMediaRequestId(id) {
      const next = id ? String(id) : "";
      if (next && next !== mediaLastRequestId) mediaLastProgressPct = 0;
      mediaLastRequestId = next;
      const bar = $("mediaResultIdBar");
      const el = $("mediaResultRequestId");
      if (el) el.textContent = mediaLastRequestId || "–";
      if (bar) {
        bar.hidden = !mediaLastRequestId;
        bar.style.display = mediaLastRequestId ? "" : "none";
      }
    }

    function normalizeApiProgress(apiProgress) {
      if (apiProgress == null || apiProgress === "") return null;
      const p = Number(apiProgress);
      if (!Number.isFinite(p) || p < 0) return null;
      // API progress is percent numerator: 1 => 1%, 37 => 37%, 100 => 100%.
      return Math.max(0, Math.min(100, Math.round(p)));
    }

    function mediaProgressCardHtml(opts) {
      const reqId = String(opts.requestId || mediaLastRequestId || "");
      const failed = !!opts.failed;
      const statusRaw = String(opts.status || "").trim();
      const apiPct = normalizeApiProgress(opts.apiProgress);
      let pct = apiPct;
      if (failed && pct == null) pct = mediaLastProgressPct || 0;
      if (!failed && pct != null) {
        // Only increase when API gives a number; never invent values.
        if (pct < mediaLastProgressPct) pct = mediaLastProgressPct;
        mediaLastProgressPct = pct;
      }
      const hasPct = pct != null;
      const statusText = statusRaw || (failed ? "failed" : "pending");
      const title = failed ? t("mediaProgressFailTitle") : t("mediaProgressTitle");
      const badge = failed ? t("mediaProgressFailed") : statusText;
      return '' +
        '<div class="media-progress-card is-' + (failed ? "failed" : "running") + '" data-media-progress="1">' +
          '<div class="media-progress-top">' +
            '<div class="media-progress-copy">' +
              '<div class="media-progress-kicker">VIDEO JOB</div>' +
              '<div class="media-progress-title">' + esc(title) + "</div>" +
              '<div class="media-progress-sub">' + esc(t("mediaProgressEta")) + "</div>" +
            "</div>" +
            '<span class="media-progress-badge">' + esc(badge) + "</span>" +
          "</div>" +
          '<div class="media-progress-idrow">' +
            '<span class="media-progress-id-label">' + esc(t("mediaRequestIdLabel")) + "</span>" +
            '<code class="mono media-progress-id">' + esc(reqId || "–") + "</code>" +
            (reqId ? ('<button type="button" class="btn btn-secondary btn-sm" data-copy-request-id="' + esc(reqId) + '">' + esc(t("mediaCopyId")) + "</button>") : "") +
          "</div>" +
          (hasPct
            ? ('<div class="media-progress-track" aria-hidden="true"><div class="media-progress-fill" style="width:' + pct + '%"></div></div>' +
               '<div class="media-progress-meta"><span class="mono">' + pct + "%</span>" +
               (statusRaw ? ('<span class="pill soft">' + esc(statusRaw) + "</span>") : "") +
               "</div>")
            : ('<div class="media-progress-track is-indeterminate" aria-hidden="true"><div class="media-progress-fill"></div></div>' +
               '<div class="media-progress-meta">' +
               (statusRaw ? ('<span class="pill soft">' + esc(statusRaw) + "</span>") : ('<span class="mono">' + esc(t("mediaPolling")) + "</span>")) +
               "</div>")
          ) +
        "</div>";
    }

    function renderMediaPayload(body, headersObj, opts) {
      const box = $("mediaResult");
      if (!box) return;
      showMediaResultPanel(true);
      const acc = (headersObj && (headersObj["x-account-name"] || headersObj["x-account-id"])) || "";
      if (acc && $("mediaAccountPill")) $("mediaAccountPill").textContent = acc;
      const cost = mediaCostText(body);
      if ($("mediaResultMeta")) $("mediaResultMeta").textContent = [acc, cost].filter(Boolean).join(" · ") || "–";

      const imgs = [];
      const vids = [];
      const pushUrl = (u, kind) => {
        if (!u || typeof u !== "string") return;
        if (kind === "video" || /\.mp4(\?|$)/i.test(u) || u.includes("/video")) vids.push(u);
        else imgs.push(u);
      };

      if (body && Array.isArray(body.data)) {
        for (const item of body.data) {
          if (!item) continue;
          if (item.url) pushUrl(item.url, item.mime_type && String(item.mime_type).startsWith("video") ? "video" : "image");
          if (item.b64_json) imgs.push("data:image/png;base64," + item.b64_json);
          if (item.video && item.video.url) pushUrl(item.video.url, "video");
          if (item.image && item.image.url) pushUrl(item.image.url, "image");
        }
      }
      if (body && body.url) pushUrl(body.url, mediaModeMeta().isVideo ? "video" : "image");
      if (body && body.video && body.video.url) pushUrl(body.video.url, "video");
      if (body && body.image && body.image.url) pushUrl(body.image.url, "image");
      if (body && body.result && body.result.url) pushUrl(body.result.url, mediaModeMeta().isVideo ? "video" : "image");

      const reqIdRaw = body && (body.request_id || body.id || body.job_id);
      const status = body && (body.status || body.state);
      const apiProgress = body && (body.progress != null ? body.progress : (body.percent != null ? body.percent : body.percentage));
      const opt = opts || {};
      const attempt = opt.attempt != null ? Number(opt.attempt) : mediaPollAttempt;
      const effectiveReqId = String(reqIdRaw || opt.requestId || mediaLastRequestId || "");
      if (effectiveReqId) setMediaRequestId(effectiveReqId);

      const hasMedia = !!(imgs.length || vids.length);
      const st = String(status || "").toLowerCase();
      const failed = !!opt.failed || ["failed", "error", "cancelled", "canceled"].includes(st);
      const terminal = !!opt.terminal || failed || hasMedia || ["succeeded", "success", "completed", "done"].includes(st);
      // In-flight video job only. Hide progress once media is ready.
      const showProgress = !hasMedia && (mediaModeMeta().isVideo || !!opt.forceProgress || !!effectiveReqId || apiProgress != null || !!status) && (!terminal || failed);

      let html = "";
      if (showProgress) {
        html += mediaProgressCardHtml({
          requestId: effectiveReqId,
          failed: failed,
          status: status || "",
          apiProgress: apiProgress,
        });
      }

      if (imgs.length) {
        const single = imgs.length === 1 && !vids.length;
        html += '<div class="media-gallery' + (single ? " is-single" : "") + '">' + imgs.map((u, idx) =>
          '<button type="button" class="media-thumb' + (single ? " is-hero" : "") + '" data-media-preview="' + esc(u) + '" data-media-preview-index="' + idx + '" aria-label="Preview image">' +
          '<img src="' + esc(u) + '" alt="" /></button>'
        ).join("") + "</div>";
      }
      if (vids.length) {
        const single = vids.length === 1 && !imgs.length;
        html += '<div class="media-videos' + (single ? " is-single" : "") + '">' + vids.map((u) =>
          '<video class="media-video' + (single ? " is-hero" : "") + '" controls src="' + esc(u) + '"></video>'
        ).join("") + "</div>";
      }
      // Only dump raw JSON for non-progress, non-media responses
      if (!imgs.length && !vids.length && !showProgress) {
        html += '<pre class="media-json">' + esc(JSON.stringify(body, null, 2)) + "</pre>";
      }
      box.innerHTML = html;
    }

    async function mediaFetch(path, opt) {
      const res = await fetch(path, opt);
      const headersObj = {
        "x-account-id": res.headers.get("x-account-id") || "",
        "x-account-name": res.headers.get("x-account-name") || "",
      };
      const text = await res.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
      if (!res.ok) {
        const msg = body && body.error && body.error.message
          ? body.error.message
          : (typeof body === "string" ? body : (text || ("HTTP " + res.status)));
        const err = new Error(msg);
        err.status = res.status;
        err.body = body;
        err.headersObj = headersObj;
        throw err;
      }
      return { body, headersObj, status: res.status };
    }

    function isTerminalVideo(body) {
      if (!body) return false;
      const st = String(body.status || body.state || "").toLowerCase();
      if (["pending", "queued", "processing", "running", "in_progress", "in-progress", "submitted", "created", "started"].includes(st)) return false;
      if (["succeeded", "success", "completed", "done", "failed", "error", "cancelled", "canceled"].includes(st)) return true;
      // media ready
      if (body.url || (body.video && body.video.url) || (body.data && body.data.some && body.data.some((x) => x && x.url))) return true;
      // progress-only payload is not terminal
      if (body.progress != null || body.percent != null || body.percentage != null) return false;
      return false;
    }

    async function pollMediaVideo(requestId, attempt) {
      const n = attempt || 0;
      mediaPollAttempt = n;
      setMediaRequestId(requestId);
      setMediaStatus(t("mediaPolling"), "loading");
      try {
        const path = mediaPath("/api/me/media/videos/" + encodeURIComponent(requestId), "/v1/videos/" + encodeURIComponent(requestId));
        const r = await mediaFetch(path, { headers: mediaAuthHeaders(false, { accountId: mediaLastAccountId }) });
        rememberMediaAccount(r.headersObj);
        const terminal = isTerminalVideo(r.body);
        const st = String((r.body && (r.body.status || r.body.state)) || "").toLowerCase();
        const failed = ["failed", "error", "cancelled", "canceled"].includes(st);
        renderMediaPayload(r.body || {}, r.headersObj, {
          attempt: n,
          terminal: terminal,
          failed: failed,
          forceProgress: true,
          requestId: requestId,
        });
        if (terminal) {
          setMediaStatus(failed ? t("mediaFailed") : t("mediaDone"), failed ? "err" : "ok");
          mediaBusy = false;
          if ($("btnMediaRun")) $("btnMediaRun").disabled = false;
          return;
        }
        mediaPollTimer = setTimeout(() => pollMediaVideo(requestId, n + 1), Math.min(8000, 1500 + n * 500));
      } catch (e) {
        if ($("mediaResult")) {
          $("mediaResult").innerHTML = mediaProgressCardHtml({
            requestId: requestId,
            failed: true,
            status: e.message || "error",
            apiProgress: mediaLastProgressPct || null,
          });
        }
        setMediaStatus(e.message || t("mediaFailed"), "err");
        toast(e.message || t("mediaFailed"), "err");
        mediaBusy = false;
        if ($("btnMediaRun")) $("btnMediaRun").disabled = false;
      }
    }


    let mediaLegacyPendingAction = null; // "run" | "ai" | null
    let mediaLegacyKeyId = "";

    function closeMediaLegacyKeyModal() {
      mediaLegacyPendingAction = null;
      mediaLegacyKeyId = "";
      if ($("mediaLegacyKeyModal")) $("mediaLegacyKeyModal").classList.remove("show");
      if ($("mediaLegacySecret")) $("mediaLegacySecret").value = "";
    }

    function openMediaLegacyKeyModal(action, which) {
      const source = which === "mcp" ? "mcp" : "studio";
      const k = mediaSelectedKey(source);
      if (!k) {
        toast(t("mediaNeedKey"), "err");
        return;
      }
      mediaLegacyPendingAction = action || null;
      mediaLegacyKeyId = k.id;
      if ($("mediaLegacyKeyMeta")) {
        $("mediaLegacyKeyMeta").textContent = (k.alias || "key") + " · " + (k.keyPrefix || k.id);
      }
      if ($("mediaLegacySecret")) $("mediaLegacySecret").value = "";
      if ($("mediaLegacyKeyModal")) $("mediaLegacyKeyModal").classList.add("show");
      setTimeout(() => { try { $("mediaLegacySecret") && $("mediaLegacySecret").focus(); } catch {} }, 0);
    }

    async function saveMediaLegacySecret() {
      const secret = (($("mediaLegacySecret") && $("mediaLegacySecret").value) || "").trim();
      if (!secret) return toast(t("mediaLegacyNeedSecret"), "err");
      if (!mediaLegacyKeyId) return toast(t("mediaNeedKey"), "err");
      try {
        const res = await fetch(apiKeysPath() + "/" + encodeURIComponent(mediaLegacyKeyId), {
          method: "PATCH",
          headers: jsonHeaders(),
          body: JSON.stringify({ secret }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText || "HTTP " + res.status);
        await ensureMediaKeys();
        // reselect this key
        if ($("mediaStudioKey")) {
          $("mediaStudioKey").value = mediaLegacyKeyId;
          refreshMediaSelect($("mediaStudioKey"));
        }
        if ($("mediaMcpKey")) {
          $("mediaMcpKey").value = mediaLegacyKeyId;
          refreshMediaSelect($("mediaMcpKey"));
        }
        paintMediaMcpConfig();
        const action = mediaLegacyPendingAction;
        closeMediaLegacyKeyModal();
        toast(t("mediaLegacySaved"), "ok");
        if (action === "run") runMedia({ skipLegacyCheck: true });
        else if (action === "ai") runMediaAiPrompt({ skipLegacyCheck: true });
        else if (action === "copy_mcp") copyMediaMcpConfig({ skipLegacyCheck: true });
      } catch (e) {
        toast(e.message || t("mediaFailed"), "err");
      }
    }

    async function createMediaKeyFromLegacy() {
      const k = mediaSelectedKey("mcp") || mediaSelectedKey("studio") || (mediaKeys || []).find((x) => x && x.id === mediaLegacyKeyId);
      if (!k) return toast(t("mediaNeedKey"), "err");
      const baseName = String(k.alias || "key").replace(/\s+Media$/i, "");
      const alias = baseName + (t("mediaLegacyNameSuffix") || " Media");
      let expiresInDays = null;
      if (k.expiresAt) {
        const days = Math.ceil((Number(k.expiresAt) - Date.now()) / 86400000);
        if (Number.isFinite(days) && days > 0) expiresInDays = days;
      }
      try {
        const body = { alias, note: k.note || "" };
        if (expiresInDays != null) body.expiresInDays = expiresInDays;
        const res = await fetch(apiKeysPath(), {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText || "HTTP " + res.status);
        await ensureMediaKeys();
        const newId = data.record && data.record.id;
        if (newId) {
          if ($("mediaStudioKey")) {
            $("mediaStudioKey").value = newId;
            refreshMediaSelect($("mediaStudioKey"));
          }
          if ($("mediaMcpKey")) {
            $("mediaMcpKey").value = newId;
            refreshMediaSelect($("mediaMcpKey"));
          }
        }
        paintMediaMcpConfig();
        const action = mediaLegacyPendingAction;
        closeMediaLegacyKeyModal();
        toast(t("mediaLegacyCreated"), "ok");
        if (action === "run") runMedia({ skipLegacyCheck: true });
        else if (action === "ai") runMediaAiPrompt({ skipLegacyCheck: true });
        else if (action === "copy_mcp") copyMediaMcpConfig({ skipLegacyCheck: true });
      } catch (e) {
        toast(e.message || t("mediaFailed"), "err");
      }
    }

    function ensureStudioKeyReady(action) {
      if (!mediaHasKeySelection("studio")) {
        toast(t("mediaNeedKey"), "err");
        return false;
      }
      if (!mediaKeySecret("studio")) {
        openMediaLegacyKeyModal(action, "studio");
        return false;
      }
      return true;
    }

    function ensureMcpKeyReady(action) {
      if (!mediaHasKeySelection("mcp")) {
        toast(t("mediaNeedKey"), "err");
        return false;
      }
      if (!mediaKeySecret("mcp")) {
        openMediaLegacyKeyModal(action || "copy_mcp", "mcp");
        return false;
      }
      return true;
    }

    function copyMediaMcpConfig(opts) {
      if (!(opts && opts.skipLegacyCheck) && !ensureMcpKeyReady("copy_mcp")) return false;
      paintMediaMcpConfig();
      const raw = ($("mediaMcpConfig") && ($("mediaMcpConfig").dataset.raw || $("mediaMcpConfig").textContent)) || "";
      // Guard again: never copy placeholder prefix-only values.
      if (!mediaKeySecret("mcp")) {
        openMediaLegacyKeyModal("copy_mcp", "mcp");
        return false;
      }
      copyText(raw);
      return true;
    }

    async function streamMediaChatCompletion(body, onDelta) {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: mediaAuthHeaders(true),
        body: JSON.stringify(body),
      });
      const headersObj = {
        "x-account-id": res.headers.get("x-account-id") || "",
        "x-account-name": res.headers.get("x-account-name") || "",
      };
      if (!res.ok) {
        const raw = await res.text();
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = { raw: raw }; }
        const msg = parsed && parsed.error && parsed.error.message
          ? parsed.error.message
          : (raw || ("HTTP " + res.status));
        const err = new Error(msg);
        err.status = res.status;
        err.body = parsed;
        err.headersObj = headersObj;
        throw err;
      }
      rememberMediaAccount(headersObj);
      if (!res.body || !res.body.getReader) {
        const raw = await res.text();
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }
        const text = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].message
          ? String(parsed.choices[0].message.content || "").trim()
          : String(raw || "").trim();
        if (text && onDelta) onDelta(text, text);
        return text;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = String(line || "").trim();
          if (!trimmed || trimmed[0] === ":") continue;
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          let json = null;
          try { json = JSON.parse(data); } catch { continue; }
          const delta =
            json && json.choices && json.choices[0] && json.choices[0].delta
              ? (json.choices[0].delta.content || "")
              : (json && json.choices && json.choices[0] && json.choices[0].message
                ? (json.choices[0].message.content || "")
                : "");
          if (!delta) continue;
          full += String(delta);
          if (onDelta) onDelta(full, String(delta));
        }
      }
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data:")) {
          const data = trimmed.slice(5).trim();
          if (data && data !== "[DONE]") {
            try {
              const json = JSON.parse(data);
              const delta =
                json && json.choices && json.choices[0] && json.choices[0].delta
                  ? (json.choices[0].delta.content || "")
                  : "";
              if (delta) {
                full += String(delta);
                if (onDelta) onDelta(full, String(delta));
              }
            } catch {}
          }
        }
      }
      return full.trim();
    }

    async function runMediaAiPrompt(opts) {
      const prompt = (($("mediaPrompt") && $("mediaPrompt").value) || "").trim();
      if (!prompt) return toast(t("mediaNeedPrompt"), "err");
      if (!(opts && opts.skipLegacyCheck) && !ensureStudioKeyReady("ai")) return;
      const instruction = (($("mediaAiInstruction") && $("mediaAiInstruction").value) || "").trim();
      setMediaAiLoading(true);
      setMediaStatus(t("mediaAiStreaming") || t("mediaAiRunning"), "loading");
      if ($("mediaPrompt")) {
        $("mediaPrompt").value = "";
        $("mediaPrompt").classList.add("is-streaming");
      }
      try {
        let system =
          "You rewrite image/video prompts. Return only the improved prompt text, no quotes, no markdown, no explanation. Keep the original language of the user prompt unless the notes ask otherwise. Make it concrete, cinematic, and production-ready.";
        if (instruction) {
          system += " Extra rewrite notes from the user: " + instruction;
        }
        const userContent = instruction
          ? ("Original prompt:\n" + prompt + "\n\nRewrite notes:\n" + instruction)
          : prompt;
        const text = await streamMediaChatCompletion({
          model: "grok-4.5",
          temperature: 0.8,
          stream: true,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent },
          ],
        }, (full) => {
          if ($("mediaPrompt")) $("mediaPrompt").value = String(full || "").replace(/^["']|["']$/g, "");
        });
        const cleaned = String(text || "").trim().replace(/^["']|["']$/g, "");
        if (!cleaned) throw new Error(t("mediaFailed"));
        if ($("mediaPrompt")) $("mediaPrompt").value = cleaned;
        setMediaStatus(t("mediaAiDone"), "ok");
        toast(t("mediaAiDone"), "ok");
        setTimeout(() => {
          const el = $("mediaStatusText");
          if (el && el.textContent === t("mediaAiDone")) setMediaStatus("");
        }, 1800);
      } catch (e) {
        // restore original prompt if stream failed with empty box
        if ($("mediaPrompt") && !String($("mediaPrompt").value || "").trim()) {
          $("mediaPrompt").value = prompt;
        }
        setMediaStatus(e.message || t("mediaFailed"), "err");
        toast(e.message || t("mediaFailed"), "err");
      } finally {
        if ($("mediaPrompt")) $("mediaPrompt").classList.remove("is-streaming");
        setMediaAiLoading(false);
      }
    }

    async function runMedia(opts) {
      if (mediaBusy) return;
      const meta = mediaModeMeta();
      const prompt = (($("mediaPrompt") && $("mediaPrompt").value) || "").trim();
      const model = (($("mediaModel") && $("mediaModel").value) || "").trim();
      const aspect = ((mediaMode === "video"
        ? ($("mediaVideoAspect") && $("mediaVideoAspect").value)
        : ($("mediaAspect") && $("mediaAspect").value)) || "").trim();
      const duration = Number(($("mediaDuration") && $("mediaDuration").value) || 6);
      const resolution = (($("mediaResolution") && $("mediaResolution").value) || "").trim();
      const imageUrl = (($("mediaImageUrl") && $("mediaImageUrl").value) || "").trim();
      const videoUrl = (($("mediaVideoUrl") && $("mediaVideoUrl").value) || "").trim();
      const n = Math.max(1, Math.min(4, Number(($("mediaCount") && $("mediaCount").value) || 1)));
      const format = (($("mediaFormat") && $("mediaFormat").value) || "url").trim();

      if (!(opts && opts.skipLegacyCheck) && !ensureStudioKeyReady("run")) return;
      if (!prompt) return toast(t("mediaNeedPrompt"), "err");
      if (mediaMode === "image_edit" && !imageUrl) return toast(t("mediaNeedImage"), "err");
      if (mediaMode === "video" && mediaModelRequiresImage(model) && !imageUrl) {
        toast(t("mediaNeedImageForModel"), "err");
        // ensure field visible
        if ($("mediaImageUrlField")) {
          $("mediaImageUrlField").hidden = false;
          $("mediaImageUrlField").style.display = "";
        }
        updateMediaImageFieldLabel();
        return;
      }
      if (meta.needsVideo && !videoUrl) return toast(t("mediaNeedVideo"), "err");

      mediaBusy = true;
      mediaLastAccountId = "";
      if ($("btnMediaRun")) $("btnMediaRun").disabled = true;
      showMediaResultPanel(true);
      if ($("mediaResult")) $("mediaResult").innerHTML = '<div class="media-empty"><div class="media-empty-title">' + esc(t("mediaRunning")) + "</div></div>";
      setMediaStatus(t("mediaRunning"));
      try {
        let path = "";
        let body = {};
        if (mediaMode === "image") {
          path = mediaPath("/api/me/media/images/generations", "/v1/images/generations");
          body = { model: model || "grok-imagine-image", prompt, n, response_format: format };
          if (aspect && aspect !== "auto") body.aspect_ratio = aspect;
          if (resolution) body.resolution = resolution;
        } else if (mediaMode === "image_edit") {
          path = mediaPath("/api/me/media/images/edits", "/v1/images/edits");
          body = { model: model || "grok-imagine-image", prompt, image: { url: imageUrl }, response_format: format, n };
        } else if (mediaMode === "video") {
          path = mediaPath("/api/me/media/videos/generations", "/v1/videos/generations");
          body = { model: model || "grok-imagine-video", prompt, duration: duration || 6 };
          if (aspect && aspect !== "auto") body.aspect_ratio = aspect;
          if (resolution) body.resolution = resolution;
          if (imageUrl) body.image = { url: imageUrl };
        } else if (mediaMode === "video_edit") {
          path = mediaPath("/api/me/media/videos/edits", "/v1/videos/edits");
          body = { model: model || "grok-imagine-video", prompt, video: { url: videoUrl } };
        } else if (mediaMode === "video_extend") {
          path = mediaPath("/api/me/media/videos/extensions", "/v1/videos/extensions");
          body = { model: model || "grok-imagine-video", prompt, video: { url: videoUrl } };
          if (duration) body.duration = duration;
        }
        const r = await mediaFetch(path, { method: "POST", headers: mediaAuthHeaders(true), body: JSON.stringify(body) });
        rememberMediaAccount(r.headersObj);
        const rid = r.body && (r.body.request_id || r.body.id || r.body.job_id);
        if (rid) setMediaRequestId(String(rid));
        if (meta.isVideo && rid && !isTerminalVideo(r.body)) {
          mediaPollAttempt = 0;
          mediaLastProgressPct = 0;
          renderMediaPayload(Object.assign({ request_id: rid }, r.body || {}), r.headersObj, {
            attempt: 0,
            terminal: false,
            failed: false,
            forceProgress: true,
            requestId: String(rid),
          });
          setMediaStatus(t("mediaPolling"), "loading");
          pollMediaVideo(String(rid), 0);
          return;
        }
        renderMediaPayload(r.body, r.headersObj, { terminal: true, attempt: mediaPollAttempt });
        setMediaStatus(t("mediaDone"), "ok");
        mediaBusy = false;
        if ($("btnMediaRun")) $("btnMediaRun").disabled = false;
      } catch (e) {
        setMediaStatus(e.message || t("mediaFailed"), "err");
        toast(e.message || t("mediaFailed"), "err");
        if (e.body) renderMediaPayload(e.body, e.headersObj || {});
        mediaBusy = false;
        if ($("btnMediaRun")) $("btnMediaRun").disabled = false;
      }
    }

    async function copyText(text) {
      const value = String(text == null ? "" : text);
      if (!value) {
        toast(t("mediaFailed"), "err");
        return false;
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          throw new Error("clipboard_unavailable");
        }
        toast(t("mediaCopied"));
        return true;
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = value;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.top = "-9999px";
          ta.style.left = "-9999px";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          ta.setSelectionRange(0, ta.value.length);
          const ok = document.execCommand("copy");
          ta.remove();
          if (!ok) throw new Error("copy_failed");
          toast(t("mediaCopied"));
          return true;
        } catch {
          toast(t("mediaFailed"), "err");
          return false;
        }
      }
    }


    let mediaLbScale = 1;
    let mediaLbX = 0;
    let mediaLbY = 0;
    let mediaLbDragging = false;
    let mediaLbLastX = 0;
    let mediaLbLastY = 0;
    let mediaLbBound = false;
    let mediaLbUrls = [];
    let mediaLbIndex = 0;

    function mediaLbApplyTransform() {
      const img = $("mediaLightboxImg");
      if (!img) return;
      img.style.transform = "translate(" + mediaLbX + "px," + mediaLbY + "px) scale(" + mediaLbScale + ")";
    }

    function mediaLbResetView() {
      mediaLbScale = 1;
      mediaLbX = 0;
      mediaLbY = 0;
      mediaLbApplyTransform();
      if ($("mediaLbZoomReset")) $("mediaLbZoomReset").textContent = "1:1";
    }

    function mediaLbSetScale(next) {
      mediaLbScale = Math.max(0.4, Math.min(6, next));
      if ($("mediaLbZoomReset")) $("mediaLbZoomReset").textContent = Math.round(mediaLbScale * 100) + "%";
      mediaLbApplyTransform();
    }

    function closeMediaLightbox() {
      const box = $("mediaLightbox");
      if (!box) return;
      box.hidden = true;
      box.setAttribute("aria-hidden", "true");
      box.classList.remove("show");
      document.body.classList.remove("media-lb-open");
      mediaLbDragging = false;
      const img = $("mediaLightboxImg");
      if (img) img.removeAttribute("src");
    }

    function openMediaLightbox(url, urls, index) {
      const box = $("mediaLightbox");
      const img = $("mediaLightboxImg");
      if (!box || !img || !url) return;
      mediaLbUrls = Array.isArray(urls) && urls.length ? urls.slice() : [url];
      mediaLbIndex = Math.max(0, Math.min(mediaLbUrls.length - 1, Number(index) || 0));
      img.src = mediaLbUrls[mediaLbIndex] || url;
      mediaLbResetView();
      if ($("mediaLightboxHint")) $("mediaLightboxHint").textContent = t("mediaLbHint");
      if ($("mediaLbZoomIn")) $("mediaLbZoomIn").title = t("mediaLbZoomIn");
      if ($("mediaLbZoomOut")) $("mediaLbZoomOut").title = t("mediaLbZoomOut");
      if ($("mediaLbClose")) $("mediaLbClose").title = t("mediaLbClose");
      box.hidden = false;
      box.setAttribute("aria-hidden", "false");
      box.classList.add("show");
      document.body.classList.add("media-lb-open");
    }

    function bindMediaLightbox() {
      if (mediaLbBound) return;
      mediaLbBound = true;
      const box = $("mediaLightbox");
      const stage = $("mediaLightboxStage");
      const img = $("mediaLightboxImg");
      if (!box || !stage || !img) return;

      if ($("mediaLbClose")) $("mediaLbClose").onclick = () => closeMediaLightbox();
      if ($("mediaLbZoomIn")) $("mediaLbZoomIn").onclick = () => mediaLbSetScale(mediaLbScale + 0.25);
      if ($("mediaLbZoomOut")) $("mediaLbZoomOut").onclick = () => mediaLbSetScale(mediaLbScale - 0.25);
      if ($("mediaLbZoomReset")) $("mediaLbZoomReset").onclick = () => mediaLbResetView();
      box.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.getAttribute && t.getAttribute("data-lb-close") === "1") closeMediaLightbox();
      });
      document.addEventListener("keydown", (e) => {
        if (!$("mediaLightbox") || $("mediaLightbox").hidden) return;
        if (e.key === "Escape") closeMediaLightbox();
        if (e.key === "+" || e.key === "=") mediaLbSetScale(mediaLbScale + 0.25);
        if (e.key === "-" || e.key === "_") mediaLbSetScale(mediaLbScale - 0.25);
        if (e.key === "0") mediaLbResetView();
      });
      stage.addEventListener("wheel", (e) => {
        if ($("mediaLightbox").hidden) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        mediaLbSetScale(mediaLbScale + delta);
      }, { passive: false });

      const onDown = (clientX, clientY) => {
        mediaLbDragging = true;
        mediaLbLastX = clientX;
        mediaLbLastY = clientY;
        stage.classList.add("is-dragging");
      };
      const onMove = (clientX, clientY) => {
        if (!mediaLbDragging) return;
        mediaLbX += clientX - mediaLbLastX;
        mediaLbY += clientY - mediaLbLastY;
        mediaLbLastX = clientX;
        mediaLbLastY = clientY;
        mediaLbApplyTransform();
      };
      const onUp = () => {
        mediaLbDragging = false;
        stage.classList.remove("is-dragging");
      };
      stage.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onDown(e.clientX, e.clientY);
      });
      window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
      window.addEventListener("mouseup", onUp);
      stage.addEventListener("touchstart", (e) => {
        if (!e.touches || !e.touches[0]) return;
        onDown(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      stage.addEventListener("touchmove", (e) => {
        if (!e.touches || !e.touches[0]) return;
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: false });
      stage.addEventListener("touchend", onUp);
      stage.addEventListener("dblclick", () => {
        if (mediaLbScale > 1.05) mediaLbResetView();
        else mediaLbSetScale(2);
      });
    }


    function bindMediaPage() {
      if (mediaInited) return;
      mediaInited = true;
      if ($("mediaModeSelect")) {
        $("mediaModeSelect").addEventListener("change", () => {
          mediaMode = $("mediaModeSelect").value || "image";
          applyMediaModeUI();
        });
      }
      if ($("mediaModel")) {
        $("mediaModel").addEventListener("change", () => {
          updateMediaImageFieldLabel();
        });
      }
      bindMediaLightbox();
      if ($("btnMediaRun")) $("btnMediaRun").onclick = () => runMedia();
      if ($("btnMediaClear")) $("btnMediaClear").onclick = () => clearMediaResult();
      if ($("btnMediaAiPrompt")) $("btnMediaAiPrompt").onclick = () => runMediaAiPrompt();
      if ($("btnMediaCopyRequestId")) {
        $("btnMediaCopyRequestId").onclick = () => {
          if (!mediaLastRequestId) return;
          copyText(mediaLastRequestId);
        };
      }
      if ($("mediaResult")) {
        $("mediaResult").addEventListener("click", (e) => {
          const copyBtn = e.target.closest("[data-copy-request-id]");
          if (copyBtn) {
            e.preventDefault();
            copyText(copyBtn.getAttribute("data-copy-request-id") || "");
            return;
          }
          const btn = e.target.closest("[data-media-preview]");
          if (!btn) return;
          e.preventDefault();
          const url = btn.getAttribute("data-media-preview") || "";
          const idx = Number(btn.getAttribute("data-media-preview-index") || 0);
          const urls = Array.from($("mediaResult").querySelectorAll("[data-media-preview]")).map((el) => el.getAttribute("data-media-preview") || "").filter(Boolean);
          openMediaLightbox(url, urls, idx);
        });
      }
      if ($("mediaLegacyCancel")) $("mediaLegacyCancel").onclick = () => closeMediaLegacyKeyModal();
      if ($("mediaLegacySave")) $("mediaLegacySave").onclick = () => saveMediaLegacySecret();
      if ($("mediaLegacyCreate")) $("mediaLegacyCreate").onclick = () => createMediaKeyFromLegacy();
      if ($("mediaLegacyKeyModal")) {
        $("mediaLegacyKeyModal").addEventListener("click", (e) => {
          if (e.target === $("mediaLegacyKeyModal")) closeMediaLegacyKeyModal();
        });
      }
      if ($("mediaLegacySecret")) {
        $("mediaLegacySecret").addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveMediaLegacySecret();
          }
        });
      }
      if ($("btnMediaCopyCfg")) $("btnMediaCopyCfg").onclick = () => {
        copyMediaMcpConfig();
      };
      if ($("mediaStudioKey")) $("mediaStudioKey").addEventListener("change", () => loadMediaModels());
      if ($("mediaMcpKey")) $("mediaMcpKey").addEventListener("change", () => paintMediaMcpConfig());
      if ($("mediaImageUrl")) $("mediaImageUrl").addEventListener("input", () => updateMediaImagePreview($("mediaImageUrl").value));
      if ($("mediaImageFile")) {
        $("mediaImageFile").addEventListener("change", () => {
          const f = $("mediaImageFile").files && $("mediaImageFile").files[0];
          if (!f) return;
          if ($("mediaImageFileName")) $("mediaImageFileName").textContent = f.name;
          const reader = new FileReader();
          reader.onload = () => {
            const val = String(reader.result || "");
            if ($("mediaImageUrl")) $("mediaImageUrl").value = val;
            updateMediaImagePreview(val);
          };
          reader.readAsDataURL(f);
        });
      }
      ["mediaModeSelect", "mediaAspect", "mediaVideoAspect", "mediaCount", "mediaResolution", "mediaFormat"].forEach((id) => refreshMediaSelect($(id)));
      paintMediaModeOptions();
      applyMediaModeUI();
      paintMediaMcpConfig();
      showMediaResultPanel(false);
    }

    async function initMediaPage() {
      bindMediaPage();
      paintMediaModeOptions();
      await ensureMediaKeys();
      applyMediaModeUI();
      paintMediaMcpConfig();
      await loadMediaModels();
    }
`;

(() => {
  if (window.__xaiSsoPanelInstalled) return;
  window.__xaiSsoPanelInstalled = true;

  /** @type {HTMLDivElement | null} */
  let root = null;

  function ensureUi() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "xai-sso-panel-root";
    root.innerHTML = `
    <button type="button" id="xai-sso-fab" title="SSO 快登 (Ctrl+Shift+L)">SSO</button>
    <div id="xai-sso-panel" hidden>
      <div class="xai-sso-hd">
        <strong>SSO 快登</strong>
        <button type="button" id="xai-sso-close" aria-label="关闭">×</button>
      </div>
      <label class="xai-sso-lab">SSO JWT（写入 sso + sso-rw 到 .x.ai / .grok.com）</label>
      <textarea id="xai-sso-input" rows="4" placeholder="eyJ... 或 邮箱|密码|sso|时间" spellcheck="false"></textarea>
      <label class="xai-sso-lab">Cookie 名覆盖（可空，默认 sso + sso-rw）</label>
      <input id="xai-sso-cookie" type="text" placeholder="留空即可" autocomplete="off" />
      <label class="xai-sso-check">
        <input type="checkbox" id="xai-sso-no-redirect" />
        仅写入 Cookie，不跳转（方便核对 Application → Cookies）
      </label>
      <div class="xai-sso-actions">
        <button type="button" id="xai-sso-apply" class="primary">确认写入</button>
        <button type="button" id="xai-sso-diag" type="button">诊断</button>
      </div>
      <div id="xai-sso-msg" class="xai-sso-msg" hidden></div>
      <div class="xai-sso-foot">成功后默认打开 grok.com（不是登录页）</div>
    </div>
  `;
    document.documentElement.appendChild(root);

    const fab = /** @type {HTMLButtonElement} */ (root.querySelector("#xai-sso-fab"));
    const panel = /** @type {HTMLDivElement} */ (root.querySelector("#xai-sso-panel"));
    const closeBtn = root.querySelector("#xai-sso-close");
    const input = /** @type {HTMLTextAreaElement} */ (root.querySelector("#xai-sso-input"));
    const cookieInput = /** @type {HTMLInputElement} */ (root.querySelector("#xai-sso-cookie"));
    const noRedirect = /** @type {HTMLInputElement} */ (root.querySelector("#xai-sso-no-redirect"));
    const applyBtn = /** @type {HTMLButtonElement} */ (root.querySelector("#xai-sso-apply"));
    const diagBtn = /** @type {HTMLButtonElement} */ (root.querySelector("#xai-sso-diag"));
    const msg = /** @type {HTMLDivElement} */ (root.querySelector("#xai-sso-msg"));

    function showMsg(text, kind) {
      msg.hidden = !text;
      msg.textContent = text || "";
      msg.className = "xai-sso-msg" + (kind ? " " + kind : "");
    }

    function openPanel() {
      panel.hidden = false;
      fab.hidden = true;
      chrome.storage.local.get(["lastCookieName"], (r) => {
        if (r.lastCookieName && !cookieInput.value) cookieInput.value = r.lastCookieName;
      });
      setTimeout(() => input.focus(), 0);
    }

    function closePanel() {
      panel.hidden = true;
      fab.hidden = false;
      showMsg("");
    }

    fab.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);

    applyBtn.addEventListener("click", async () => {
      const sso = input.value.trim();
      if (!sso) {
        showMsg("请先粘贴 SSO", "err");
        return;
      }
      applyBtn.disabled = true;
      showMsg("清理旧 Cookie → 写入 sso / sso-rw …", "");
      try {
        const res = await chrome.runtime.sendMessage({
          type: "sso-login",
          sso,
          cookieName: cookieInput.value.trim(),
        });
        if (!res || !res.ok) {
          showMsg((res && res.error) || "写入失败", "err");
          applyBtn.disabled = false;
          return;
        }
        const parts = [
          `清理 ${res.removed || 0}`,
          `写入 ${res.set}`,
          `读回 ${(res.verified || []).length}`,
        ];
        if (res.sessionId) parts.push(`session=${res.sessionId.slice(0, 8)}…`);
        if (res.accountsOk) parts.push("accounts✓");
        if (res.grokOk) parts.push("grok✓");
        parts.push(`val=${res.valuePreview || "?"}`);

        if (noRedirect.checked) {
          showMsg(parts.join(" · ") + "（未跳转，请 F12 → Application → Cookies 核对 sso）", "ok");
          applyBtn.disabled = false;
          return;
        }

        showMsg(parts.join(" · ") + " → 打开 grok.com …", "ok");
        const target = res.redirectUrl || "https://grok.com/";
        setTimeout(() => {
          location.href = target;
        }, 350);
      } catch (e) {
        showMsg(e instanceof Error ? e.message : String(e), "err");
        applyBtn.disabled = false;
      }
    });

    diagBtn.addEventListener("click", async () => {
      showMsg("读取当前 sso / sso-rw …", "");
      try {
        const res = await chrome.runtime.sendMessage({ type: "sso-diagnose" });
        if (!res || !res.ok) {
          showMsg((res && res.error) || "诊断失败", "err");
          return;
        }
        const list = res.cookies || [];
        if (!list.length) {
          showMsg("当前浏览器里没有 sso / sso-rw Cookie", "err");
          return;
        }
        showMsg(
          list
            .map(
              (c) =>
                `${c.name}@${c.domain} httpOnly=${c.httpOnly} sameSite=${c.sameSite} ${c.valuePreview}`,
            )
            .join(" | "),
          "ok",
        );
      } catch (e) {
        showMsg(e instanceof Error ? e.message : String(e), "err");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        if (panel.hidden) openPanel();
        else closePanel();
      }
    });

    return root;
  }

  function removeUi() {
    if (root) {
      root.remove();
      root = null;
    }
  }

  async function refreshVisibility() {
    try {
      const res = await chrome.runtime.sendMessage({
        type: "should-show-panel",
        host: location.hostname,
      });
      if (res && res.show) ensureUi();
      else removeUi();
    } catch {
      /* extension reloaded */
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.panelMode || changes.whitelist) refreshVisibility();
  });

  refreshVisibility();
})();

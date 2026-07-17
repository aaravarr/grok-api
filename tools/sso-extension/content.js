(() => {
  if (window.__xaiSsoPanelInstalled) return;
  window.__xaiSsoPanelInstalled = true;
  let root = null;
  function ensureUi() {
    if (root) return root;
    root = document.createElement('div');
    root.id = 'xai-sso-panel-root';
    root.innerHTML = [
      '<button type="button" id="xai-sso-fab" title="SSO 贡献 (Ctrl+Shift+L)">SSO</button>',
      '<div id="xai-sso-panel" hidden>',
      '  <div class="xai-sso-hd">',
      '    <strong>SSO · 贡献</strong>',
      '    <button type="button" id="xai-sso-close" aria-label="关闭">×</button>',
      '  </div>',
      '  <div class="xai-sso-target" id="xai-sso-target">grok-api: …</div>',
      '  <label class="xai-sso-lab">SSO JWT（写入 sso + sso-rw）</label>',
      '  <textarea id="xai-sso-input" rows="4" placeholder="eyJ... 或 邮箱|密码|sso|时间" spellcheck="false"></textarea>',
      '  <label class="xai-sso-lab">席位名称（可空）</label>',
      '  <input id="xai-sso-name" type="text" placeholder="ext-..." autocomplete="off" />',
      '  <label class="xai-sso-lab">Cookie 名覆盖（可空）</label>',
      '  <input id="xai-sso-cookie" type="text" placeholder="留空即可" autocomplete="off" />',
      '  <label class="xai-sso-check">',
      '    <input type="checkbox" id="xai-sso-contribute" checked />',
      '    写入 Cookie 并贡献到 grok-api（OAuth device code + 打开授权页）',
      '  </label>',
      '  <label class="xai-sso-check">',
      '    <input type="checkbox" id="xai-sso-no-redirect" />',
      '    仅 Cookie 模式时：不跳转 grok.com',
      '  </label>',
      '  <div class="xai-sso-actions">',
      '    <button type="button" id="xai-sso-apply" class="primary">开始</button>',
      '    <button type="button" id="xai-sso-diag">诊断</button>',
      '  </div>',
      '  <div id="xai-sso-msg" class="xai-sso-msg" hidden></div>',
      '  <div class="xai-sso-foot">配置 grok-api：点扩展图标 →「配置 grok-api 连接」</div>',
      '</div>'
    ].join('');
    document.documentElement.appendChild(root);
    const fab = root.querySelector('#xai-sso-fab');
    const panel = root.querySelector('#xai-sso-panel');
    const closeBtn = root.querySelector('#xai-sso-close');
    const input = root.querySelector('#xai-sso-input');
    const nameInput = root.querySelector('#xai-sso-name');
    const cookieInput = root.querySelector('#xai-sso-cookie');
    const contributeEl = root.querySelector('#xai-sso-contribute');
    const noRedirect = root.querySelector('#xai-sso-no-redirect');
    const applyBtn = root.querySelector('#xai-sso-apply');
    const diagBtn = root.querySelector('#xai-sso-diag');
    const msg = root.querySelector('#xai-sso-msg');
    const targetEl = root.querySelector('#xai-sso-target');
    function showMsg(text, kind) {
      msg.hidden = !text;
      msg.textContent = text || '';
      msg.className = 'xai-sso-msg' + (kind ? ' ' + kind : '');
    }
    async function refreshDefaults() {
      try {
        const res = await chrome.runtime.sendMessage({ type: 'get-contribute-defaults' });
        if (res && res.ok) {
          contributeEl.checked = res.defaultContribute !== false;
          targetEl.textContent = 'grok-api: ' + (res.baseUrl || '?');
          if (!nameInput.value && res.seatNamePrefix) nameInput.placeholder = res.seatNamePrefix + '-…';
        }
      } catch (_) {}
    }
    function openPanel() {
      panel.hidden = false;
      fab.hidden = true;
      chrome.storage.local.get(['lastCookieName'], (r) => {
        if (r.lastCookieName && !cookieInput.value) cookieInput.value = r.lastCookieName;
      });
      refreshDefaults();
      setTimeout(() => input.focus(), 0);
    }
    function closePanel() {
      panel.hidden = true;
      fab.hidden = false;
      showMsg('');
    }
    fab.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    applyBtn.addEventListener('click', async () => {
      const sso = input.value.trim();
      if (!sso) { showMsg('请先粘贴 SSO', 'err'); return; }
      applyBtn.disabled = true;
      const doContribute = contributeEl.checked;
      try {
        if (!doContribute) {
          showMsg('清理旧 Cookie → 写入 sso / sso-rw …', '');
          const res = await chrome.runtime.sendMessage({ type: 'sso-login', sso, cookieName: cookieInput.value.trim() });
          if (!res || !res.ok) { showMsg((res && res.error) || '写入失败', 'err'); applyBtn.disabled = false; return; }
          const parts = ['清理 ' + (res.removed || 0), '写入 ' + res.set, '读回 ' + ((res.verified || []).length)];
          if (res.accountsOk) parts.push('accounts✓');
          if (res.grokOk) parts.push('grok✓');
          if (noRedirect.checked) { showMsg(parts.join(' · ') + '（未跳转）', 'ok'); applyBtn.disabled = false; return; }
          showMsg(parts.join(' · ') + ' → 打开 grok.com …', 'ok');
          setTimeout(() => { location.href = res.redirectUrl || 'https://grok.com/'; }, 350);
          return;
        }
        showMsg('1/4 写 Cookie → 2/4 登录 grok-api → 3/4 申请 OAuth → 4/4 打开授权页并等待…\n（可能需要 1–3 分钟，请在授权页完成确认）', '');
        const res = await chrome.runtime.sendMessage({ type: 'sso-contribute', sso, cookieName: cookieInput.value.trim(), name: nameInput.value.trim() });
        if (!res) { showMsg('无响应（扩展可能已重载）', 'err'); applyBtn.disabled = false; return; }
        if (!res.ok) {
          const lines = [];
          if (res.step) lines.push('步骤: ' + res.step);
          if (res.error) lines.push(res.error);
          if (res.cookie && res.cookie.ok) lines.push('Cookie: 已写入');
          if (res.oauth && res.oauth.userCode) lines.push('user_code: ' + res.oauth.userCode);
          if (res.oauth && res.oauth.verificationUri) lines.push('授权: ' + res.oauth.verificationUri);
          showMsg(lines.join('\n') || '失败', 'err');
          applyBtn.disabled = false;
          return;
        }
        const acc = res.oauth && res.oauth.account;
        showMsg([
          res.message || '完成',
          'user: ' + ((res.auth && res.auth.username) || '?'),
          'account: ' + ((acc && (acc.name || acc.id)) || res.oauth.accountId || '?'),
          'code: ' + (res.oauth.userCode || '?')
        ].join('\n'), 'ok');
      } catch (e) {
        showMsg(e instanceof Error ? e.message : String(e), 'err');
      }
      applyBtn.disabled = false;
    });
    diagBtn.addEventListener('click', async () => {
      showMsg('读取当前 sso / sso-rw …', '');
      try {
        const res = await chrome.runtime.sendMessage({ type: 'sso-diagnose' });
        if (!res || !res.ok) { showMsg((res && res.error) || '诊断失败', 'err'); return; }
        const list = res.cookies || [];
        if (!list.length) { showMsg('当前浏览器里没有 sso / sso-rw Cookie', 'err'); return; }
        showMsg(list.map((c) => c.name + '@' + c.domain + ' httpOnly=' + c.httpOnly + ' sameSite=' + c.sameSite + ' ' + c.valuePreview).join(' | '), 'ok');
      } catch (e) {
        showMsg(e instanceof Error ? e.message : String(e), 'err');
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        if (panel.hidden) openPanel(); else closePanel();
      }
    });
    return root;
  }
  function removeUi() { if (root) { root.remove(); root = null; } }
  async function refreshVisibility() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'should-show-panel', host: location.hostname });
      if (res && res.show) ensureUi(); else removeUi();
    } catch (_) {}
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.panelMode || changes.whitelist) refreshVisibility();
  });
  refreshVisibility();
})();

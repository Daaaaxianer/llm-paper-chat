var PaperDesk = {};

(() => {
  const presets = {
    openai: ["OpenAI / ChatGPT", "https://api.openai.com/v1", "gpt-4.1-mini"],
    gemini: ["Google Gemini", "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-3.5-flash-lite"],
    deepseek: ["DeepSeek", "https://api.deepseek.com", "deepseek-flash"],
    kimi: ["Kimi / Moonshot", "https://api.moonshot.cn/v1", "kimi-k3.1-pro"],
    glm: ["智谱 GLM", "https://open.bigmodel.cn/api/paas/v4", "glm-5.3"],
    claude: ["Anthropic Claude", "https://api.anthropic.com/v1", "claude-sonnet-4-6"],
    custom: ["自定义（OpenAI 兼容）", "", ""],
  };
  const defaults = {
    provider: "openai",
    profiles: {},
    source: "en",
    target: "zh-CN",
    selectionMode: "click",
    uiLanguage: "zh-CN",
    summary: "",
    contextChars: 18000,
    responseTokens: 2400,
    babelPath: "",
    pdfQps: 2,
    historyDays: 30,
  };
  const prefsKey = "extensions.paperdesk.settings";
  const loginOrigin = "https://paperdesk.invalid";
  const loginRealm = "PaperDesk API";
  const defaultSummary = "请把这篇论文整理成以下六个部分：①研究问题与背景；②研究对象与方法；③主要研究结果；④结论与创新点；⑤局限性；⑥结论。\n保留作者原文的措辞强度，不要加强或弱化，严禁杜撰实验、结论等原文不存在的信息；语言简洁规范，使用学术书面语，整体篇幅控制在500字左右。";
  const previousSummaries = new Set([
    "用中文总结研究问题、样本与方法、关键结果（保留数量与单位）、作者指出的局限和后续问题。区分论文中的证据和推断。",
    "Summarize in English. Cover the research question, sample and methods, main findings with quantities and units, author-reported limitations, and follow-up questions. Distinguish the paper's evidence from inference.",
    "请把这篇论文整理成以下六个部分：①研究问题与背景；②研究对象与方法（明确写出研究设计）；③主要结局指标与主要结果（给出具体数值）；④次要结果；⑤作者自己承认的局限性；⑥结论（保留作者原文的措辞强度，不要加强或弱化）。",
  ]);

  function summaryTemplate(config) {
    return !config.summary || previousSummaries.has(config.summary) ? defaultSummary : config.summary;
  }

  function settings() {
    const value = Zotero.Prefs.get(prefsKey, true);
    return { ...defaults, ...(value ? JSON.parse(value) : {}) };
  }

  function profile(config, provider = config.provider) {
    const [, base, model] = presets[provider];
    return { provider, base, model, stream: true, workspace: "", ...config.profiles[provider] };
  }

  function logins(provider) {
    return Services.logins.searchLoginsAsync({ origin: loginOrigin, httpRealm: loginRealm + " " + provider });
  }

  async function apiKey(provider) {
    return (await logins(provider))[0]?.password || "";
  }

  async function saveSettings(config, key) {
    const [previous] = await logins(config.provider);
    if (key !== previous?.password) {
      if (key) {
        const login = Components.classes["@mozilla.org/login-manager/loginInfo;1"]
          .createInstance(Components.interfaces.nsILoginInfo);
        login.init(loginOrigin, null, loginRealm + " " + config.provider, config.provider, key, "", "");
        if (previous) Services.logins.modifyLogin(previous, login);
        else await Services.logins.addLoginAsync(login);
      } else if (previous) {
        Services.logins.removeLogin(previous);
      }
    }
    Zotero.Prefs.set(prefsKey, JSON.stringify(config), true);
  }

  function endpoint(base, t = PaperDesk.language(defaults)) {
    let url;
    try {
      url = new URL(base.trim());
    } catch {
      throw new Error(t("请填写完整的 API 地址，例如 https://api.deepseek.com。", "Enter a complete API URL, such as https://api.deepseek.com."));
    }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash) {
      throw new Error(t("API 地址须为 HTTP(S) URL，密钥请填写在独立字段中。", "Use an HTTP(S) API URL and enter the key in the separate field."));
    }
    const path = url.pathname.replace(/\/+$/, "");
    url.pathname = path.endsWith("/chat/completions") ? path : path + "/chat/completions";
    return url;
  }

  function prepareConnection(profile, key, config) {
    const t = PaperDesk.language(config);
    const url = endpoint(profile.base, t);
    const model = profile.model.trim();
    if (!model) throw new Error(t("请填写模型 ID。", "Enter a model ID."));
    if (!key && profile.provider !== "custom") throw new Error(t("请填写此服务的 API 密钥。", "Enter the API key for this provider."));
    return { ...profile, url, key, model, t };
  }

  async function connection(config) {
    const model = profile(config);
    return prepareConnection(model, await apiKey(model.provider), config);
  }

  async function readStream(response, onText, t) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let finishReason = "";

    function readLine(line) {
      if (!line.startsWith("data:")) return false;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return true;
      if (!data) return false;
      const payload = JSON.parse(data);
      if (payload.error) throw new Error(payload.error.message || t("模型返回错误。", "The model returned an error."));
      const choice = payload.choices?.[0];
      finishReason = choice?.finish_reason || finishReason;
      if (typeof choice?.delta?.content === "string") content += choice.delta.content;
      return false;
    }

    try {
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        const before = content.length;
        done = lines.some(readLine);
        if (chunk.done && buffer && !done) done = readLine(buffer);
        if (content.length !== before) onText?.(content);
        if (chunk.done) break;
      }
      return { content, finishReason: finishReason || (done ? "stop" : "incomplete") };
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

  async function complete(model, messages, { limit = 2400, signal, onText, onFinish } = {}) {
    const t = model.t || PaperDesk.language(defaults);
    const headers = { "Content-Type": "application/json" };
    if (model.key) headers.Authorization = "Bearer " + model.key;
    if (model.provider === "claude" && model.workspace) headers["anthropic-workspace-id"] = model.workspace;
    const body = { model: model.model, messages, stream: Boolean(model.stream && onText) };
    body[model.provider === "openai" ? "max_completion_tokens" : "max_tokens"] = limit;
    if (model.provider === "deepseek") body.thinking = { type: "disabled" };
    let response;
    try {
      response = await fetch(model.url.href, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal,
        credentials: "omit",
        redirect: "error",
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(t("无法连接 {host}。请检查 API 地址、网络和 Zotero 的代理设置。",
        "Could not connect to {host}. Check the API URL, network, and Zotero proxy settings.", { host: model.url.host }));
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const raw = String(payload?.error?.message || payload?.message || "");
      const detail = model.key ? raw.split(model.key).join("[redacted]") : raw;
      const hints = {
        400: t("请核对模型 ID 和接口参数。", "Check the model ID and API parameters."),
        401: t("请核对 API 密钥和服务商。", "Check the API key and provider."),
        402: t("请检查 API 账户余额。", "Check the API account balance."),
        403: t("请检查密钥和模型的访问权限。", "Check API key permissions and model access."),
        404: t("请核对 API 地址和模型 ID。", "Check the API URL and model ID."),
        429: t("请求太频繁或已达到配额。", "The service is rate-limiting requests or the account reached its quota."),
      };
      const status = t("模型请求失败（HTTP {status}）", "Model request failed (HTTP {status})", { status: response.status });
      throw new Error([status, hints[response.status], detail.slice(0, 300)].filter(Boolean).join(" · "));
    }
    let result;
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      result = await readStream(response, onText, t);
    } else {
      const output = await response.json().catch(() => {
        throw new Error(t("接口返回的内容不是 JSON。请核对 API 地址。", "The endpoint did not return JSON. Check the API URL."));
      });
      const choice = output.choices?.[0];
      result = { content: choice?.message?.content, finishReason: choice?.finish_reason };
    }
    if (typeof result.content !== "string" || !result.content.trim()) {
      throw new Error(result.finishReason === "length"
        ? t("输出额度耗尽，请调高输出 Token 上限。", "The model reached its output limit. Increase the response token limit.")
        : t("模型没有返回正文，请核对模型 ID 与 API 地址。", "The model returned no text. Check the model ID and API URL."));
    }
    onFinish?.(result.finishReason);
    return result.content.trim() + (result.finishReason === "length" ? "\n\n" + t("[达到输出上限]", "[Output limit reached]") : "");
  }

  function testConnection(model, signal) {
    return complete(model, [{ role: "user", content: "Reply with OK." }], {
      limit: model.provider === "deepseek" ? 32 : 128,
      signal,
      onText: () => {},
    });
  }

  Object.assign(PaperDesk, {
    presets, defaults, settings, profile, apiKey, saveSettings, endpoint, prepareConnection, connection, complete,
    defaultSummary, summaryTemplate, testConnection,
  });
})();

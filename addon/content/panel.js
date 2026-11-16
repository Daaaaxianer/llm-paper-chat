(() => {
  const htmlNS = "http://www.w3.org/1999/xhtml";

  function element(doc, tag, attrs = {}, ...children) {
    const node = doc.createElementNS(htmlNS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    node.append(...children);
    return node;
  }

  const itemActions = [
    ["Summarize", "论文总结", "Summarize"],
    ["TranslatePDF", "单语原位翻译", "Translate PDF"],
    ["TranslateDualPDF", "双语原位翻译", "Translate bilingual PDF"],
  ];
  const collectionActions = [
    ["Review", "目录综述", "Review"],
    ["Findings and Limitations", "研究发现与局限", "Findings and Limitations"],
    ["Research gaps", "研究空白", "Research gaps"],
  ];
  const actionLabels = Object.fromEntries([...itemActions, ...collectionActions].map(([key, ...labels]) => [key, labels]));
  const isTranslation = action => action === "TranslatePDF" || action === "TranslateDualPDF";

  function scopeFor(win, preferCollection, t) {
    const pane = win.ZoteroPane;
    const collections = pane.collectionsView ? pane.getSelectedCollections() : [];
    const selected = pane.getSelectedItems(false, { libraryTabOnly: true });
    const parents = new Map();
    for (const entry of selected) {
      const item = entry.parentItem || entry;
      if (item.isRegularItem() || item.isPDFAttachment()) parents.set(item.id, item);
    }
    if ((!preferCollection || !collections.length) && parents.size === 1) {
      const item = [...parents.values()][0];
      const pdf = selected.length === 1 && selected[0].isPDFAttachment() ? selected[0] : null;
      return {
        key: "item:" + item.id + ":" + (pdf?.id || ""),
        label: item.getDisplayTitle(),
        type: t("文献", "Paper"),
        item,
        pdf,
        alternate: collections.length ? t("整个目录", "Whole collection") : "",
      };
    }
    if (collections.length) {
      return {
        key: "collection:" + collections.map(c => c.id).sort().join(","),
        label: collections.map(c => c.name).join(t("、", ", ")),
        type: t("目录", "Collection"),
        collections,
        alternate: parents.size === 1 ? t("当前文献", "Current paper") : "",
      };
    }
    return { key: "general", label: t("通用对话", "General chat"), type: "" };
  }

  class Panel {
    constructor(win) {
      this.win = win;
      this.doc = win.document;
      this.config = PaperDesk.settings();
      this.sessions = new Map();
      this.preferCollection = false;
      this.pending = new Map();
      this.panel = this.make("aside", { class: "pd-panel", id: "paperdesk-panel", "aria-label": "LLM Paper Chat" });
      this.panel.hidden = true;
      this.newButton = this.button("", () => this.reset());
      this.settingsButton = this.button("", () => this.openSettings(), "pd-settings-button");
      this.closeButton = this.button("", () => this.setOpen(false));
      this.panel.append(
        this.make("header", { class: "pd-head" },
          this.make("strong", { title: "LLM Paper Chat" }, "LLM Paper Chat"), this.newButton, this.settingsButton, this.closeButton
        )
      );
      this.scopeLabel = this.make("span", { class: "pd-scope-label" });
      this.scopeType = this.make("span", { class: "pd-scope-type" });
      this.scopeSwitch = this.button("", () => {
        this.preferCollection = !this.preferCollection;
        this.refreshScope();
      }, "pd-scope-switch");
      this.scopeBar = this.make("div", { class: "pd-scope" }, this.scopeType, this.scopeLabel, this.scopeSwitch);
      this.actions = this.make("div", { class: "pd-actions" });
      this.historyPanel = this.make("div", { id: "paperdesk-history", class: "pd-history", hidden: "hidden" });
      this.historyButton = this.button("", () => this.toggleHistory(), "pd-action");
      this.historyButton.dataset.action = "history";
      this.historyButton.setAttribute("aria-controls", this.historyPanel.id);
      this.historyButton.setAttribute("aria-expanded", "false");
      this.pdfHint = this.make("div", { class: "pd-pdf-hint" });
      this.topic = this.make("div", { class: "pd-topic", hidden: "hidden" });
      this.messages = this.make("div", { class: "pd-messages", role: "log", tabindex: "0" });
      this.status = this.make("div", { class: "pd-status", role: "status" });
      this.input = this.make("textarea", { class: "pd-input", rows: "3" });
      this.input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          this.sendInput();
        }
      });
      this.send = this.button("", () => this.sendInput(), "pd-primary");
      this.stop = this.button("", () => this.pending.get(this.scope.key)?.controller.abort());
      this.chat = this.make("div", { class: "pd-chat" }, this.scopeBar, this.actions, this.pdfHint, this.topic, this.historyPanel, this.messages,
        this.make("footer", { class: "pd-compose" }, this.status, this.input,
          this.make("div", { class: "pd-compose-row" }, this.stop, this.send)));
      this.panel.append(this.chat);
      this.localize();
    }

    get t() {
      return PaperDesk.language(this.config);
    }

    localize() {
      const t = this.t;
      this.panel.lang = this.config.uiLanguage;
      this.newButton.textContent = t("新会话", "New chat");
      this.settingsButton.textContent = t("设置", "Settings");
      this.historyButton.textContent = t("历史", "History");
      this.closeButton.textContent = t("关闭", "Close");
      this.messages.setAttribute("aria-label", t("对话消息", "Chat messages"));
      this.input.placeholder = t("输入问题…", "Ask a question…");
      this.input.setAttribute("aria-label", t("输入问题", "Your question"));
      this.send.textContent = t("发送", "Send");
      this.stop.textContent = t("停止", "Stop");
      this.toolbar?.setAttribute("tooltiptext", t("LLM Paper Chat · 文献对话", "LLM Paper Chat · Research chat"));
      this.toolbar?.setAttribute("aria-label", t("打开 LLM Paper Chat", "Open LLM Paper Chat"));
      this.menu?.firstElementChild.setAttribute("label", this.newButton.textContent);
      this.menu?.lastElementChild.setAttribute("label", this.settingsButton.textContent);
    }

    make(tag, attrs, ...children) {
      return element(this.doc, tag, attrs, ...children);
    }

    button(label, handler, className = "") {
      const button = this.make("button", { type: "button", class: className }, label);
      button.addEventListener("click", handler);
      return button;
    }

    setOpen(open) {
      this.panel.hidden = !open;
      this.toolbar.setAttribute("aria-expanded", String(open));
      if (open && !this.timer) {
        this.refreshScope();
        this.timer = this.win.setInterval(() => this.refreshScope(), 350);
      } else if (!open && this.timer) {
        this.win.clearInterval(this.timer);
        this.timer = null;
      }
    }

    destroy() {
      this.setOpen(false);
      for (const { controller } of this.pending.values()) controller.abort();
      this.settingsController?.abort();
      this.panel.remove();
      this.toolbar.remove();
      this.menu.remove();
    }

    refreshScope(force = false) {
      const current = scopeFor(this.win, this.preferCollection, this.t);
      if (this.preferCollection && this.scope?.key !== current.key && !current.collections) this.preferCollection = false;
      if (!force && this.scope?.key === current.key && this.scope.label === current.label && this.scope.alternate === current.alternate) return;
      const changed = this.scope?.key !== current.key;
      if (changed && this.scope) this.session().draft = this.input.value;
      this.scope = current;
      this.scopeLabel.textContent = current.label;
      this.scopeLabel.title = current.label;
      this.scopeType.textContent = current.type;
      this.scopeType.hidden = !current.type;
      this.scopeSwitch.hidden = !current.alternate;
      this.scopeSwitch.textContent = current.alternate;
      this.topic.hidden = true;
      this.topic.replaceChildren();
      this.setHistoryOpen(false);
      if (changed) this.input.value = this.session().draft;
      this.render();
    }

    session(key = this.scope.key) {
      if (!this.sessions.has(key)) this.sessions.set(key, { entries: [], status: "", draft: "" });
      return this.sessions.get(key);
    }

    reset() {
      if (this.settingsPane) this.closeSettings();
      if (this.pending.has(this.scope.key)) return;
      this.setHistoryOpen(false);
      this.sessions.delete(this.scope.key);
      this.input.value = "";
      this.render();
    }

    render() {
      const t = this.t;
      const session = this.session();
      const active = this.pending.get(this.scope.key);
      this.newButton.disabled = Boolean(active);
      this.menu?.firstElementChild.toggleAttribute("disabled", Boolean(active));
      const buttons = this.scope.item ? itemActions : this.scope.collections ? collectionActions : [];
      const needsEngine = this.scope.item && !this.config.babelPath;
      const engineHint = t("在设置中配置 BabelDOC 后即可翻译整篇 PDF。", "Set up BabelDOC in Settings to translate full PDFs.");
      this.actions.replaceChildren(...buttons.map(([action, zh, en]) => {
        const button = this.button(t(zh, en), () => action === "Review" ? this.askTopic() : this.run(action), "pd-action");
        button.dataset.action = action;
        button.disabled = Boolean(active || (needsEngine && isTranslation(action)));
        if (needsEngine && isTranslation(action)) button.title = engineHint;
        return button;
      }));
      if (buttons.length) this.actions.append(this.historyButton);
      this.historyButton.disabled = Boolean(active);
      this.pdfHint.hidden = !needsEngine;
      this.pdfHint.textContent = needsEngine ? engineHint : "";
      this.messages.replaceChildren();
      if (!session.entries.length) {
        const hint = this.scope.item ? t("提问，或总结当前文献。", "Ask a question or summarize this paper.")
          : this.scope.collections ? t("基于当前目录提问，或选择一项综合分析。", "Ask about this collection or choose an analysis.")
            : t("选择一篇文献或一个目录，或直接开始对话。", "Select a paper or collection, or start a chat.");
        this.messages.append(this.make("p", { class: "pd-empty" }, hint));
      }
      for (const entry of session.entries) this.messages.append(this.message(entry));
      this.status.textContent = session.status || this.modelLabel();
      this.stop.hidden = !active;
      this.send.disabled = Boolean(active);
      this.messages.scrollTop = this.messages.scrollHeight;
    }

    modelLabel() {
      const profile = PaperDesk.profile(this.config);
      if (!profile.model && profile.provider === "custom") return this.t("自定义服务", "Custom provider");
      return profile.model || PaperDesk.presets[profile.provider][0];
    }

    setHistoryOpen(open) {
      this.historyPanel.hidden = !open;
      this.historyButton.setAttribute("aria-expanded", String(open));
      if (!open) this.historyPanel.replaceChildren();
    }

    async toggleHistory() {
      const open = this.historyPanel.hidden;
      this.setHistoryOpen(open);
      if (!open) return;
      const scope = this.scope;
      const t = this.t;
      const hint = text => this.make("p", { class: "pd-empty", role: "status" }, text);
      this.historyPanel.replaceChildren(hint(t("正在读取历史…", "Loading history…")));
      try {
        const records = await PaperDesk.listHistory(scope);
        if (this.historyPanel.hidden || this.scope.key !== scope.key) return;
        this.historyPanel.replaceChildren(...records.map(record => {
          const label = t(...actionLabels[record.action]) + (record.topic ? " · " + record.topic : "");
          const date = new Date(record.created).toLocaleString(this.config.uiLanguage, { dateStyle: "short", timeStyle: "short" });
          const row = this.button("", () => {
            this.setHistoryOpen(false);
            const session = this.session();
            session.entries.push(
              { role: "user", content: label, context: true },
              { role: "assistant", content: PaperDesk.formatAnalysis(record.answer, record.action), context: true,
                plainText: true, noteItemID: record.action === "Summarize" ? scope.item?.id : null },
            );
            session.status = t("已使用历史结果。", "Loaded a saved result.");
            this.render();
          }, "pd-history-row");
          row.append(this.make("span", {}, label), this.make("small", {}, date + " · " + record.model));
          return row;
        }));
        if (!records.length) this.historyPanel.append(hint(t("当前范围还没有历史记录。", "No saved results for this scope yet.")));
      } catch (error) {
        Zotero.logError(error);
        if (!this.historyPanel.hidden && this.scope.key === scope.key) {
          this.historyPanel.replaceChildren(hint(t("无法读取历史记录。", "Could not load history.")));
        }
      }
    }

    message(entry) {
      const t = this.t;
      const node = this.make("article", { class: "pd-message pd-" + entry.role });
      if (entry.role === "user" || entry.role === "notice") {
        node.textContent = entry.content;
      } else {
        const body = this.make("div", { class: "pd-answer" });
        if (entry.plainText) {
          body.textContent = entry.content;
        } else {
          for (const line of entry.content.split("\n")) {
            const heading = line.match(/^#{1,6}\s+(.+)/);
            if (heading) body.append(this.make("h3", {}, heading[1]));
            else body.append(this.make("div", {}, line || "\u00a0"));
          }
        }
        node.append(body);
        if (entry.content && !entry.partial) {
          const copy = this.button(t("复制", "Copy"), () => {
            Zotero.Utilities.Internal.copyTextToClipboard(entry.content);
            copy.textContent = t("已复制", "Copied");
          }, "pd-copy");
          const actions = this.make("div", { class: "pd-message-actions" }, copy);
          if (entry.noteItemID) {
            const note = this.button(entry.noteSaved ? t("已添加笔记", "Note added") : t("添加为笔记", "Add as note"),
              () => this.saveSummaryNote(entry), "pd-copy");
            note.disabled = Boolean(entry.noteSaving || entry.noteSaved);
            actions.append(note);
          }
          node.append(actions);
        }
      }
      if (entry.attachment) {
        node.append(this.button(t("打开 PDF", "Open PDF"), () => {
          Zotero.Reader.open(entry.attachment).catch(error => Zotero.logError(error));
        }, "pd-action"));
      }
      return node;
    }

    async saveSummaryNote(entry) {
      if (entry.noteSaving || entry.noteSaved) return;
      const scopeKey = this.scope.key;
      const session = this.session();
      const t = this.t;
      entry.noteSaving = true;
      this.render();
      try {
        const item = await Zotero.Items.getAsync(entry.noteItemID);
        if (!item || item.deleted || !item.isEditable()) {
          throw new Error(t("无法向当前文献添加笔记。请检查条目和文献库权限。", "This paper cannot accept a note. Check the item and library permissions."));
        }
        const note = new Zotero.Item("note");
        note.libraryID = item.libraryID;
        if (item.isRegularItem()) note.parentItemID = item.id;
        else {
          note.setCollections(item.getCollections());
          note.addRelatedItem(item);
        }
        const text = this.make("div", {}, ...entry.content.split("\n").map(line => this.make("p", {}, line)));
        note.setNote(text.innerHTML);
        await note.saveTx();
        entry.noteSaved = true;
        session.status = t("已保存为 Zotero 笔记。", "Saved as a Zotero note.");
      } catch (error) {
        session.status = error.message || String(error);
      } finally {
        entry.noteSaving = false;
        if (this.scope.key === scopeKey) this.render();
      }
    }

    askTopic() {
      if (!this.topic.hidden) {
        this.topic.hidden = true;
        return;
      }
      const t = this.t;
      const topicLabel = t("综述主题", "Review topic");
      const input = this.make("input", { type: "text", placeholder: t("留空由模型归纳主题", "Leave blank to let the model choose"), "aria-label": topicLabel });
      const begin = () => {
        this.topic.hidden = true;
        this.run("Review", input.value.trim());
      };
      input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.isComposing) begin();
      });
      this.topic.replaceChildren(this.make("label", {}, topicLabel, input),
        this.button(t("开始综述", "Start review"), begin, "pd-primary"), this.button(t("取消", "Cancel"), () => { this.topic.hidden = true; }));
      this.topic.hidden = false;
      input.focus();
    }

    sendInput() {
      const question = this.input.value.trim();
      if (!question || this.pending.has(this.scope.key)) return;
      this.input.value = "";
      this.session().draft = "";
      this.run("", question);
    }

    async run(action, detail = "") {
      const scope = this.scope;
      if (this.pending.has(scope.key)) return;
      const config = this.config = PaperDesk.settings();
      const t = PaperDesk.language(config);
      this.setHistoryOpen(false);
      const session = this.session();
      const history = session.entries.filter(entry => entry.context);
      const label = action ? t(...actionLabels[action]) + (detail ? " · " + detail : "") : detail;
      const controller = new AbortController();
      this.pending.set(scope.key, { controller });
      const user = { role: "user", content: label };
      const response = {
        role: "assistant", content: "", partial: true, plainText: PaperDesk.isAnalysis(action),
        noteItemID: action === "Summarize" ? scope.item?.id : null,
      };
      session.entries.push(user);
      const onStatus = status => {
        session.status = status;
        if (this.scope.key === scope.key) this.status.textContent = status;
      };
      const options = { action, topic: action === "Review" ? detail : "", signal: controller.signal, onStatus };
      onStatus(isTranslation(action) ? t("正在准备原文 PDF…", "Preparing the source PDF…")
        : t("正在准备文献上下文…", "Preparing research context…"));
      this.render();
      try {
        if (isTranslation(action)) {
          const pdf = await PaperDesk.translatePDF(scope, action === "TranslateDualPDF" ? "dual" : "mono", config, options);
          session.entries.push({ role: "notice", content: t("译文已添加到 Zotero。", "The translated PDF was added to Zotero."), attachment: pdf.id });
          onStatus(t("完成", "Done"));
        } else {
          session.entries.push(response);
          const answer = await PaperDesk.ask(scope, action === "Review" && detail ? t("综述主题：", "Review topic: ") + detail : label, history, config, {
            ...options,
            onText: content => {
              response.content = content;
              if (this.scope.key !== scope.key) return;
              const last = this.messages.lastElementChild;
              if (last?.classList.contains("pd-assistant")) last.querySelector(".pd-answer").textContent = content;
              else this.messages.append(this.message(response));
              this.messages.scrollTop = this.messages.scrollHeight;
            },
          });
          response.content = answer.answer;
          response.partial = false;
          response.context = user.context = true;
          const sourceStatus = answer.status ? t("本轮依据：", "Sources: ") + answer.status : t("完成", "Done");
          if (answer.fromHistory) onStatus(t("已使用历史结果。", "Loaded a saved result.") + (answer.status ? " " + sourceStatus : ""));
          else if (answer.historyError) onStatus(t("分析已完成，历史记录保存失败。", "Analysis complete. Could not save it to history."));
          else onStatus(sourceStatus);
        }
      } catch (error) {
        if (!response.content) session.entries = session.entries.filter(entry => entry !== response);
        const detail = controller.signal.aborted ? t("已停止。", "Stopped.") : error.message || String(error);
        session.entries.push({ role: "notice", content: detail });
        onStatus(controller.signal.aborted ? t("已停止", "Stopped") : t("请求失败", "Request failed"));
      } finally {
        this.pending.delete(scope.key);
        if (this.scope.key === scope.key) this.render();
      }
    }

    async openSettings() {
      if (this.settingsPane) {
        this.closeSettings();
        return;
      }
      this.chat.hidden = true;
      const config = PaperDesk.settings();
      const t = PaperDesk.language(config);
      const form = this.make("form", { class: "pd-form" });
      const body = this.make("div", { class: "pd-form-body" });
      form.append(body);
      this.settingsPane = form;
      this.panel.append(form);
      const field = (label, control) => {
        body.append(this.make("label", {}, label, control));
        return control;
      };
      const input = (label, value, attrs) => field(label, this.make("input", { value, ...attrs }));
      const select = (name, label, choices, value) => {
        const box = field(label, this.make("select", { name }, ...choices.map(([id, name]) => this.make("option", { value: id }, name))));
        box.value = value;
        return box;
      };
      const uiLanguage = select("uiLanguage", t("界面语言", "Interface language"), PaperDesk.interfaceLanguages, config.uiLanguage);
      body.append(this.make("h2", {}, t("模型 API", "Model API")));
      const provider = select("provider", t("服务", "Provider"), Object.entries(PaperDesk.presets).map(([id, [name]]) =>
        [id, id === "custom" ? t(name, "Custom (OpenAI-compatible)") : name]), config.provider);
      const base = input(t("API 地址", "API URL"), "", { name: "base", placeholder: "https://example.com/v1" });
      const model = input(t("模型 ID", "Model ID"), "", { name: "model" });
      const key = input(t("API 密钥", "API key"), "", { name: "key", type: "password", autocomplete: "off" });
      const workspace = input(t("Claude 工作区 ID（可选）", "Claude workspace ID (optional)"), "");
      const stream = select("stream", t("回答显示", "Response mode"),
        [["stream", t("流式", "Streaming")], ["full", t("完整返回", "Full response")]], "stream");
      const testStatus = this.make("div", { class: "pd-status", role: "status" });
      const test = this.button(t("测试连接", "Test connection"), () => testCurrentModel(), "pd-action");
      test.dataset.action = "test-model";
      body.append(this.make("div", { class: "pd-model-test" }, test, testStatus));
      body.append(this.make("h2", {}, t("翻译", "Translation")));
      const languageChoices = PaperDesk.translationLanguages;
      const languageField = (name, label, customLabel, value) => {
        const preset = languageChoices.some(([code]) => code === value);
        const menu = select(name, label, [...languageChoices, ["", t("自定义…", "Custom…")]], preset ? value : "");
        const custom = input(customLabel, preset ? "" : value, { name: name + "Custom", placeholder: "e.g. en-GB" });
        const refresh = () => { custom.parentNode.hidden = custom.disabled = Boolean(menu.value); };
        menu.addEventListener("change", refresh);
        refresh();
        return () => menu.value || custom.value.trim();
      };
      const source = languageField("source", t("源语言", "Source language"), t("自定义源语言代码", "Custom source language code"), config.source);
      const target = languageField("target", t("目标语言", "Target language"), t("自定义目标语言代码", "Custom target language code"), config.target);
      const mode = select("selectionMode", t("PDF 划词", "PDF text selection"),
        [["click", t("点击翻译", "Click to translate")], ["auto", t("自动翻译", "Translate automatically")], ["off", t("关闭", "Off")]], config.selectionMode);
      const executable = input(t("BabelDOC 本机可执行文件（可选）", "Local BabelDOC executable (optional)"), config.babelPath, {
        name: "babelPath", placeholder: Zotero.isWin ? "C:\\…\\babeldoc.exe" : "/…/babeldoc",
      });
      const browseStatus = this.make("div", { class: "pd-status", role: "status" });
      const browse = this.button(t("选择文件…", "Choose file…"), async () => {
        browseStatus.textContent = "";
        try {
          const { FilePicker } = ChromeUtils.importESModule("chrome://zotero/content/modules/filePicker.mjs");
          const picker = new FilePicker();
          picker.init(this.win, t("选择 BabelDOC 可执行文件", "Choose the BabelDOC executable"), picker.modeOpen);
          if (Zotero.isWin) picker.appendFilter(t("可执行文件", "Executables"), "*.exe");
          if (await picker.show() === picker.returnOK) executable.value = picker.file;
        } catch {
          browseStatus.textContent = t("无法打开文件选择器，请粘贴文件的完整路径。", "Could not open the file picker. Paste the full executable path.");
        }
      }, "pd-action");
      body.append(this.make("div", { class: "pd-model-test" }, browse, browseStatus),
        this.make("p", { class: "pd-hint" }, t(
          "安装后请选择 babeldoc.exe（Windows）或 babeldoc。留空时仍可使用问答和划词翻译。",
          "After installation, select babeldoc.exe on Windows or babeldoc on other systems. Chat and selection translation work with this field blank."
        )));
      const qps = input(t("PDF 翻译每秒请求数", "PDF translation requests per second"), config.pdfQps,
        { type: "number", min: "1", max: "20", required: "required" });
      body.append(this.make("h2", {}, t("文献分析", "Research")));
      const summary = field(t("论文总结模板", "Summary template"), this.make("textarea", { rows: "4" }, PaperDesk.summaryTemplate(config)));
      const chars = input(t("每次发送的文献字符上限", "Source character limit per request"), config.contextChars,
        { type: "number", min: "4000", max: "100000", step: "1000", required: "required" });
      const tokens = input(t("回答 Token 上限", "Response token limit"), config.responseTokens,
        { name: "responseTokens", type: "number", min: "128", max: "16000", required: "required" });
      body.append(this.make("h2", {}, t("本地历史", "Local history")));
      const historyDays = input(t("保留天数", "Keep history for days"), config.historyDays,
        { name: "historyDays", type: "number", min: "1", step: "1", required: "required" });
      const historyStatus = this.make("div", { class: "pd-status", role: "status" });
      const clearHistory = this.button(t("删除所有本地历史", "Delete all local history"), async () => {
        if (!this.win.confirm(t("确定删除所有本地分析历史？", "Delete all locally saved analysis history?"))) return;
        clearHistory.disabled = true;
        try {
          await PaperDesk.clearHistory();
          this.setHistoryOpen(false);
          historyStatus.textContent = t("本地历史已删除。", "Local history deleted.");
        } catch (error) {
          Zotero.logError(error);
          historyStatus.textContent = t("无法删除本地历史。", "Could not delete local history.");
        } finally {
          clearHistory.disabled = false;
        }
      }, "pd-action");
      clearHistory.dataset.action = "clear-history";
      body.append(this.make("div", { class: "pd-model-test" }, clearHistory, historyStatus));
      const status = this.make("div", { class: "pd-status", role: "status" });
      const save = this.make("button", { type: "submit", class: "pd-primary" }, t("保存", "Save"));
      body.append(this.make("p", { class: "pd-hint" }, t("翻译和文献对话会将所需文本发给已选服务。", "Chat and translation send the needed text to the selected provider.")));
      form.append(this.make("div", { class: "pd-form-footer" }, status, save));
      const drafts = new Map();
      const modelFields = [base, model, key, workspace, stream];
      let loaded = "";
      let revision = 0;
      const readProfile = () => ({ base: base.value.trim(), model: model.value.trim(), workspace: workspace.value.trim(), stream: stream.value === "stream" });
      for (const field of modelFields) field.addEventListener("input", () => { testStatus.textContent = ""; });
      const load = async () => {
        if (loaded) drafts.set(loaded, { profile: readProfile(), key: key.value.trim() });
        const id = provider.value;
        const call = ++revision;
        loaded = "";
        key.value = "";
        testStatus.textContent = "";
        save.disabled = test.disabled = true;
        const draft = drafts.get(id);
        const values = draft?.profile || PaperDesk.profile(config, id);
        base.value = values.base;
        model.value = values.model;
        workspace.value = values.workspace;
        workspace.parentNode.hidden = id !== "claude";
        stream.value = values.stream ? "stream" : "full";
        try {
          const secret = draft ? draft.key : await PaperDesk.apiKey(id);
          if (call !== revision) return;
          loaded = id;
          key.value = secret;
          status.textContent = "";
        } catch (error) {
          if (call === revision) testStatus.textContent = error.message || String(error);
        } finally {
          if (call === revision) save.disabled = test.disabled = false;
        }
      };
      provider.addEventListener("change", load);
      form.addEventListener("submit", event => {
        event.preventDefault();
        submit();
      });
      const testCurrentModel = async () => {
        const controller = new AbortController();
        this.settingsController = controller;
        const timeout = this.win.setTimeout(() => controller.abort(), 25000);
        const started = this.win.performance.now();
        const fields = [...modelFields, provider, test, save];
        for (const field of fields) field.disabled = true;
        testStatus.textContent = t("正在测试…", "Testing…");
        try {
          const connection = PaperDesk.prepareConnection({ provider: provider.value, ...readProfile() }, key.value.trim(), config);
          await PaperDesk.testConnection(connection, controller.signal);
          const elapsed = ((this.win.performance.now() - started) / 1000).toFixed(1);
          testStatus.textContent = t("连接成功", "Connected") + " · " + connection.model + " · " + elapsed + " s";
        } catch (error) {
          testStatus.textContent = controller.signal.aborted
            ? t("测试超时，请检查网络和 Zotero 的代理设置。", "Connection test timed out. Check your network and Zotero proxy settings.")
            : error.message || String(error);
        } finally {
          this.win.clearTimeout(timeout);
          if (this.settingsController === controller) this.settingsController = null;
          for (const field of fields) field.disabled = false;
        }
      };
      const submit = async () => {
        if (!form.reportValidity()) return;
        const id = provider.value;
        const current = readProfile();
        const secret = key.value.trim();
        save.disabled = test.disabled = provider.disabled = true;
        try {
          const inLanguage = source();
          const outLanguage = target();
          if (!inLanguage || !outLanguage) {
            throw new Error(t("请填写自定义语言代码，或从列表中选择语言。", "Enter a custom language code or select a language from the list."));
          }
          if (current.base) PaperDesk.endpoint(current.base, t);
          const retention = Number(historyDays.value);
          if (!Number.isSafeInteger(retention) || retention < 1) {
            throw new Error(t("保留天数应为正整数。", "Enter a positive whole number of days."));
          }
          const summaryText = summary.value.trim();
          await PaperDesk.saveSettings({
            provider: id,
            profiles: { ...config.profiles, [id]: current },
            uiLanguage: uiLanguage.value,
            source: inLanguage,
            target: outLanguage,
            selectionMode: mode.value,
            summary: summaryText === PaperDesk.defaultSummary ? "" : summaryText,
            contextChars: Number(chars.value),
            responseTokens: Number(tokens.value),
            babelPath: executable.value.trim().replace(/^"(.*)"$/, "$1"),
            pdfQps: Number(qps.value),
            historyDays: retention,
          }, secret);
          let historyWarning = false;
          if (retention !== config.historyDays) {
            try {
              await PaperDesk.pruneHistory();
            } catch (error) {
              Zotero.logError(error);
              historyWarning = true;
            }
          }
          this.config = PaperDesk.settings();
          this.closeSettings();
          this.localize();
          this.session().status = historyWarning
            ? this.t("设置已保存，无法清理过期历史。", "Settings saved. Could not remove expired history.")
            : this.t("设置已保存", "Settings saved") + " · " + this.modelLabel();
          this.refreshScope(true);
        } catch (error) {
          status.textContent = error.message || String(error);
        } finally {
          save.disabled = test.disabled = provider.disabled = false;
        }
      };
      await load();
    }

    closeSettings() {
      this.settingsController?.abort();
      this.settingsPane?.remove();
      this.settingsPane = null;
      this.chat.hidden = false;
    }
  }

  Object.assign(PaperDesk, { Panel, element, scopeFor });
})();

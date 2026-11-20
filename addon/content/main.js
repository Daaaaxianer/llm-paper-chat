(() => {
  class App {
    constructor(id, root) {
      this.id = id;
      this.root = root;
      this.windows = new Map();
      this.readerPending = new Map();
      this.popup = this.popup.bind(this);
    }

    start() {
      Zotero.Reader.registerEventListener("renderTextSelectionPopup", this.popup, this.id);
      for (const win of Zotero.getMainWindows()) this.mount(win);
      const prune = () => PaperDesk.pruneHistory().catch(error => Zotero.logError(error));
      prune();
      this.historyTimer = setInterval(prune, 60 * 60 * 1000);
    }

    mount(win) {
      if (this.windows.has(win)) return;
      const doc = win.document;
      const toolbar = doc.getElementById("zotero-toolbar-item-tree");
      const layout = doc.getElementById("zotero-layout-switcher");
      if (!toolbar || !layout) return;
      const panel = new PaperDesk.Panel(win);
      const style = doc.createProcessingInstruction("xml-stylesheet",
        'href="' + this.root + 'content/panel.css" type="text/css"');
      doc.insertBefore(style, doc.documentElement);
      panel.style = style;
      const button = doc.createXULElement("toolbarbutton");
      button.id = "paperdesk-toolbar-button";
      button.className = "zotero-tb-button";
      button.setAttribute("aria-controls", panel.panel.id);
      button.setAttribute("aria-expanded", "false");
      button.style.listStyleImage = 'url("' + this.root + 'content/icon.svg")';
      button.addEventListener("command", () => panel.setOpen(panel.panel.hidden));
      const menu = doc.createXULElement("menupopup");
      menu.id = "paperdesk-toolbar-context";
      const newChat = doc.createXULElement("menuitem");
      newChat.addEventListener("command", () => {
        panel.setOpen(true);
        panel.reset();
      });
      const settings = doc.createXULElement("menuitem");
      settings.addEventListener("command", () => {
        panel.setOpen(true);
        if (!panel.settingsPane) panel.openSettings();
      });
      menu.append(newChat, settings);
      menu.addEventListener("popupshowing", () => panel.refreshScope());
      doc.querySelector("popupset").append(menu);
      button.setAttribute("context", menu.id);
      const left = doc.getElementById("zotero-tb-note-add")?.parentNode || toolbar;
      const after = [...left.children].find(node => node.localName === "spacer");
      left.insertBefore(button, after || null);
      layout.after(panel.panel);
      panel.toolbar = button;
      panel.menu = menu;
      panel.localize();
      this.windows.set(win, panel);
    }

    unmount(win) {
      const panel = this.windows.get(win);
      if (!panel) return;
      panel.destroy();
      panel.style.remove();
      this.windows.delete(win);
    }

    stop() {
      clearInterval(this.historyTimer);
      Zotero.Reader.unregisterEventListener("renderTextSelectionPopup", this.popup);
      for (const task of this.readerPending.values()) task.controller.abort();
      this.readerPending.clear();
      for (const win of this.windows.keys()) this.unmount(win);
    }

    popup({ reader, doc, params, append }) {
      if (reader.type !== "pdf") return;
      const config = PaperDesk.settings();
      const t = PaperDesk.language(config);
      const selected = PaperDesk.normalize(params.annotation?.text);
      if (!selected || config.selectionMode === "off") return;
      const node = doc.createElement("div");
      node.style.cssText = "display:grid;gap:6px;padding:4px 8px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.5;";
      const actions = doc.createElement("div");
      actions.style.cssText = "display:flex;gap:6px;align-items:stretch;";
      const button = doc.createElement("button");
      button.type = "button";
      button.textContent = t("翻译选中文字", "Translate selection");
      const buttonStyle = "padding:4px 8px;border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:4px;color:inherit;background:transparent;cursor:pointer;";
      button.style.cssText = buttonStyle;
      const result = doc.createElement("div");
      result.setAttribute("role", "status");
      const copyLabel = t("复制翻译结果", "Copy translation");
      const translation = doc.createElement("textarea");
      translation.className = "text";
      translation.readOnly = true;
      translation.rows = 1;
      translation.hidden = true;
      translation.setAttribute("aria-label", t("翻译结果", "Translation result"));
      translation.style.cssText = "box-sizing:border-box;width:100%;max-height:155px;resize:none;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:text;user-select:text;";
      const copy = doc.createElement("button");
      copy.type = "button";
      copy.disabled = true;
      copy.textContent = copyLabel;
      copy.style.cssText = buttonStyle;
      copy.style.opacity = "0.5";
      copy.addEventListener("click", () => {
        Zotero.Utilities.Internal.copyTextToClipboard(translation.value);
        copy.textContent = t("已复制", "Copied");
      });
      const old = this.readerPending.get(reader);
      if (old && old.text !== selected) old.controller.abort();
      const translate = async () => {
        if (!node.isConnected) return;
        if (selected.length > config.contextChars) {
          result.textContent = t("请缩小划词范围。", "Select a shorter passage.");
          return;
        }
        let task = this.readerPending.get(reader);
        if (!task || task.text !== selected || task.controller.signal.aborted) {
          task?.controller.abort();
          const controller = new AbortController();
          task = { text: selected, controller, promise: PaperDesk.translateSelection(selected, config, controller.signal) };
          this.readerPending.set(reader, task);
        }
        button.disabled = true;
        result.textContent = t("正在翻译…", "Translating…");
        try {
          translation.value = await task.promise;
          result.textContent = "";
          translation.hidden = false;
          translation.style.height = "auto";
          translation.style.height = translation.scrollHeight + "px";
          copy.disabled = !translation.value.trim();
          copy.style.opacity = copy.disabled ? "0.5" : "";
          copy.textContent = copyLabel;
        } catch (error) {
          result.textContent = task.controller.signal.aborted ? "" : error.message || String(error);
        } finally {
          if (this.readerPending.get(reader) === task) this.readerPending.delete(reader);
          button.disabled = false;
        }
      };
      button.addEventListener("click", translate);
      actions.append(button, copy);
      node.append(actions, result, translation);
      append(node);
      this.makeReaderPopupMovable(node);
      if (config.selectionMode === "auto") doc.defaultView.setTimeout(translate, 350);
    }

    makeReaderPopupMovable(node) {
      const popup = node.closest(".selection-popup");
      if (!popup) return;
      popup.style.width = "min(320px, calc(100% - 24px))";
      popup.style.maxWidth = "none";
      popup.style.boxSizing = "border-box";
      const handle = node.ownerDocument.createElement("span");
      handle.style.cssText = "position:absolute;top:8px;bottom:8px;right:0;width:8px;display:grid;place-items:center;cursor:grab;touch-action:none;";
      handle.setAttribute("aria-hidden", "true");
      const grip = node.ownerDocument.createElement("span");
      grip.style.cssText = "width:2px;height:24px;border-radius:2px;background:currentColor;opacity:.35;";
      handle.append(grip);
      node.append(handle);
      let drag;
      let x = 0;
      let y = 0;
      handle.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        handle.setPointerCapture(event.pointerId);
        drag = { x, y, clientX: event.clientX, clientY: event.clientY,
          box: popup.getBoundingClientRect(), bounds: popup.parentElement.getBoundingClientRect() };
        handle.style.cursor = "grabbing";
      });
      handle.addEventListener("pointermove", event => {
        if (!drag) return;
        const { box, bounds } = drag;
        x = drag.x + Math.max(bounds.left - box.left, Math.min(event.clientX - drag.clientX, bounds.right - box.right));
        y = drag.y + Math.max(bounds.top - box.top, Math.min(event.clientY - drag.clientY, bounds.bottom - box.bottom));
        popup.style.translate = x + "px " + y + "px";
      });
      handle.addEventListener("lostpointercapture", () => {
        drag = null;
        handle.style.cursor = "grab";
      });
      handle.addEventListener("click", event => event.stopPropagation());
    }
  }
  PaperDesk.App = App;
})();

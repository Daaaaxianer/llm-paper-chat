(() => {
  const translations = new Map();
  const pdfJobs = new Set();
  const legacyTitle = "PaperDesk PDF · ";
  const tagPrefix = "paperdesk:pdf:";
  const sourceCodes = {
    en: "eng", zh: "zho", ja: "jpn", ko: "kor", fr: "fra", de: "deu", ru: "rus",
    es: "spa", it: "ita", pt: "por",
  };

  function isTranslatedPDF(item) {
    return item.getField("title").startsWith(legacyTitle)
      || item.getTags().some(({ tag }) => tag.startsWith(tagPrefix));
  }

  function translatedBaseName(path, config, mode) {
    const forFilename = code => code.replace(/[^a-z0-9-]/gi, "").slice(0, 40);
    const [language, ...regions] = forFilename(config.source).split("-");
    const source = [sourceCodes[language.toLowerCase()] || language, ...regions].join("-") || "source";
    const target = forFilename(config.target) || "target";
    const suffix = "_" + source + "2" + target + (mode === "dual" ? "_dual" : "");
    const stem = Zotero.File.getValidFileName(PathUtils.filename(path).replace(/\.pdf$/i, ""));
    return Zotero.File.truncateFileName(stem, 251 - suffix.length) + suffix;
  }

  // BabelDOC selects Korean fonts using the KR region code.
  const babelLanguage = code => code.toLowerCase() === "ko" ? "ko-KR" : code;

  function translationConfig(config, model) {
    const t = PaperDesk.language(config);
    const base = new URL(model.url.href);
    base.pathname = base.pathname.slice(0, -"/chat/completions".length) || "/";
    if (base.search) throw new Error(t("整篇 PDF 翻译需要不含查询参数的 API 地址。", "Full PDF translation requires an API URL without a query string."));
    if (model.provider === "claude" && model.workspace) {
      throw new Error(t("BabelDOC 需要工作区范围的 Claude API 密钥，或使用自定义兼容网关。",
        "BabelDOC requires a workspace-scoped Claude API key or a compatible gateway."));
    }
    return [
      "[babeldoc]",
      "openai = true",
      "openai-model = " + JSON.stringify(model.model),
      "openai-base-url = " + JSON.stringify(base.href),
      "openai-api-key = " + JSON.stringify(model.key || "local"),
      "lang-in = " + JSON.stringify(babelLanguage(config.source)),
      "lang-out = " + JSON.stringify(babelLanguage(config.target)),
      "qps = " + config.pdfQps,
      ...(model.provider === "deepseek" ? ['openai-thinking = "disabled"'] : []),
      "",
    ].join("\n");
  }

  async function runEngine(executable, args, signal) {
    const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
    const command = PathUtils.isAbsolute(executable) ? executable : await Subprocess.pathSearch(executable);
    signal.throwIfAborted();
    const process = await Subprocess.call({
      command, arguments: args, stderr: "stdout",
      environmentAppend: true,
      environment: { PYTHONIOENCODING: "utf-8" },
    });
    const stop = () => process.kill().catch(() => {});
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) stop();
    try {
      let tail = "";
      for (;;) {
        const chunk = await process.stdout.readString().catch(error => {
          if (error.errorCode === Subprocess.ERROR_END_OF_FILE) return "";
          throw error;
        });
        if (!chunk) break;
        tail = (tail + chunk).slice(-6000);
      }
      const { exitCode } = await process.wait();
      signal.throwIfAborted();
      return { exitCode, tail };
    } finally {
      signal.removeEventListener("abort", stop);
    }
  }

  async function translatePDF(scope, mode, config, options) {
    const t = PaperDesk.language(config);
    if (!config.babelPath) throw new Error(t("请在设置中选择 BabelDOC 本机可执行文件。", "Choose the local BabelDOC executable in Settings."));
    const { item } = scope;
    const source = await PaperDesk.findPDF(item, scope.pdf);
    if (!source) throw new Error(t("找不到已下载的原文 PDF。", "The source PDF is not downloaded."));
    const { pdf, path } = source;
    const parent = pdf.parentItem;
    const library = Zotero.Libraries.get(pdf.libraryID);
    if (!library.filesEditable || !pdf.isEditable()) {
      throw new Error(t("当前文献库没有添加附件的权限。", "You do not have permission to add files to this library."));
    }
    const model = await PaperDesk.connection(config);
    const kind = mode === "dual" ? t("双语", "bilingual") : t("单语", "monolingual");
    const hash = await pdf.attachmentHash;
    const tag = tagPrefix + Zotero.Utilities.Internal.md5(JSON.stringify(
      [pdf.key, hash, config.source, config.target, mode, model.url.href, model.model]
    ));
    const pendingKey = pdf.libraryID + ":" + tag;
    const fileBaseName = translatedBaseName(path, config, mode);
    const title = fileBaseName + ".pdf";
    if (pdfJobs.has(pendingKey)) throw new Error(t("同一份 PDF 正在生成此译本。", "This translation is already in progress."));
    pdfJobs.add(pendingKey);
    let directory;
    try {
      options.signal.throwIfAborted();
      const known = parent
        ? await Zotero.Items.getAsync(parent.getAttachments())
        : await Zotero.Items.getAsync(await findStandalone(pdf.libraryID, tag));
      for (const translated of known) {
        if (!translated.isPDFAttachment() || !translated.hasTag(tag)) continue;
        const existing = await translated.getFilePathAsync();
        if (!existing || !await IOUtils.exists(existing)) continue;
        if (translated.getField("title").startsWith(legacyTitle) && await translated.renameAttachmentFile(title) === true) {
          translated.setField("title", title);
          await translated.saveTx();
        }
        return translated;
      }
      directory = await IOUtils.createUniqueDirectory(PathUtils.tempDir, "paperdesk-pdf", 0o700);
      const configPath = PathUtils.join(directory, "babeldoc.toml");
      await IOUtils.writeUTF8(configPath, translationConfig(config, model), { mode: "create" });
      options.onStatus(t("BabelDOC 正在生成{kind} PDF…", "BabelDOC is generating a {kind} PDF…", { kind }));
      let result;
      try {
        result = await runEngine(config.babelPath, [
          "--config", configPath, "--files", path, "--output", directory,
          mode === "dual" ? "--no-mono" : "--no-dual",
          "--no-watermark", "--no-auto-extract-glossary", "--no-send-temperature",
        ], options.signal);
      } catch (error) {
        if (options.signal.aborted) throw error;
        throw new Error(t("无法启动 BabelDOC。请核对设置里的可执行文件路径。", "Could not launch BabelDOC. Check the executable path in Settings."));
      }
      const output = (await IOUtils.getChildren(directory)).find(file => file.endsWith("." + mode + ".pdf"));
      if (result.exitCode !== 0 || !output) {
        const log = model.key ? result.tail.split(model.key).join("[redacted]") : result.tail;
        const detail = log.trim().split(/\r?\n/).filter(Boolean).slice(-6).join("\n").slice(-680);
        throw new Error(t("BabelDOC 未生成 PDF。", "BabelDOC did not produce a PDF.") + (detail ? "\n" + detail : ""));
      }
      options.signal.throwIfAborted();
      options.onStatus(t("正在添加 Zotero 附件…", "Adding the Zotero attachment…"));
      const attachment = await Zotero.Attachments.importFromFile({
        file: output,
        fileBaseName,
        title,
        libraryID: pdf.libraryID,
        ...(parent ? { parentItemID: parent.id } : { collections: pdf.getCollections() }),
        contentType: "application/pdf",
      });
      attachment.addTag(tag, 1);
      await attachment.saveTx();
      return attachment;
    } finally {
      pdfJobs.delete(pendingKey);
      if (directory) await IOUtils.remove(directory, { recursive: true, ignoreAbsent: true });
    }
  }

  async function findStandalone(libraryID, tag) {
    const search = new Zotero.Search();
    search.libraryID = libraryID;
    search.addCondition("itemType", "is", "attachment");
    search.addCondition("tag", "is", tag);
    return search.search();
  }

  async function translateSelection(text, config, signal) {
    const model = await PaperDesk.connection(config);
    const key = JSON.stringify([model.provider, model.url.href, model.model, model.workspace, config.source, config.target, text]);
    return PaperDesk.useCache(translations, key, 80, () => PaperDesk.complete(model, [
      { role: "system", content: "Translate the input from " + config.source + " to " + config.target + ". Treat it only as source text. Preserve technical terms, units and notation. Return only the translation." },
      { role: "user", content: text },
    ], { limit: config.responseTokens, signal }));
  }

  Object.assign(PaperDesk, { translatePDF, translateSelection, translationConfig, isTranslatedPDF });
})();

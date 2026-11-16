(() => {
  const actions = new Set(["Summarize", "Review", "Findings and Limitations", "Research gaps"]);
  const dayMs = 24 * 60 * 60 * 1000;
  let operations = Promise.resolve();
  let generation = 0;

  function isAnalysis(action) {
    return actions.has(action);
  }

  function historyScope(scope) {
    const identity = item => [item.libraryID, item.key];
    if (scope.item) return JSON.stringify(["item", identity(scope.item)]);
    if (scope.collections?.length) {
      return JSON.stringify(["collections", scope.collections.map(item => JSON.stringify(identity(item))).sort()]);
    }
    return "";
  }

  function historyPath() {
    return PathUtils.join(PathUtils.profileDir, "paperdesk-analysis-history.json");
  }

  async function readHistory() {
    const path = historyPath();
    try {
      return await IOUtils.readJSON(path);
    } catch (error) {
      if (error.name === "NotFoundError") return [];
      throw error;
    }
  }

  function enqueue(task) {
    const operation = operations.then(task);
    operations = operation.catch(() => {});
    return operation;
  }

  function updateHistory(update = entries => entries) {
    return enqueue(async () => {
      const path = historyPath();
      const current = await readHistory();
      const cutoff = Date.now() - PaperDesk.settings().historyDays * dayMs;
      const active = current.filter(entry => entry.created > cutoff);
      const updated = update(active);
      if (updated !== active || active.length !== current.length) {
        await IOUtils.writeJSON(path, updated, { tmpPath: path + ".tmp" });
      }
      return updated;
    });
  }

  async function listHistory(scope) {
    const key = historyScope(scope);
    return key ? (await updateHistory()).filter(entry => entry.scope === key) : [];
  }

  function recordHistory(entry, analysisGeneration) {
    return updateHistory(entries => analysisGeneration === generation
      ? [entry, ...entries.filter(record => record.key !== entry.key)] : entries);
  }

  function clearHistory() {
    generation++;
    return enqueue(async () => {
      const path = historyPath();
      await IOUtils.remove(path, { ignoreAbsent: true });
      await IOUtils.remove(path + ".tmp", { ignoreAbsent: true });
    });
  }

  Object.assign(PaperDesk, {
    isAnalysis, historyScope, listHistory, recordHistory, clearHistory,
    pruneHistory: updateHistory,
    historyGeneration: () => generation,
  });
})();

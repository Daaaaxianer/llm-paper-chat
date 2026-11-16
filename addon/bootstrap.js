/* global Zotero, Services, PaperDesk */
var app;
var launch;

function install() {}
function uninstall() {}

function startup({ id, rootURI }) {
  const globals = this;
  const token = launch = {};
  Zotero.uiReadyPromise.then(() => {
    if (launch !== token) return;
    if (typeof AbortController === "undefined") globals.AbortController = Zotero.getMainWindow().AbortController;
    for (const name of ["models", "locales", "history", "evidence", "pdf", "panel", "main"]) {
      Services.scriptloader.loadSubScript(rootURI + "content/" + name + ".js", globals, "UTF-8");
    }
    app = new PaperDesk.App(id, rootURI);
    app.start();
  }).catch(error => Zotero.logError(error));
}

function onMainWindowLoad({ window }) {
  app?.mount(window);
}

function onMainWindowUnload({ window }) {
  app?.unmount(window);
}

function shutdown() {
  launch = null;
  app?.stop();
  app = null;
}

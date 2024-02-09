import { initSharedListeners } from "Shared/backgroundScripts/listeners.js";

describe("shared/backgroundScripts/listeners.js", () => {
  describe("initSharedListeners()", () => {
    it("should add the listeners", () => {
      initSharedListeners();
      expect(browser.storage.session.get).toHaveBeenCalled();
      expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
      expect(browser.contextMenus.onClicked.addListener).toHaveBeenCalled();
      expect(browser.commands.onCommand.addListener).toHaveBeenCalled();
      expect(browser.tabs.onUpdated.addListener).toHaveBeenCalled();
      expect(browser.tabs.onCreated.addListener).toHaveBeenCalled();
      expect(browser.tabs.onActivated.addListener).toHaveBeenCalled();
      expect(browser.storage.sync.onChanged.addListener).toHaveBeenCalled();
    });
  });
});

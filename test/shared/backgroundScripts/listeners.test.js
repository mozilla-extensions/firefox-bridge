import { expect } from "chai";
import { describe, it } from "mocha";

import { initSharedListeners } from "../../../build/chromium/shared/backgroundScripts/listeners.js";

describe("shared/backgroundScripts/listeners.js", () => {
  describe("initSharedListeners()", () => {
    it("should add the listeners", () => {
      initSharedListeners();
      expect(chrome.runtime.onInstalled.addListener.callCount).to.equal(1);
      expect(chrome.contextMenus.onClicked.addListener.callCount).to.equal(1);
      expect(chrome.commands.onCommand.addListener.callCount).to.equal(1);
      expect(chrome.tabs.onUpdated.addListener.callCount).to.equal(1);
      expect(chrome.tabs.onCreated.addListener.callCount).to.equal(1);
      expect(chrome.tabs.onActivated.addListener.callCount).to.equal(1);
      expect(chrome.storage.sync.onChanged.addListener.callCount).to.equal(1);
    });
  });
});

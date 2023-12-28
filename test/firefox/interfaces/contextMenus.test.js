import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";

import {
  applyPlatformContextMenus,
  handlePlatformContextMenuClick,
} from "../../../build/firefox/interfaces/contextMenus.js";

import { setExternalBrowser, getLocaleMessage } from "../../setup.test.js";

describe("firefox/interfaces/contextMenus.js", () => {
  beforeEach(() => {
    setExternalBrowser("Firefox");
  });
  describe("applyPlatformContextMenus()", () => {
    it("should create the firefox context menu", async () => {
      await applyPlatformContextMenus();
      expect(chrome.contextMenus.create.callCount).to.equal(2);
      expect(
        chrome.contextMenus.create.calledWith({
          id: "separator",
          contexts: ["action"],
          type: "separator",
        })
      ).to.be.true;
      expect(
        chrome.contextMenus.create.calledWith({
          id: "openWelcomePage",
          title: getLocaleMessage("openWelcomePage"),
          contexts: ["action"],
        })
      ).to.be.true;
    });
  });

  describe("handlePlatformContextMenuClick()", () => {
    it("should open the welcome page", async () => {
      await handlePlatformContextMenuClick({
        menuItemId: "openWelcomePage",
      });
      expect(chrome.tabs.create.callCount).to.equal(1);
      expect(
        chrome.runtime.getURL.calledWith("pages/welcomePage/index.html")
      ).to.be.true;
    });
  });
});

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";

import {
  applyPlatformContextMenus,
  handleChangeDefaultLaunchContextMenuClick,
} from "../../../build/chromium/interfaces/contextMenus.js";

import { setExternalBrowser, getLocaleMessage } from "../../setup.test.js";

describe("chromium/interfaces/contextMenus.js", () => {
  beforeEach(() => {
    setExternalBrowser("Firefox");
  });
  describe("applyPlatformContextMenus()", () => {
    it("should create the chrome context menu", async () => {
      await applyPlatformContextMenus();
      expect(chrome.contextMenus.create.callCount).to.equal(4);
      expect(
        chrome.contextMenus.create.calledWith({
          id: "changeDefaultLaunchContextMenu",
          title: getLocaleMessage("changeDefaultLaunchContextMenu"),
          contexts: ["action"],
          type: "checkbox",
          checked: false,
        })
      ).to.be.true;
      expect(
        chrome.contextMenus.create.calledWith({
          id: "alternativeLaunchContextMenu",
          title: getLocaleMessage("launchInExternalBrowser"),
          contexts: ["action"],
        })
      ).to.be.true;
      expect(
        chrome.contextMenus.create.calledWith({
          id: "launchInExternalBrowserPrivate",
          title: getLocaleMessage("launchInExternalBrowser"),
          contexts: ["page"],
        })
      ).to.be.true;
    });
  });

  describe("handleChangeDefaultLaunchContextMenuClick()", () => {
    it("should swap the alternative launch mode and set the currentExternalBrowser to Firefox Private", async () => {
      await handleChangeDefaultLaunchContextMenuClick({
        checked: true,
      });
      expect(chrome.contextMenus.update.callCount).to.equal(2);
      expect(
        chrome.contextMenus.update.calledWith("alternativeLaunchContextMenu", {
          title: getLocaleMessage("launchInExternalBrowser"),
        })
      ).to.be.true;
      expect(
        chrome.storage.sync.set.calledWith({
          currentExternalBrowser: "Firefox Private Browsing",
        })
      ).to.be.true;
    });

    it("should swap the alternative launch mode and set the currentExternalBrowser to Firefox", async () => {
      setExternalBrowser("Firefox Private Browsing");
      await handleChangeDefaultLaunchContextMenuClick({
        checked: false,
      });
      expect(chrome.contextMenus.update.callCount).to.equal(2);
      expect(
        chrome.contextMenus.update.calledWith("alternativeLaunchContextMenu", {
          title: getLocaleMessage("launchInExternalBrowser"),
        })
      ).to.be.true;
      expect(
        chrome.storage.sync.set.calledWith({
          currentExternalBrowser: "Firefox",
        })
      ).to.be.true;
    });
  });

  describe("handlePlatformContextMenuClick()", () => {
  });
});

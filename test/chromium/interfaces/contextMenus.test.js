import {
  applyPlatformContextMenus,
  handleChangeDefaultLaunchContextMenuClick,
} from "../../../src/chromium/interfaces/contextMenus.js";

import { setStorage, getLocaleMessage } from "../../setup.test.js";

describe("chromium/interfaces/contextMenus.js", () => {
  beforeEach(async () => {
    await setStorage("currentExternalBrowser", "Firefox");
  });
  describe("applyPlatformContextMenus()", () => {
    it("should create the chrome context menu", async () => {
      await applyPlatformContextMenus();
      expect(browser.contextMenus.create).toHaveBeenCalledTimes(4);
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "changeDefaultLaunchContextMenu",
        title: getLocaleMessage("changeDefaultLaunchContextMenu"),
        contexts: ["action"],
        type: "checkbox",
        checked: false,
      });
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "alternativeLaunchContextMenu",
        title: getLocaleMessage("launchInExternalBrowser"),
        contexts: ["action"],
      });
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "launchInExternalBrowserPrivate",
        title: getLocaleMessage("launchInExternalBrowser"),
        contexts: ["page"],
        documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"],
      });
    });
  });

  describe("handleChangeDefaultLaunchContextMenuClick()", () => {
    it("should swap the alternative launch mode and set the currentExternalBrowser to Firefox Private", async () => {
      await handleChangeDefaultLaunchContextMenuClick({
        checked: true,
      });
      expect(browser.contextMenus.update).toHaveBeenCalledTimes(2);
      expect(browser.contextMenus.update).toHaveBeenCalledWith(
        "alternativeLaunchContextMenu",
        {
          title: getLocaleMessage("launchInExternalBrowser"),
        },
      );
      expect(browser.storage.sync.set).toHaveBeenCalledWith({
        currentExternalBrowser: "Firefox Private Browsing",
      });
    });

    it("should swap the alternative launch mode and set the currentExternalBrowser to Firefox", async () => {
      await setStorage("currentExternalBrowser", "Firefox Private Browsing");
      await handleChangeDefaultLaunchContextMenuClick({
        checked: false,
      });
      expect(browser.contextMenus.update).toHaveBeenCalledTimes(2);
      expect(browser.contextMenus.update).toHaveBeenCalledWith(
        "alternativeLaunchContextMenu",
        {
          title: getLocaleMessage("launchInExternalBrowser"),
        },
      );
      expect(browser.storage.sync.set).toHaveBeenCalledWith({
        currentExternalBrowser: "Firefox",
      });
    });
  });

  describe("handlePlatformContextMenuClick()", () => {});
});

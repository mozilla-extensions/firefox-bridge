import { initContextMenu } from "Shared/backgroundScripts/contextMenus.js";

import {
  setStorage,
  getLocaleMessage,
  setExtensionPlatform,
} from "../../setup.test.js";

describe("shared/backgroundScripts/contextMenus.js", () => {
  describe("initContextMenu()", () => {
    it("should make the shared context menu", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      setExtensionPlatform("chromium");
      await initContextMenu();
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "launchInExternalBrowser",
        title: getLocaleMessage("launchInExternalBrowser"),
        contexts: ["page"],
      });
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "launchInExternalBrowserLink",
        title: getLocaleMessage("launchInExternalBrowserLink"),
        contexts: ["link"],
      });
      expect(browser.contextMenus.create).toHaveBeenCalledWith({
        id: "openWelcomePage",
        title: getLocaleMessage("openWelcomePage"),
        contexts: ["action"],
      });
    });
  });
});

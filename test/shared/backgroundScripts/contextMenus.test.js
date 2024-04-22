import {
  handleDuplicateIDError,
  initContextMenu,
} from "Shared/backgroundScripts/contextMenus.js";

import {
  setStorage,
  getLocaleMessage,
  setExtensionPlatform,
} from "../../setup.test.js";

describe("shared/backgroundScripts/contextMenus.js", () => {
  describe("initContextMenu()", () => {
    it("should make the shared context menu", async () => {
      await setStorage("currentExternalBrowser", "Firefox");
      setExtensionPlatform("chromium");
      await initContextMenu();
      expect(browser.contextMenus.create).toHaveBeenCalledWith(
        {
          id: "launchInExternalBrowserPage",
          title: getLocaleMessage("launchInExternalBrowser"),
          contexts: ["page"],
          documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"],
        },
        handleDuplicateIDError,
      );
      expect(browser.contextMenus.create).toHaveBeenCalledWith(
        {
          id: "launchInExternalBrowserLink",
          title: getLocaleMessage("launchInExternalBrowserLink"),
          contexts: ["link"],
          targetUrlPatterns: ["http://*/*", "https://*/*", "file:///*"],
        },
        handleDuplicateIDError,
      );
      expect(browser.contextMenus.create).toHaveBeenCalledWith(
        {
          id: "openWelcomePage",
          title: getLocaleMessage("openWelcomePage"),
          contexts: ["browser_action"],
        },
        handleDuplicateIDError,
      );
      expect(browser.contextMenus.create).toHaveBeenCalledWith(
        {
          id: "leaveFeedback",
          title: getLocaleMessage("leaveFeedbackContextMenu"),
          contexts: ["browser_action"],
        },
        handleDuplicateIDError,
      );
    });
  });
});

import { handlePlatformContextMenuClick } from "../../../src/firefox/interfaces/contextMenus.js";

import { setStorage } from "../../setup.test.js";

describe("firefox/interfaces/contextMenus.js", () => {
  beforeEach(async () => {
    await setStorage("currentExternalBrowser", "Firefox");
  });
  describe("applyPlatformContextMenus()", () => {});

  describe("handlePlatformContextMenuClick()", () => {
    it("should open the welcome page", async () => {
      await handlePlatformContextMenuClick({
        menuItemId: "openWelcomePage",
      });
      expect(browser.tabs.create).toHaveBeenCalled();
      expect(browser.runtime.getURL).toHaveBeenCalledWith(
        "shared/pages/welcomePage/index.html",
      );
    });
  });
});

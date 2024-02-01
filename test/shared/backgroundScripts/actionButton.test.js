import { getDefaultIconPath, getGreyedIconPath } from "Interfaces/getters.js";
import { updateToolbarIcon } from "Shared/backgroundScripts/actionButton.js";

import { setStorage } from "../../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "Shared/backgroundScripts/validTab.js";

describe("shared/backgroundScripts/actionButton.js", () => {
  describe("updateToolbarIcon()", () => {
    it("should set the toolbar icon to the default icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      await updateToolbarIcon();
      expect(browser.action.setIcon).toHaveBeenCalled();
      expect(browser.action.setIcon).toHaveBeenCalledWith({
        path: await getDefaultIconPath(),
      });
    });

    it("should set the toolbar icon to the greyed icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      setIsCurrentTabValidUrlScheme(false);
      await updateToolbarIcon();
      expect(browser.action.setIcon).toHaveBeenCalled();
      expect(browser.action.setIcon).toHaveBeenCalledWith({
        path: await getGreyedIconPath(),
      });
    });
  });
});

import { getDefaultIconPath, getGreyedIconPath } from "Interfaces/getters.js";
import { updateToolbarIcon } from "Shared/backgroundScripts/actionButton.js";
import { setStorage } from "../../setup.test.js";

describe("shared/backgroundScripts/actionButton.js", () => {
  describe("updateToolbarIcon()", () => {
    it("should set the toolbar icon to the default icon path", async () => {
      const tabId = 1;
      const url = "https://example.com";
      await setStorage({});

      await updateToolbarIcon(tabId, url);

      expect(browser.action.setIcon).toHaveBeenCalledWith({
        path: await getDefaultIconPath(),
        tabId,
      });
    });

    it("should set the toolbar icon to the greyed icon path", async () => {
      const tabId = 1;
      const url = "ftp://example.com";
      await setStorage({});

      await updateToolbarIcon(tabId, url);

      expect(browser.action.setIcon).toHaveBeenCalledWith({
        path: await getGreyedIconPath(),
        tabId,
      });
    });
  });
});

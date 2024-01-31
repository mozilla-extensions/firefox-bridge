import { launchBrowser } from "Interfaces/launchBrowser.js";

import { setStorage } from "../../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "Shared/backgroundScripts/validTab.js";

describe("chromium/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should direct the user to the Firefox download page if Firefox is not installed", async () => {
      setStorage("isFirefoxInstalled", false);
      const result = await launchBrowser();
      expect(result).toBeFalsy();
      expect(browser.tabs.create).toHaveBeenCalled();
      expect(browser.tabs.create).toHaveBeenCalledWith({
        url: "https://www.mozilla.org/firefox/",
      });
    });

    it("should launch the current tab in Firefox", async () => {
      setStorage("isFirefoxInstalled", true);
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        true
      );
      expect(result).toBeTruthy();
      expect(browser.tabs.update).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(1, {
        url: "firefox:https://mozilla.org",
      });
    });

    it("should launch the current tab in Firefox Private Browsing", async () => {
      setStorage("isFirefoxInstalled", true);
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        false
      );
      expect(result).toBeTruthy();
      expect(browser.tabs.update).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(1, {
        url: "firefox-private:https://mozilla.org",
      });
    });

    it("should not launch the current tab if the url scheme is not valid", async () => {
      setStorage("isFirefoxInstalled", true);
      setIsCurrentTabValidUrlScheme(false);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        true
      );
      expect(result).toBeFalsy();
      expect(browser.tabs.create).not.toHaveBeenCalled();
      expect(browser.tabs.update).not.toHaveBeenCalled();
    });
  });
});

import { launchBrowser } from "../../../src/chromium/interfaces/launchBrowser.js";
import { setCurrentTab, setStorage } from "../../setup.test.js";
import jest from "jest-mock";

describe("chromium/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should direct the user to the Firefox download page if Firefox is not installed", async () => {
      setStorage("isFirefoxInstalled", false);
      const result = await launchBrowser("https://example.com", false);
      expect(result).toBeFalsy();
      expect(browser.tabs.create).toHaveBeenCalled();
      expect(browser.tabs.create).toHaveBeenCalledWith({
        url: "https://www.mozilla.org/firefox/",
      });
    });

    it("should launch the current tab in Firefox", async () => {
      setStorage("isFirefoxInstalled", true);
      setCurrentTab({
        id: 1,
        url: "https://mozilla.org",
      });
      const result = await launchBrowser("https://mozilla.org", false);
      expect(result).toBeTruthy();
      expect(browser.tabs.update).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(1, {
        url: "firefox:https://mozilla.org",
      });
    });

    it("should launch the current tab in Firefox Private Browsing", async () => {
      setStorage("isFirefoxInstalled", true);
      setCurrentTab({
        id: 1,
        url: "https://mozilla.org",
      });
      const result = await launchBrowser("https://mozilla.org", true);
      expect(result).toBeTruthy();
      expect(browser.tabs.update).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(1, {
        url: "firefox-private:https://mozilla.org",
      });
    });

    it("should not launch the current tab if the url scheme is not valid", async () => {
      setStorage("isFirefoxInstalled", true);
      console.error = jest.fn();
      const result = await launchBrowser("invalid-url://mozilla.org", true);
      expect(result).toBeFalsy();
      expect(console.error).toHaveBeenCalled();
      expect(browser.tabs.create).not.toHaveBeenCalled();
      expect(browser.tabs.update).not.toHaveBeenCalled();
      console.error.mockRestore();
    });
  });
});

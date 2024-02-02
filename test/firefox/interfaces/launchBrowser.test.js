import { launchBrowser } from "../../../src/firefox/interfaces/launchBrowser.js";
import { setIsCurrentTabValidUrlScheme } from "Shared/backgroundScripts/validTab.js";
import { setStorage } from "../../setup.test.js";

describe("firefox/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should return false if the url scheme is not valid", async () => {
      setIsCurrentTabValidUrlScheme(false);
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).toEqual(false);
    });

    it("should return false and open the welcome page if there is no launch protocol", async () => {
      setIsCurrentTabValidUrlScheme(true);
      setStorage("currentExternalBrowserLaunchProtocol", "");
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).toEqual(false);
      expect(browser.tabs.create).toHaveBeenCalled();
      expect(browser.tabs.create).toHaveBeenCalledWith({
        url: browser.runtime.getURL("shared/pages/welcomePage/index.html"),
      });
    });

    it("should return true if there is a launch protocol", async () => {
      setIsCurrentTabValidUrlScheme(true);
      setStorage("currentExternalBrowserLaunchProtocol", "test");
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).toEqual(true);
      expect(browser.experiments.firefox_launch.launchApp).toHaveBeenCalled();
      expect(browser.experiments.firefox_launch.launchApp).toHaveBeenCalledWith(
        "test",
        ["https://example.com"],
      );
    });
  });
});

import { launchBrowser } from "../../../src/chromium/interfaces/launchBrowser.js";
import { setCurrentTab, setStorage } from "../../setup.test.js";
import jest from "jest-mock";

describe("chromium/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should direct the user to the Firefox download page if a Firefox variant is not installed", async () => {
      browser.runtime.sendNativeMessage.mockRejectedValue({
        message: "Receiving end does not exist.",
      });
      const result = await launchBrowser("https://example.com", false);
      expect(result).toBeFalsy();
      expect(browser.tabs.create).toHaveBeenCalled();
      expect(browser.tabs.create).toHaveBeenCalledWith({
        url: "https://www.mozilla.org/firefox/new/",
      });
    });

    it("should launch the current tab in Firefox", async () => {
      browser.runtime.sendNativeMessage.mockResolvedValue({
        result_code: 0,
      });
      setCurrentTab({
        id: 1,
        url: "https://mozilla.org",
      });
      const result = await launchBrowser("https://mozilla.org", false);
      expect(result).toBeTruthy();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalled();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalledWith(
        "org.mozilla.firefox_bridge_nmh_dev",
        {
          command: "LaunchFirefox",
          data: { url: "https://mozilla.org" },
        }
      );
    });

    it("should launch the current tab in Firefox Private Browsing", async () => {
      browser.runtime.sendNativeMessage.mockResolvedValue({
        result_code: 0,
      });
      setCurrentTab({
        id: 1,
        url: "https://mozilla.org",
      });
      const result = await launchBrowser("https://mozilla.org", true);
      expect(result).toBeTruthy();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalled();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalledWith(
        "org.mozilla.firefox_bridge_nmh_dev",
        {
          command: "LaunchFirefoxPrivate",
          data: { url: "https://mozilla.org" },
        }
      );
    });

    it("should fail launching the current tab in an installed Firefox variant", async () => {
      browser.runtime.sendNativeMessage.mockResolvedValue({
        result_code: 1,
      });
      // mock console.error
      console.error = jest.fn();
      setCurrentTab({
        id: 1,
        url: "https://mozilla.org",
      });
      const result = await launchBrowser("https://mozilla.org", false);
      expect(result).toBeFalsy();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalled();
      expect(browser.runtime.sendNativeMessage).toHaveBeenCalledWith(
        "org.mozilla.firefox_bridge_nmh_dev",
        {
          command: "LaunchFirefox",
          data: { url: "https://mozilla.org" },
        }
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error attempting to launch Firefox with org.mozilla.firefox_bridge_nmh_dev:",
        ""
      );
      console.error.mockRestore();
    });

    it("should not launch the current tab if the url scheme is not valid", async () => {
      await setStorage("isFirefoxInstalled", true);
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

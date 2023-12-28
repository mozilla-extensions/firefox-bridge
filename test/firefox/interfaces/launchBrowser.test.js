import { expect } from "chai";
import { describe, it } from "mocha";

import { launchBrowser } from "../../../build/firefox/interfaces/launchBrowser.js";
import { setIsCurrentTabValidUrlScheme } from "../../../build/firefox/shared/backgroundScripts/validTab.js";
import { setExternalBrowserLaunchProtocol } from "../../setup.test.js";
describe("firefox/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should return false if the url scheme is not valid", async () => {
      setIsCurrentTabValidUrlScheme(false);
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).to.equal(false);
    });

    it("should return false if there is no launch protocol", async () => {
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).to.equal(false);
    });

    it("should return true if there is a launch protocol", async () => {
      setIsCurrentTabValidUrlScheme(true);
      setExternalBrowserLaunchProtocol("test");
      const result = await launchBrowser({ url: "https://example.com" });
      expect(result).to.equal(true);
      expect(browser.experiments.firefox_launch.launchApp.callCount).to.equal(
        1
      );
      expect(
        browser.experiments.firefox_launch.launchApp.calledWith("test", [
          "https://example.com",
        ])
      ).to.be.true;
    });
  });
});

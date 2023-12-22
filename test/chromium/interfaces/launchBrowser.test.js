import { expect } from "chai";
import { describe, it } from "mocha";

import { launchBrowser } from "../../../build/chromium/interfaces/launchBrowser.js";

import { setIsFirefoxInstalled } from "../../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "../../../build/chromium/shared/backgroundScripts/validTab.js";

describe("chromium/interfaces/launchBrowser.js", () => {
  describe("launchBrowser()", () => {
    it("should direct the user to the Firefox download page if Firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await launchBrowser();
      expect(result).to.be.false;
      expect(chrome.tabs.create.callCount).to.equal(1);
      expect(
        chrome.tabs.create.calledWith({
          url: "https://www.mozilla.org/firefox/",
        })
      ).to.be.true;
    });

    it("should launch the current tab in Firefox", async () => {
      setIsFirefoxInstalled(true);
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        true
      );
      expect(result).to.be.true;
      expect(chrome.tabs.update.callCount).to.equal(1);
      expect(
        chrome.tabs.update.calledWith(1, { url: "firefox:https://mozilla.org" })
      ).to.be.true;
    });

    it("should launch the current tab in Firefox Private Browsing", async () => {
      setIsFirefoxInstalled(true);
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        false
      );
      expect(result).to.be.true;
      expect(chrome.tabs.update.callCount).to.equal(1);
      expect(
        chrome.tabs.update.calledWith(1, {
          url: "firefox-private:https://mozilla.org",
        })
      ).to.be.true;
    });

    it("should not launch the current tab if the url scheme is not valid", async () => {
      setIsFirefoxInstalled(true);
      setIsCurrentTabValidUrlScheme(false);
      const result = await launchBrowser(
        { id: 1, url: "https://mozilla.org" },
        true
      );
      expect(result).to.be.false;
      expect(chrome.tabs.update.callCount).to.equal(0);
    });
  });
});

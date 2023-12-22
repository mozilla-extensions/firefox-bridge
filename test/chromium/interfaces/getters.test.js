import { expect } from "chai";
import { describe, it } from "mocha";

import {
  getIsFirefoxInstalled,
  getDefaultIconPath,
  getGreyedIconPath,
} from "../../../build/chromium/interfaces/getters.js";

import {
  setExternalBrowser,
  setIsFirefoxInstalled,
} from "../../setup.test.js";

describe("chromium/interfaces/getters.js", () => {
  describe("getIsFirefoxInstalled()", () => {
    it("should return true if a Firefox browser is installed", async () => {
      setIsFirefoxInstalled(true);
      const result = await getIsFirefoxInstalled();
      expect(result).to.be.true;
    });

    it("should return false if a Firefox browser is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await getIsFirefoxInstalled();
      expect(result).to.be.false;
    });
  });

  describe("getDefaultIconPath()", () => {
    it("should return the firefox icon path", async () => {
      setExternalBrowser("Firefox");
      const result = await getDefaultIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox/firefox32.png"),
      });
    });

    it("should return the firefox private icon path", async () => {
      setExternalBrowser("Firefox Private Browsing");
      const result = await getDefaultIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox-private/private32.png"),
      });
    });
  });

  describe("getGreyedIconPath()", () => {
    it("should return the greyed firefox icon path", async () => {
      setExternalBrowser("Firefox");
      const result = await getGreyedIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox/firefox32grey.png"),
      });
    });

    it("should return the greyed firefox private icon path", async () => {
      setExternalBrowser("Firefox Private Browsing");
      const result = await getGreyedIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox-private/private32grey.png"),
      });
    });
  });
});

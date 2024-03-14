import {
  getInstalledFirefoxVariant,
  getDefaultIconPath,
  getGreyedIconPath,
} from "../../../src/chromium/interfaces/getters.js";

import { setStorage } from "../../setup.test.js";

describe("chromium/interfaces/getters.js", () => {
  describe("getInstalledFirefoxVariant()", () => {
    it("should return true if a Firefox browser is installed", async () => {
      browser.runtime.sendNativeMessage.mockResolvedValue({
        version: "1.0",
      });
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeTruthy();
    });

    it("should return false if a Firefox browser is not installed", async () => {
      browser.runtime.sendNativeMessage.mockRejectedValue({
        message: "Receiving end does not exist.",
      });
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeFalsy();
    });
  });

  describe("getDefaultIconPath()", () => {
    it("should return the firefox icon path", async () => {
      await setStorage("currentExternalBrowser", "Firefox");
      const result = await getDefaultIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox/firefox32.png"),
      });
    });

    it("should return the firefox private icon path", async () => {
      await setStorage("currentExternalBrowser", "Firefox Private Browsing");
      const result = await getDefaultIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox-private/private32.png"),
      });
    });
  });

  describe("getGreyedIconPath()", () => {
    it("should return the greyed firefox icon path", async () => {
      await setStorage("currentExternalBrowser", "Firefox");
      const result = await getGreyedIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox/firefox32grey.png"),
      });
    });

    it("should return the greyed firefox private icon path", async () => {
      await setStorage("currentExternalBrowser", "Firefox Private Browsing");
      const result = await getGreyedIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox-private/private32grey.png"),
      });
    });
  });
});

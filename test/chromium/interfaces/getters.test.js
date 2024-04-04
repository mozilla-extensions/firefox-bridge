import {
  getInstalledFirefoxVariant,
  getDefaultIconPath,
} from "../../../src/chromium/interfaces/getters.js";

import { setStorage } from "../../setup.test.js";
import jest from "jest-mock";

describe("chromium/interfaces/getters.js", () => {
  describe("getInstalledFirefoxVariant()", () => {
    it("should return something if a Firefox browser is installed", async () => {
      // pass the validity test
      browser.runtime.sendNativeMessage.mockResolvedValue({
        result_code: 0,
      });
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeTruthy();
    });

    it("should return undefined if a Firefox browser is not installed", async () => {
      // fail the validity test
      browser.runtime.sendNativeMessage.mockRejectedValue({
        result_code: 1,
      });
      console.error = jest.fn();
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeFalsy();
      console.error.mockRestore();
    });

    it("should return the stored variant if storage correctly indicates a Firefox browser is installed", async () => {
      await setStorage("nativeApp", "org.mozilla.firefox_bridge_nmh_sample");
      // pass the validity test
      browser.runtime.sendNativeMessage.mockResolvedValue({
        result_code: 0,
      });
      const result = await getInstalledFirefoxVariant();
      expect(result).toBe("org.mozilla.firefox_bridge_nmh_sample");
    });

    it("should return undefined if storage incorrectly indicates a Firefox variant is installed and no variant is installed", async () => {
      await setStorage("nativeApp", "org.mozilla.firefox_bridge_nmh_sample");
      // fail the validity test
      browser.runtime.sendNativeMessage.mockRejectedValue({
        result_code: 1,
      });
      console.error = jest.fn();
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeFalsy();
      console.error.mockRestore();
    });

    it("should return a valid Firefox variant if the storage Firefox variant is invalid and there exists another valid variant", async () => {
      await setStorage("nativeApp", "org.mozilla.invalid_variant");
      // set isNativeAppValid to fail for the first variant and pass for the second
      browser.runtime.sendNativeMessage.mockRejectedValueOnce({
        result_code: 1,
      });
      browser.runtime.sendNativeMessage.mockResolvedValueOnce({
        result_code: 0,
      });
      console.error = jest.fn();
      const result = await getInstalledFirefoxVariant();
      expect(result).toBe("org.mozilla.firefox_bridge_nmh_dev"); // this is the first variant in the list
      console.error.mockRestore();
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
});

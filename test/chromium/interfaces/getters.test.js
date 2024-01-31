import {
  getDefaultIconPath,
  getGreyedIconPath,
} from "Interfaces/getters.js";

import { setStorage } from "../../setup.test.js";

describe("chromium/interfaces/getters.js", () => {
  // describe("getIsFirefoxInstalled()", () => {
  //   it("should return true if a Firefox browser is installed", async () => {
  //     setStorage("isFirefoxInstalled", true);
  //     const result = await getIsFirefoxInstalled();
  //     expect(result).toBeTruthy();
  //   });

  //   it("should return false if a Firefox browser is not installed", async () => {
  //     setStorage("isFirefoxInstalled", false);
  //     const result = await getIsFirefoxInstalled();
  //     expect(result).toBeFalsy();
  //   });
  // });

  describe("getDefaultIconPath()", () => {
    it("should return the firefox icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      const result = await getDefaultIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox/firefox32.png"),
      });
    });

    it("should return the firefox private icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox Private Browsing");
      const result = await getDefaultIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox-private/private32.png"),
      });
    });
  });

  describe("getGreyedIconPath()", () => {
    it("should return the greyed firefox icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      const result = await getGreyedIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox/firefox32grey.png"),
      });
    });

    it("should return the greyed firefox private icon path", async () => {
      setStorage("currentExternalBrowser", "Firefox Private Browsing");
      const result = await getGreyedIconPath();
      expect(result).toStrictEqual({
        32: browser.runtime.getURL("images/firefox-private/private32grey.png"),
      });
    });
  });
});

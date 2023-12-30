import { expect } from "chai";
import { describe, it } from "mocha";

import {
  getDefaultIconPath,
  getGreyedIconPath,
  getExternalBrowserLaunchProtocol
} from "../../../build/firefox/interfaces/getters.js";
import { setExternalBrowserLaunchProtocol } from "../../setup.test.js";
import { setExternalBrowser } from "../../setup.test.js";


describe("firefox/interfaces/getters.js", () => {

  describe("getDefaultIconPath()", () => {
    it("should return the current browser icon path", async () => {
      setExternalBrowser("chrome");
      const result = await getDefaultIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/chrome/32.png"),
      });
    });

    it("should return the firefox icon if no current browser", async () => {
      setExternalBrowser(undefined);
      const result = await getDefaultIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox-launch/32.png"),
      });
    });
  });

  describe("getGreyedIconPath()", () => {
    it("should return the greyed current browser icon path", async () => {
      setExternalBrowser("chrome");
      const result = await getGreyedIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/chrome/32grey.png"),
      });
    });

    it("should return firefox icon if no current browser", async () => {
      setExternalBrowser(undefined);
      const result = await getGreyedIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/firefox-launch/32.png"),
      });
    });
  });

  describe("getExternalBrowserLaunchProtocol()", () => {
    it("should return the current external browser launch protocol", async () => {
      setExternalBrowserLaunchProtocol("test");
      const result = await getExternalBrowserLaunchProtocol();
      expect(result).to.equal("test");
    });

    it("should return an empty string if no current external browser launch protocol", async () => {
      setExternalBrowserLaunchProtocol(undefined);
      const result = await getExternalBrowserLaunchProtocol();
      expect(result).to.equal("");
    });
  });
});

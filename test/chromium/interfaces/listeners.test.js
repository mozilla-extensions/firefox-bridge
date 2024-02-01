import { initPlatformListeners } from "../../../src/chromium/interfaces/listeners.js";

import { setStorage } from "../../setup.test.js";

describe("chromium/interfaces/listeners.js", () => {
  beforeEach(() => {
    setStorage("currentExternalBrowser", "Firefox");
  });
  describe("initPlatformListeners()", () => {
    it("should add the listeners", () => {
      initPlatformListeners();
      expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
      expect(browser.action.onClicked.addListener).toHaveBeenCalled();
    });
  });
});

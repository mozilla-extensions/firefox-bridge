import { initPlatformListeners } from "../../../src/firefox/interfaces/listeners.js";

describe("firefox/interfaces/listeners.js", () => {
  describe("initPlatformListeners()", () => {
    it("should add the listeners", () => {
      browser.tabs.query.mockResolvedValue([]);
      initPlatformListeners();
      expect(browser.action.onClicked.addListener).toHaveBeenCalled();
    });
  });
});

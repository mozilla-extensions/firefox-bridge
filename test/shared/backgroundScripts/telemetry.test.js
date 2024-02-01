import { initTelemetryListeners } from "Shared/backgroundScripts/telemetry.js";

describe("shared/backgroundScripts/telemetry.js", () => {
  describe("initTelemetryListeners()", () => {
    it("should add the listeners", () => {
      initTelemetryListeners();
      expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
      expect(browser.runtime.onStartup.addListener).toHaveBeenCalled();
      expect(browser.storage.onChanged.addListener).toHaveBeenCalled();
    });
  });
});
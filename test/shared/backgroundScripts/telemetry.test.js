import { initTelemetryListeners } from "Shared/backgroundScripts/telemetry.js";
import jest from "jest-mock";
import Glean from "@mozilla/glean/webext";
import { setExtensionPlatform } from "../../setup.test.js";

describe("shared/backgroundScripts/telemetry.js", () => {
  describe("initTelemetryListeners()", () => {
    it("should add the listeners", async () => {
      Glean.initialize = jest.fn();
      browser.runtime.getManifest = jest.fn(() => ({ version: "1.0.0" }));
      setExtensionPlatform("firefox");
      await initTelemetryListeners();
      expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled();
      expect(browser.runtime.onStartup.addListener).toHaveBeenCalled();
      expect(browser.storage.sync.onChanged.addListener).toHaveBeenCalled();
    });
  });
});

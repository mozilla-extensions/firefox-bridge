import {
  getInstalledFirefoxVariant,
  getTelemetryID,
} from "../../../src/chromium/interfaces/getters.js";

import { setStorage } from "../../setup.test.js";

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
      const result = await getInstalledFirefoxVariant();
      expect(result).toBeFalsy();
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

      const result = await getInstalledFirefoxVariant();
      expect(result).toBeFalsy();
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

      const result = await getInstalledFirefoxVariant();
      expect(result).toBe("org.mozilla.firefox_bridge_nmh_dev"); // this is the first variant in the list
    });
  });

  describe("getTelemetryID()", () => {
    it("should return the telemetry ID", async () => {
      // pass the validity test
      browser.runtime.sendNativeMessage.mockResolvedValueOnce({
        result_code: 0,
      });
      // mock the telemetry ID
      browser.runtime.sendNativeMessage.mockResolvedValueOnce({
        result_code: 0,
        message: "sample_telemetry_id",
      });
      const result = await getTelemetryID();
      expect(result).toBe("sample_telemetry_id");
    });

    it("should return undefined if the telemetry ID cannot be retrieved", async () => {
      // pass the validity test
      browser.runtime.sendNativeMessage.mockResolvedValueOnce({
        result_code: 0,
      });
      // fail the telemetry ID retrieval
      browser.runtime.sendNativeMessage.mockRejectedValueOnce({
        result_code: 1,
        message: "sample_error_message",
      });

      const result = await getTelemetryID();
      expect(result).toBeFalsy();
      expect(console.error).toHaveBeenCalledWith(
        "Error getting telemetry ID:",
        "sample_error_message",
      );
    });

    it("should return undefined if all validity tests fails", async () => {
      // fail the validity test
      browser.runtime.sendNativeMessage.mockRejectedValue({
        result_code: 1,
        message: "sample_error_message",
      });

      const result = await getTelemetryID();
      expect(result).toBeFalsy();
      // called 5 times, once for storage NMH, once for each NMH variant after
      expect(console.error).toHaveBeenCalledTimes(5);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting NMH version:",
        "sample_error_message",
      );
    });
  });
});

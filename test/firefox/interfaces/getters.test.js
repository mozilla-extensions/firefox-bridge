import { getTelemetryID } from "../../../src/firefox/interfaces/getters";

describe("firefox/interfaces/getters.js", () => {
  describe("getTelemetryID()", () => {
    it("should return a telemetry ID", async () => {
      browser.experiments.firefox_bridge.getTelemetryID.mockResolvedValue(
        "sample_telemetry_id",
      );
      const result = await getTelemetryID();
      expect(result).toBe("sample_telemetry_id");
    });
  });
});

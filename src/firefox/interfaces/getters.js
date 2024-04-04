export async function getDefaultIconPath() {}
export function getInstalledFirefoxVariant() {}

/**
 * Gets the telemetry ID for the Firefox profile to link to the extension.
 *
 * @returns {string} The telemetry ID
 */
export async function getTelemetryID() {
  // Check if the telemetry ID is already stored in local storage.
  const result = browser.storage.local.get("telemetryID");
  if (!result || result.telemetryID === undefined) {
    const telemetryID =
      await browser.experiments.firefox_bridge.getTelemetryID();
    await browser.storage.local.set({ telemetryID });
    return telemetryID;
  }
  return result.telemetryID;
}

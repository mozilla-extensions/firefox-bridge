export async function getDefaultIconPath() {}
export function getInstalledFirefoxVariant() {}

/**
 * Gets the telemetry ID for the Firefox profile to link to the extension.
 *
 * @returns {Promise<string>} The telemetry ID
 */
export function getTelemetryID() {
  return browser.experiments.firefox_bridge.getTelemetryID();
}

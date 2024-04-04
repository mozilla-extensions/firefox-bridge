import Glean from "@mozilla/glean/webext";
import UAParser from "ua-parser-js";
import * as startupEvent from "../generated/startupEvent.js";
import * as telemetryEvent from "../generated/telemetryEvent.js";
import { getTelemetryID } from "Interfaces/getters.js";

import { getExternalBrowser, getTelemetryEnabled } from "./getters.js";

export function getParsedUserAgent() {
  const userAgent = navigator.userAgent;
  const uaParser = new UAParser(userAgent);
  return uaParser.getResult();
}

/**
 * Initialize the telemetry system.
 *
 * @param {boolean} showLogs Whether to show logs in the console.
 */
export async function initGlean(showLogs = false) {
  Glean.setLogPings(showLogs);
  Glean.setDebugViewTag("firefox-bridge");
  Glean.initialize("firefox.bridge", await getTelemetryEnabled(), {
    appDisplayVersion: browser.runtime.getManifest().version,
    appBuild: IS_FIREFOX_EXTENSION ? "firefox" : "chromium",
  });
}

/**
 * Initialize the telemetry listeners. This includes the install, startup, and
 * listener for messages sent through the storage API.
 */
export function initTelemetryListeners() {
  browser.storage.session.get("telemetryInitialized").then(async (result) => {
    if (result.telemetryInitialized === undefined) {
      await initGlean();
      browser.storage.session.set({ telemetryInitialized: true });
    }
  });

  browser.runtime.onStartup.addListener(async () => {
    const userAgent = getParsedUserAgent();

    startupEvent.browserType.set(IS_FIREFOX_EXTENSION ? "firefox" : "chromium");
    startupEvent.browserVersion.set(userAgent.browser.version);
    startupEvent.browserName.set(userAgent.browser.name);
    startupEvent.dateStarted.set();
    startupEvent.browserLanguageLocale.set(navigator.language);
    startupEvent.extensionLanguageLocale.set(browser.i18n.getUILanguage());
    startupEvent.osName.set(userAgent.os.name);
    startupEvent.osVersion.set(userAgent.os.version);

    startupEvent.isPinned.set(
      (await browser.action.getUserSettings()).isOnToolbar,
    );

    const commands = await browser.commands.getAll();
    for (const command of commands) {
      startupEvent.hotkeys[command.name.toLowerCase()].set(command.shortcut);
    }

    if (IS_FIREFOX_EXTENSION) {
      startupEvent.externalBrowser.set(await getExternalBrowser());
    }
  });

  browser.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.telemetryEnabled !== undefined) {
      await Glean.setUploadEnabled(changes.telemetryEnabled.newValue);
      if (changes.telemetryEnabled.newValue) {
        // Submit the telemetry ID each time telemetry is enabled as
        // the glean ID is reset each time telemetry is disabled.
        telemetryEvent.telemetryId.set(await getTelemetryID());
      }
    }
  });
}

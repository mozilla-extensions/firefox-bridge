import Glean from "@mozilla/glean/webext";
import UAParser from "ua-parser-js";
import * as installEvent from "../generated/installEvent.js";
import * as startupEvent from "../generated/startupEvent.js";

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

  const userAgent = getParsedUserAgent();

  Glean.initialize("firefox.bridge", await getTelemetryEnabled(), {
    appDisplayVersion: browser.runtime.getManifest().version,
    appBuild: IS_FIREFOX_EXTENSION ? "firefox" : "chromium",
    os: userAgent.os.name,
    osVersion: userAgent.os.version,
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

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      installEvent.dateInstalled.set(new Date());
      installEvent.browserType.set(
        IS_FIREFOX_EXTENSION ? "firefox" : "chromium",
      );

      const userAgent = getParsedUserAgent();
      installEvent.browserVersion.set(userAgent.browser.version);
      installEvent.browserName.set(userAgent.browser.name);
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

  browser.storage.sync.onChanged.addListener((changes) => {
    if (changes.telemetryEnabled !== undefined) {
      Glean.setUploadEnabled(changes.telemetryEnabled.newValue);
    }
  });
}

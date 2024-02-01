import Glean from "@mozilla/glean/webext";
import { install, startup, launch, settings } from "../generated/pings.js";
import * as installEvent from "../generated/installEvent.js";
import * as startupEvent from "../generated/startupEvent.js";
import * as launchEvent from "../generated/launchEvent.js";
import * as settingEvent from "../generated/settingEvent.js";

import { getTelemetryEnabled } from "./getters.js";

/**
 * Initialize the telemetry system.
 *
 * @param {boolean} showLogs Whether to show logs in the console.
 */
export async function initGlean(showLogs = false) {
  Glean.setLogPings(showLogs);
  Glean.initialize("firefox.launch", await getTelemetryEnabled(), {
    appDisplayVersion: browser.runtime.getManifest().version,
    appBuild: IS_FIREFOX_EXTENSION ? "firefox" : "chromium",
  });
}

/**
 * Initialize the telemetry listeners. This includes the install, startup, and
 * listener for messages sent through the storage API.
 */
export function initTelemetryListeners() {
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason !== "install") {
      return;
    }

    await initGlean();
    installEvent.dateInstalled.set(new Date());
    installEvent.browserType.set(IS_FIREFOX_EXTENSION ? "firefox" : "chromium");
    install.submit();
  });

  browser.runtime.onStartup.addListener(async () => {
    // 2. browser version (window.navigator.userAgent)
    await initGlean();
    startupEvent.browserType.set(IS_FIREFOX_EXTENSION ? "firefox" : "chromium");
    startupEvent.dateStarted.set(new Date());
    startupEvent.browserLanguageLocale.set(navigator.language);
    startupEvent.extensionLanguageLocale.set(browser.i18n.getUILanguage());
    startupEvent.isPinned.set(
      (await browser.action.getUserSettings()).isOnToolbar,
    );
    const commands = await browser.commands.getAll();
    for (const command of commands) {
      startupEvent.hotkeys[command.name.toLowerCase()].set(command.shortcut);
    }
    startup.submit();
  });

  browser.storage.onChanged.addListener(async (changes) => {
    if (changes.telemetry && changes.telemetry.newValue) {
      await initGlean();
      const telemetry = changes.telemetry.newValue;
      if (telemetry.type === "browserLaunch") {
        launchEvent.browserLaunch.record({
          browser: telemetry.browser,
          source: telemetry.source,
        });
        launch.submit();
      }

      if (telemetry.type === "currentBrowserChange") {
        settingEvent.currentBrowser.from.set(telemetry.from);
        settingEvent.currentBrowser.to.set(telemetry.to);
        settingEvent.currentBrowser.source.set(telemetry.source);
        settings.submit();
      }

      browser.storage.local.set({ telemetry: null });
    } else if (changes.telemetryEnabled !== undefined) {
      await initGlean();
      Glean.setUploadEnabled(changes.telemetryEnabled.newValue);
    }
  });
}

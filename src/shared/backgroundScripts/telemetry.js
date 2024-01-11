// eslint-disable-next-line no-unused-vars
import * as browserObjectForGlean from "../../browser-polyfill.js"; // required for Glean in chromium
import Glean from "@mozilla/glean/webext";
import { install, startup, launch, settings } from "../generated/pings.js";
import * as installEvent from "../generated/installEvent.js";
import * as startupEvent from "../generated/startupEvent.js";
import * as launchEvent from "../generated/launchEvent.js";
import * as settingEvent from "../generated/settingEvent.js";

/**
 * Initialize the telemetry system.
 * 
 * @param {boolean} showLogs Whether to show logs in the console.
 */
export function initGlean(showLogs = true) {
  Glean.setLogPings(showLogs);
  Glean.initialize("firefox.launch", true, {
    appDisplayVersion: chrome.runtime.getManifest().version,
    appBuild: chrome.runtime.getManifest().minimum_chrome_version ? "chromium" : "firefox",
  });
}

/**
 * Initialize the telemetry listeners. This includes the install, startup, and
 * listener for messages sent through the storage API.
 */
export function initTelemetryListeners() {
  chrome.runtime.onInstalled.addListener(() => {
    initGlean();
    installEvent.dateInstalled.set(new Date());
    installEvent.browserType.set(
      chrome.runtime.getManifest().minimum_chrome_version ? "chromium" : "firefox"
    );
    install.submit();
  });

  chrome.runtime.onStartup.addListener(async () => {
    // 2. browser version (window.navigator.userAgent)
    initGlean();
    startupEvent.browserType.set(
      chrome.runtime.getManifest().minimum_chrome_version ? "chromium" : "firefox"
    );
    startupEvent.dateStarted.set(new Date());
    startupEvent.browserLanguageLocale.set(navigator.language);
    startupEvent.extensionLanguageLocale.set(chrome.i18n.getUILanguage());
    startupEvent.isPinned.set(
      (await chrome.action.getUserSettings()).isOnToolbar
    );
    const commands = await chrome.commands.getAll();
    for (const command of commands) {
      startupEvent.hotkeys[command.name.toLowerCase()].set(command.shortcut);
    }
    startup.submit();
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.telemetry && changes.telemetry.newValue) {
      const telemetry = changes.telemetry.newValue;
      if (telemetry.type === "browserLaunch") {
        launchEvent.browserLaunch.record({
          browser: telemetry.browser,
          source: telemetry.source,
        });
        launch.submit();
      }

      if (telemetry.type === "currentBrowserChange") {
        settingEvent.currentBrowser["from"].set(telemetry.from);
        settingEvent.currentBrowser["to"].set(telemetry.to);
        settings.submit();
      }

      chrome.storage.local.set({ telemetry: null });
    }

    // welcomePageOpened
  });
}

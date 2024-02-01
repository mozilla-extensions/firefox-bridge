"use strict";
/* globals ExtensionAPI, Services, XPCOMUtils, AppConstants */
// The globals above can be found after downloading the Firefox source code (see the README)
// and here https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/basics.html

const lazy = {};

XPCOMUtils.defineLazyServiceGetters(lazy, {
  gMIMEService: ["@mozilla.org/mime;1", "nsIMIMEService"],
});

const https = "https";
const iconSize = 32;
const browserNamesWin = ["Chrome", "Edge", "Opera"];
const browserNamesMac = ["Safari", "Chrome", "Microsoft Edge", "Opera", "Arc"];
let logs = [];

/**
 * Determines whether the executable file for an application is valid.
 * (from https://searchfox.org/mozilla-central/rev/fd806006c185ed94c794c7d12b59669435785e0d/browser/components/preferences/main.js#2814)
 *
 * @param {*} aExecutable The executable file for an application
 * @returns {boolean} Whether the executable is valid
 */
function _isValidHandlerExecutable(aExecutable) {
  let leafName;
  if (AppConstants.platform == "win") {
    leafName = `${AppConstants.MOZ_APP_NAME}.exe`;
  } else if (AppConstants.platform == "macosx") {
    leafName = AppConstants.MOZ_MACBUNDLE_NAME;
  } else {
    return false;
  }
  return (
    aExecutable &&
    aExecutable.exists() &&
    aExecutable.isExecutable() &&
    aExecutable.leafName !== leafName
  );
}

/**
 * Whether or not the given handler app is valid.
 * (from https://searchfox.org/mozilla-central/rev/fd806006c185ed94c794c7d12b59669435785e0d/browser/components/preferences/main.js#2794)
 *
 * @param aHandlerApp {nsIHandlerApp} the handler app in question
 * @returns {boolean} whether or not it's valid
 */
function _isValidHandlerApp(aHandlerApp) {
  if (!aHandlerApp) {
    return false;
  }

  if (aHandlerApp instanceof Ci.nsILocalHandlerApp) {
    return _isValidHandlerExecutable(aHandlerApp.executable);
  }
  return false;
}

/**
 * Gets the available browsers on Windows to be potentially used for launching.
 *
 * @returns {Array<{ icon: string, name: string, executable: string }>} The icon, name, and executable
 * of the available browsers on Windows
 */
function _getAvailableBrowsersWin() {
  let mimeInfo = lazy.gMIMEService.getFromTypeAndExtension("text/html", "html");
  let appList = mimeInfo.possibleLocalHandlers || [];
  let appDataList = [];
  for (let idx = 0; idx < appList.length; idx++) {
    let app = appList.queryElementAt(idx, Ci.nsILocalHandlerApp);
    logs.push("App: " + app.executable.path);
    if (!_isValidHandlerApp(app)) {
      logs.push("Invalid app");
      continue;
    }
    let iconURI = Services.io.newFileURI(app.executable).spec;
    let iconString = "moz-icon://" + iconURI + "?size=" + iconSize;
    let appname =
      app.executable.parent.leafName !== "Application"
        ? app.executable.parent.leafName
        : app.executable.parent.parent.leafName;

    if (!browserNamesWin.includes(appname)) {
      continue;
    }

    let appData = {
      icon: iconString,
      name: appname,
      executable: app.executable.path,
    };
    appDataList.push(appData);
  }
  return appDataList;
}

/**
 * Gets the available browsers on Mac to be potentially used for launching.
 *
 * @returns {Array<{ icon: string, name: string, executable: string }>} The icon, name, and executable
 * of the available browsers on Mac
 */
function _getAvailableBrowsersMac() {
  let shellService = Cc["@mozilla.org/browser/shell-service;1"].getService(
    Ci.nsIMacShellService,
  );
  let appList = shellService.getAvailableApplicationsForProtocol(https);
  let appDataList = [];
  for (let app of appList) {
    if (!browserNamesMac.includes(app[0])) {
      continue;
    } else if (app[0] === "Microsoft Edge") {
      app[0] = "Edge";
    }
    let iconString = "moz-icon://" + app[1] + "?size=" + iconSize;
    let appData = {
      icon: iconString,
      name: app[0],
      executable: app[1],
    };
    appDataList.push(appData);
    logs.push("Icon: " + iconString);
    logs.push("Name: " + app[0]);
    logs.push("Executable: " + app[1]);
  }
  return appDataList;
}

/**
 * Launches an application on Windows.
 *
 * @param {*} appExecutable The executable file for an application
 * @param {*} handlerArgs The arguments to pass to the application
 */
function _launchAppWin(appExecutable, handlerArgs) {
  let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  file.initWithPath(appExecutable);
  process.init(file);
  process.run(false, handlerArgs, handlerArgs.length);
}

/**
 * Launches an application on Mac.
 *
 * @param {*} appExecutable The executable file for an application
 * @param {*} handlerArgs The arguments to pass to the application
 */
function _launchAppMac(appExecutable, handlerArgs) {
  let opener = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  let uri = Services.io.newURI(appExecutable);
  let file = uri.QueryInterface(Ci.nsIFileURL).file;
  let argsToUse = ["-a", file.path, ...handlerArgs];
  opener.initWithPath("/usr/bin/open");
  process.init(opener);
  process.run(false, argsToUse, argsToUse.length);
}

this.experiments_firefox_launch = class extends ExtensionAPI {
  getAPI(context) {
    return {
      experiments: {
        firefox_launch: {
          /**
           * Gets the available browsers to be potentially used for launching.
           *
           * @returns {Promise<{ browsers: Array<{ icon: string, name: string, executable: string }>, logs: Array<string> }>}
           * The available browsers and logs
           */
          async getAvailableBrowsers() {
            if (AppConstants.platform == "win") {
              return { browsers: _getAvailableBrowsersWin(), logs };
            } else if (AppConstants.platform == "macosx") {
              return { browsers: _getAvailableBrowsersMac(), logs };
            }
            logs.push("Unsupported platform: " + AppConstants.platform);
            return { browsers: null, logs };
          },

          /**
           * Gets the default browser of the user.
           *
           * @returns {Promise<{ name: string, logs: Array<string> }>} The default browser and logs
           */
          getDefaultBrowser() {
            if (
              AppConstants.platform != "win" &&
              AppConstants.platform != "macosx"
            ) {
              return null;
            }
            let extProtocolSvc = Cc[
              "@mozilla.org/uriloader/external-protocol-service;1"
            ].getService(Ci.nsIExternalProtocolService);
            let handlerInfo = extProtocolSvc.getProtocolHandlerInfo(https);
            if (!handlerInfo.hasDefaultHandler) {
              logs.push("No default handler");
              return { name: null, logs };
            }
            if (
              !browserNamesMac.includes(handlerInfo.defaultDescription) &&
              !browserNamesWin.includes(handlerInfo.defaultDescription)
            ) {
              logs.push("Default handler not supported");
              return { name: null, logs };
            }
            return { name: handlerInfo.defaultDescription, logs };
          },

          /**
           * Launches an application.
           *
           * @param {*} appExecutable The executable file for an application
           * @param {*} handlerArgs The arguments to pass to the application
           */
          launchApp(appExecutable, handlerArgs) {
            if (AppConstants.platform == "win") {
              _launchAppWin(appExecutable, handlerArgs);
            } else if (AppConstants.platform == "macosx") {
              _launchAppMac(appExecutable, handlerArgs);
            }
          },

          /**
           * Opens the addons shortcuts page in the browser.
           */
          openShortcutsPage() {
            let win = Services.wm.getMostRecentWindow("navigator:browser");
            win.BrowserOpenAddonsMgr("addons://shortcuts/shortcuts");
          },
        },
      },
    };
  }
};

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
    if (!_isValidHandlerExecutable(app?.executable)) {
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
  }
  return appDataList;
}

function _getExecutablePathForBrowserWin(browserIdentifier) {
  // either use the current getavailablebrowsers, or find a way
  // to store the path here
}

function _getExecutablePathForBrowserMac(browserIdentifier) {
  // either use the current getavailablebrowsers, or find a way
  // to store the path here


}

/**
 * Launches an application on Windows.
 *
 * @param {string} browserIdentifier The identifier of the browser to launch
 * @param {string} url The URL to open
 */
function _launchAppWin(browserIdentifier, url) {
  let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  let appExecutable = _getExecutablePathForBrowserWin(browserIdentifier);
  file.initWithPath(appExecutable);
  process.init(file);
  process.run(false, [url], 1);
}

/**
 * Launches an application on Mac.
 *
 * @param {string} browserIdentifier The identifier of the browser to launch
 * @param {string} url The URL to open
 */
function _launchAppMac(browserIdentifier, url) {
  let opener = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  let appExecutable = _getExecutablePathForBrowserMac(browserIdentifier);
  let uri = Services.io.newURI(appExecutable);
  let file = uri.QueryInterface(Ci.nsIFileURL).file;
  let argsToUse = ["-a", file.path, url];
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
           * @returns {Promise<Array<{ icon: string, name: string, executable: string }>}
           * The available browsers
           */
          async getAvailableBrowsers() {
            if (AppConstants.platform == "win") {
              return _getAvailableBrowsersWin();
            } else if (AppConstants.platform == "macosx") {
              return _getAvailableBrowsersMac();
            }
            return null;
          },

          /**
           * Gets the default browser of the user.
           *
           * @returns {Promise<string>} The default browser name
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
              return null;
            }
            if (
              !browserNamesMac.includes(handlerInfo.defaultDescription) &&
              !browserNamesWin.includes(handlerInfo.defaultDescription)
            ) {
              return null;
            }
            return handlerInfo.defaultDescription;
          },

          /**
           * Launches an application.
           *
           * @param {string} browserIdentifier The identifier of the browser to launch
           * @param {string} url The URL to open
           */
          launchApp(browserIdentifier, url) {
            let uri = Services.io.newURI(url[0]);

            if (AppConstants.platform == "win") {
              _launchAppWin(browserIdentifier, uri.spec);
            } else if (AppConstants.platform == "macosx") {
              _launchAppMac(browserIdentifier, uri.spec);
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

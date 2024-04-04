"use strict";
/* globals ExtensionAPI, Services, XPCOMUtils, AppConstants */
// The globals above can be found after downloading the Firefox source code (see the README)
// and here https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/basics.html

const lazy = {};

XPCOMUtils.defineLazyServiceGetters(lazy, {
  gMIMEService: ["@mozilla.org/mime;1", "nsIMIMEService"],
});

const https = "https";

// The list of browsers to be potentially used for launching
// There are some differences in the names of the browsers on Windows and Mac,
// so separate lists are used for each.

// The mac names are the bundle names, which are the names returned by getDefaultBrowser() and
// the names returned by _getAvailableBrowsersMac().

// The windows names are the ApplicationName from the registry, which are the names returned by
// getDefaultBrowser() and the names returned by _getAvailableBrowsersWin().
const browserNamesWin = [
  // "Arc" (Not yet available on windows)
  "Brave Beta",
  "Brave Nightly",
  "Brave",
  "DuckDuckGo",
  "Google Chrome Beta",
  "Google Chrome Canary",
  "Google Chrome Dev",
  "Google Chrome",
  "Microsoft Edge Beta",
  "Microsoft Edge Canary",
  "Microsoft Edge Dev",
  "Microsoft Edge",
  "Opera GX Internet Browser",
  "Opera Internet Browser",
  "Opera beta Internet Browser",
  "Opera developer Internet Browser",
  "Vivaldi",
];
const browserNamesMac = [
  "Arc",
  "Brave Beta",
  "Brave Nightly",
  "Brave",
  "Chrome Beta",
  "Chrome Canary",
  "Chrome Dev",
  "Chrome",
  "DuckDuckGo",
  "Microsoft Edge Dev",
  "Microsoft Edge Beta",
  "Microsoft Edge Canary",
  "Microsoft Edge",
  "Opera Beta",
  "Opera Developer",
  "Opera GX",
  "Opera",
  "Safari",
  "Vivaldi",
];

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
 * @returns {Array<{ name: string, executable: string }>} The name and executable path
 * of the available browsers on Windows
 */
async function _getAvailableBrowsersWin() {
  let mimeInfo = lazy.gMIMEService.getFromTypeAndExtension("text/html", "html");
  let appList = mimeInfo.possibleLocalHandlers || [];
  let appDataList = [];
  for (let idx = 0; idx < appList.length; idx++) {
    let app = appList.queryElementAt(idx, Ci.nsILocalHandlerApp);
    if (!_isValidHandlerExecutable(app?.executable)) {
      continue;
    }

    let appname = await app.prettyNameAsync();

    if (!browserNamesWin.includes(appname)) {
      continue;
    }

    let appData = {
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
 * @returns {Array<{ name: string, executable: string }>} The name and executable path
 * of the available browsers on Mac
 */
function _getAvailableBrowsersMac() {
  let shellService = Cc["@mozilla.org/browser/shell-service;1"].getService(
    Ci.nsIMacShellService,
  );
  let appList = shellService.getAvailableApplicationsForProtocol(https);
  let appDataList = [];
  for (let app of appList) {
    let [displayName, executable] = app;

    if (!browserNamesMac.includes(displayName)) {
      continue;
    }

    let appData = {
      name: displayName,
      executable,
    };
    appDataList.push(appData);
  }
  return appDataList;
}

/**
 * Gets the path of the executable file for a browser.
 *
 * @param {string} browserIdentifier The identifier of the browser to launch
 * @returns {string} The path of the executable file for the browser if it exists, null otherwise
 */
async function _getExecutablePathForBrowser(browserIdentifier) {
  let appList;
  if (AppConstants.platform == "win") {
    appList = await _getAvailableBrowsersWin();
  } else if (AppConstants.platform == "macosx") {
    appList = _getAvailableBrowsersMac();
  }

  for (let app of appList) {
    if (app.name == browserIdentifier) {
      return app.executable;
    }
  }

  throw new Error("Invalid browser identifier");
}

/**
 * Launches an application on Windows.
 *
 * @param {string} browserIdentifier The identifier of the browser to launch
 * @param {string} url The URL to open
 */
async function _launchBrowserWin(browserIdentifier, url) {
  let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  let appExecutable = await _getExecutablePathForBrowser(browserIdentifier);
  if (!appExecutable) {
    throw new Error("Invalid browser identifier");
  }
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
async function _launchBrowserMac(browserIdentifier, url) {
  let opener = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  let appExecutable = await _getExecutablePathForBrowser(browserIdentifier);
  if (!appExecutable) {
    throw new Error("Invalid browser identifier");
  }

  let uri = Services.io.newURI(appExecutable);
  let file = uri.QueryInterface(Ci.nsIFileURL).file;
  let argsToUse = ["-a", file.path, url];
  opener.initWithPath("/usr/bin/open");
  process.init(opener);
  process.run(false, argsToUse, argsToUse.length);
}

/**
 * Determines whether a URL is valid.
 *
 * @param {string} url
 * @returns {boolean} Whether the URL is valid
 */
function _isValidURL(url) {
  try {
    let uri = Services.io.newURI(url);
    return (
      uri.schemeIs("http") || uri.schemeIs("https") || uri.schemeIs("file")
    );
  } catch (e) {
    return false;
  }
}

this.experiments_firefox_bridge = class extends ExtensionAPI {
  getAPI(context) {
    return {
      experiments: {
        firefox_bridge: {
          /**
           * Gets the available browsers to be potentially used for launching.
           *
           * @returns {Promise<Array<string>}
           * The available browsers
           */
          async getAvailableBrowsers() {
            let applist;
            if (AppConstants.platform == "win") {
              applist = await _getAvailableBrowsersWin();
            } else if (AppConstants.platform == "macosx") {
              applist = _getAvailableBrowsersMac();
            }
            // remove the executable field from each app data
            return applist.map((app) => {
              return app.name;
            });
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
              (!browserNamesMac.includes(handlerInfo.defaultDescription) &&
                AppConstants.platform == "macosx") ||
              (!browserNamesWin.includes(handlerInfo.defaultDescription) &&
                AppConstants.platform == "win")
            ) {
              return null;
            }
            return handlerInfo.defaultDescription;
          },

          /**
           * Launches a browser.
           *
           * @param {string} browserIdentifier The identifier of the browser to launch
           * @param {string} url The URL to open
           */
          async launchBrowser(browserIdentifier, url) {
            if (!_isValidURL(url)) {
              throw new Error("Invalid URL");
            }

            if (AppConstants.platform == "win") {
              await _launchBrowserWin(browserIdentifier, url);
            } else if (AppConstants.platform == "macosx") {
              await _launchBrowserMac(browserIdentifier, url);
            }
          },

          /**
           * Opens the addons shortcuts page in the browser.
           */
          openShortcutsPage() {
            let win = Services.wm.getMostRecentWindow("navigator:browser");
            win.BrowserOpenAddonsMgr("addons://shortcuts/shortcuts");
          },

          /**
           * Gets the telemetry ID for the Firefox profile to link to the extension.
           *
           * @returns {Promise<string>} The telemetry ID
           */
          async getTelemetryID() {
            let telemetryID = Services.prefs.getStringPref(
              "browser.firefoxbridge.installId",
              undefined,
            );
            return telemetryID;
          },
        },
      },
    };
  }
};

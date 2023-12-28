"use strict";

const lazy = {};

XPCOMUtils.defineLazyServiceGetters(lazy, {
  gMIMEService: ["@mozilla.org/mime;1", "nsIMIMEService"],
});

const https = "https";
const iconSize = 32;
const browserNamesWin = {
  "msedge.exe": "Microsoft Edge",
  "chrome.exe": "Google Chrome",
};
const browserNamesMac = ["Safari", "Chrome", "Microsoft Edge"];

this.experiments_firefox_launch = class extends ExtensionAPI {
  getAPI(context) {
    return {
      experiments: {
        firefox_launch: {
          _isValidHandlerExecutable(aExecutable) {
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
              aExecutable.leafName != leafName
            );
          },

          _isValidHandlerApp(aHandlerApp) {
            if (!aHandlerApp) {
              return false;
            }

            if (aHandlerApp instanceof Ci.nsILocalHandlerApp) {
              return this._isValidHandlerExecutable(aHandlerApp.executable);
            }

            return false;
          },

          // Get all windows able to open https protocol
          _getAvailableBrowsersWin() {
            let mimeInfo = lazy.gMIMEService.getFromTypeAndExtension("text/html", "html");
            let appList = mimeInfo.possibleLocalHandlers || [];
            let appDataList = [];
            for (let idx = 0; idx < appList.length; idx++) {
              let app = appList.queryElementAt(idx, Ci.nsILocalHandlerApp);
              if (!this._isValidHandlerApp(app) || !browserNamesWin[app.name]) {
                continue;
              }
              let iconURI = Services.io.newFileURI(app.executable).spec;
              let iconString = "moz-icon://" + iconURI + "?size=" + iconSize;
              let appData = {
                icon: iconString,
                name: app.name,
                executable: app.executable.path,
              };
              appDataList.push(appData);
              console.log("Icon: " + iconString);
              console.log("Name: " + browserNamesWin[app.name]);
              console.log("Executable: " + app.executable.path);
            }
            return appDataList;
          },

          _getAvailableBrowsersMac() {
            let shellService = Cc["@mozilla.org/browser/shell-service;1"].getService(
              Ci.nsIMacShellService
            );
            let appList = shellService.getAvailableApplicationsForProtocol(https);
            let appDataList = [];
            for (let app of appList) {
              // if (!browserNamesMac.includes(app[0])) {
              //   continue;
              // }
              let iconString = "moz-icon://" + app[1] + "?size=" + iconSize;
              let appData = {
                icon: iconString,
                name: app[0],
                executable: app[1],
              };
              appDataList.push(appData);
              console.log("Icon: " + iconString);
              console.log("Name: " + app[0]);
              console.log("Executable: " + app[1]);
            }
            return appDataList;
          },

          async getAvailableBrowsers() {
            console.log("Default: " + this.getDefaultBrowser());
            if (AppConstants.platform == "win") {
              return this._getAvailableBrowsersWin();
            } else if (AppConstants.platform == "macosx") {
              return this._getAvailableBrowsersMac();
            } else {
              console.error("Unsupported platform: " + AppConstants.platform);
              return [];
            }
          },

          getDefaultBrowser() {
            if (AppConstants.platform != "win" && AppConstants.platform != "macosx") {
              console.error("Unsupported platform: " + AppConstants.platform);
              return null;
            }
            let extProtocolSvc = Cc[
              "@mozilla.org/uriloader/external-protocol-service;1"
            ].getService(Ci.nsIExternalProtocolService);
            let handlerInfo = extProtocolSvc.getProtocolHandlerInfo(https);
            if (!handlerInfo.hasDefaultHandler) {
              return null;
            }
            return(handlerInfo.defaultDescription);
          },

          _launchAppWin(appExecutable, handlerArgs) {
            let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
            let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
            file.initWithPath(appExecutable);
            process.init(file);
            process.run(false, handlerArgs, handlerArgs.length);
          },

          _launchAppMac(appExecutable, handlerArgs) {
            let opener = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
            let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
            let uri = Services.io.newURI(appExecutable);
            let file = uri.QueryInterface(Ci.nsIFileURL).file;
            let argsToUse = ["-a", file.path, ...handlerArgs];
            opener.initWithPath("/usr/bin/open");
            process.init(opener);
            process.run(false, argsToUse, argsToUse.length);
          },

          launchApp(appExecutable, handlerArgs) {
            let file = null;
            console.error("Executable: " + appExecutable);
            if (AppConstants.platform == "win") {
              this._launchAppWin(appExecutable, handlerArgs);
            } else if (AppConstants.platform == "macosx") {
              this._launchAppMac(appExecutable, handlerArgs);
            } else {
              console.error("Unsupported platform: " + AppConstants.platform);
              return;
            }
          }
        }
      },
    };
  }
};

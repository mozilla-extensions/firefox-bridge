import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";

import {
  getCurrentTabSLD,
  getExternalSites,
  getIsAutoRedirect,
  getIsFirefoxDefault,
  getIsFirefoxInstalled,
} from "../../src/backgroundScripts/getters.js";
import {
  launchFirefox,
  checkAndUpdateURLScheme,
  setIsCurrentTabValidUrlScheme,
  isCurrentTabValidUrlScheme,
} from "../../src/backgroundScripts/launchBrowser.js";
import { updateToolbarIcon } from "../../src/backgroundScripts/actionButton.js";
import {
  initContextMenu,
  handleChangeDefaultLaunchContextMenuClick,
  handleContextMenuClick,
  updateAddCurrentSiteToMySitesContextMenu,
} from "../../src/backgroundScripts/contextMenus.js";
import { handleHotkeyPress } from "../../src/backgroundScripts/hotkeys.js";

global.chrome = {
  testEnv: true,
  contextMenus: {
    create: sinon.stub(),
    update: sinon.stub(),
    onClicked: {
      addListener: sinon.stub(),
    },
  },
  storage: {
    sync: {
      get: sinon.stub(),
      onChanged: {
        addListener: sinon.stub(),
      },
      set: sinon.stub(),
    },
    local: {
      get: sinon.stub(),
      set: sinon.stub(),
    },
  },
  runtime: {
    onInstalled: {
      addListener: sinon.stub(),
    },
  },
  action: {
    setIcon: sinon.stub(),
    onClicked: {
      addListener: sinon.stub(),
    },
  },
  tabs: {
    onUpdated: {
      addListener: sinon.stub(),
    },
    onActivated: {
      addListener: sinon.stub(),
    },
    onCreated: {
      addListener: sinon.stub(),
    },
    update: sinon.stub(),
    create: sinon.stub(),
    query: sinon.stub(),
  },
  commands: {
    onCommand: {
      addListener: sinon.stub(),
    },
  },
  i18n: {
    getMessage: sinon.stub(),
  },
  webRequest: {
    onBeforeRequest: {
      addListener: sinon.stub(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: sinon.stub(),
    getDynamicRules: sinon.stub(),
  },
};

global.document = {
  addEventListener: sinon.stub(),
};

const setIsFirefoxDefault = (isFirefoxDefault) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ isFirefoxDefault });
  });
};

const setIsFirefoxInstalled = (isFirefoxInstalled) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isFirefoxInstalled });
  });
};

const setIsAutoRedirect = (isAutoRedirect) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isAutoRedirect });
  });
};

const setExternalSites = (firefoxSites) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ firefoxSites });
  });
};

const setCurrentTabURL = (currentTabURL) => {
  global.chrome.tabs.query.callsFake((queryInfo, callback) => {
    callback([
      {
        url: currentTabURL,
      },
    ]);
  });
};

const getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};

function resetStubs(obj) {
  for (const prop in obj) {
    if (typeof obj[prop] === "object") {
      resetStubs(obj[prop]);
    } else if (obj[prop].reset) {
      obj[prop].reset();
    }
  }
}

describe("background.js", () => {
  beforeEach(() => {
    setIsFirefoxInstalled(true);
    // replace underscores with spaces
    global.chrome.i18n.getMessage.callsFake((key) => key.replace(/_/g, " "));
  });

  afterEach(() => {
    resetStubs(global.chrome);
    resetStubs(global.document);
  });

  describe("initContextMenu()", () => {
    it("should create the context menu", async () => {
      setIsFirefoxDefault(true);
      await initContextMenu();
      expect(global.chrome.contextMenus.create.callCount).to.equal(10);
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "changeDefaultLaunchContextMenu",
          title: "Always use Firefox Private Browsing",
          contexts: ["action"],
          type: "checkbox",
          checked: false,
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "alternativeLaunchContextMenu",
          title: "Launch this page in Firefox Private Browsing",
          contexts: ["action"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "launchInFirefox",
          title: "Launch this page in Firefox",
          contexts: ["page"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "launchInFirefoxPrivate",
          title: "Launch this page in Firefox Private Browsing",
          contexts: ["page"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "launchInFirefoxLink",
          title: "Launch this link in Firefox",
          contexts: ["link"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "launchInFirefoxPrivateLink",
          title: "Launch this link in Firefox Private Browsing",
          contexts: ["link"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "manageExternalSitesContextMenu",
          title: "Manage My Firefox Sites",
          contexts: ["action"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "manageExternalSitesContextMenu",
          title: "Manage My Firefox Sites",
          contexts: ["action"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "separator",
          type: "separator",
          contexts: ["action"],
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "addCurrentSiteToMySitesContextMenu",
          title: "Add this site to My Firefox Sites",
          contexts: ["action"],
          enabled: false,
        })
      ).to.be.true;
      expect(
        global.chrome.contextMenus.create.calledWith({
          id: "autoRedirectCheckboxContextMenu",
          title: "auto redirect my firefox sites",
          contexts: ["action"],
          type: "checkbox",
          checked: true,
        })
      ).to.be.true;
    });
  });

  describe("handleContextMenuClick()", () => {
    it("should change the default launch mode to private", async () => {
      setIsFirefoxDefault(true);
      await handleContextMenuClick(
        { menuItemId: "changeDefaultLaunchContextMenu" },
        {}
      );
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "alternativeLaunchContextMenu",
          {
            title: "Launch this page in Firefox",
          }
        )
      ).to.be.true;
    });

    it("should change the default launch mode to normal", async () => {
      setIsFirefoxDefault(false);
      await handleContextMenuClick(
        { menuItemId: "changeDefaultLaunchContextMenu" },
        {}
      );
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "alternativeLaunchContextMenu",
          {
            title: "Launch this page in Firefox Private Browsing",
          }
        )
      ).to.be.true;
    });

    it("should launch firefox in the alternative launch mode to default", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "alternativeLaunchContextMenu" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox-private:https://basicurl.com",
        })
      ).to.be.true;

      setIsFirefoxDefault(false);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "alternativeLaunchContextMenu" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledTwice).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox:https://basicurl.com",
        })
      ).to.be.true;
    });

    it("should launch firefox in normal mode from the page context", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "launchInFirefox" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox:https://basicurl.com",
        })
      ).to.be.true;
    });

    it("should launch firefox in private mode from the page context", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "launchInFirefoxPrivate" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox-private:https://basicurl.com",
        })
      ).to.be.true;
    });

    it("should launch firefox in normal mode from the link context", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "launchInFirefoxLink" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox:https://basicurl.com",
        })
      ).to.be.true;
    });

    it("should launch firefox in private mode from the link context", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await handleContextMenuClick(
        { menuItemId: "launchInFirefoxPrivateLink" },
        { id: 1, url: "https://basicurl.com" }
      );
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox-private:https://basicurl.com",
        })
      ).to.be.true;
    });
  });

  describe("updateToolbarIcon()", () => {
    it("should update the toolbar icon to firefox icon grey colour", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(false);
      await updateToolbarIcon();
      expect(global.chrome.action.setIcon.calledOnce).to.be.true;
      expect(
        global.chrome.action.setIcon.calledWith({
          path: {
            32: "../images/firefox32grey.png",
          },
        })
      ).to.be.true;
    });

    it("should update the toolbar icon to private browsing icon grey colour", async () => {
      setIsFirefoxDefault(false);
      setIsCurrentTabValidUrlScheme(false);
      await updateToolbarIcon();
      expect(global.chrome.action.setIcon.calledOnce).to.be.true;
      expect(
        global.chrome.action.setIcon.calledWith({
          path: {
            32: "../images/private32grey.png",
          },
        })
      ).to.be.true;
    });

    it("should update the toolbar icon to firefox icon", async () => {
      setIsFirefoxDefault(true);
      setIsCurrentTabValidUrlScheme(true);
      await updateToolbarIcon();
      expect(global.chrome.action.setIcon.calledOnce).to.be.true;
      expect(
        global.chrome.action.setIcon.calledWith({
          path: {
            32: "../images/firefox32.png",
          },
        })
      ).to.be.true;
    });

    it("should update the toolbar icon to private browsing icon", async () => {
      setIsFirefoxDefault(false);
      setIsCurrentTabValidUrlScheme(true);
      await updateToolbarIcon();
      expect(global.chrome.action.setIcon.calledOnce).to.be.true;
      expect(
        global.chrome.action.setIcon.calledWith({
          path: {
            32: "../images/private32.png",
          },
        })
      ).to.be.true;
    });
  });

  describe("launchFirefox()", () => {
    it("should launch firefox in private mode", async () => {
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchFirefox(
        { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
        false
      );
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url:
            "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
        })
      ).to.be.true;
    });

    it("should launch firefox in normal mode", async () => {
      setIsCurrentTabValidUrlScheme(true);
      const result = await launchFirefox(
        { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
        true
      );
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
        })
      ).to.be.true;
    });

    it("should not launch firefox if the url scheme is not valid", async () => {
      setIsCurrentTabValidUrlScheme(false);
      const result = await launchFirefox(
        { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
        true
      );
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update.called).to.be.false;
    });

    it("should not launch firefox if firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await launchFirefox(
        { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
        true
      );
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update.called).to.be.false;
    });
  });

  describe("checkAndUpdateURLScheme()", () => {
    it("should set the current tab url scheme to be false if it is undefined", () => {
      setIsCurrentTabValidUrlScheme(true);
      checkAndUpdateURLScheme({ id: 1 });
      expect(getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be false if it is not http or file", () => {
      setIsCurrentTabValidUrlScheme(true);
      checkAndUpdateURLScheme({ id: 1, url: "about:blank" });
      expect(getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be true if it is http", () => {
      setIsCurrentTabValidUrlScheme(false);
      checkAndUpdateURLScheme({ id: 1, url: "http://www.google.com" });
      expect(getIsCurrentTabValidUrlScheme()).to.be.true;
    });

    it("should set the current tab url scheme to be true if it is file", () => {
      setIsCurrentTabValidUrlScheme(false);
      checkAndUpdateURLScheme({ id: 1, url: "file://C:/Users" });
      expect(getIsCurrentTabValidUrlScheme()).to.be.true;
    });
  });

  describe("handleHotkeyPress()", () => {
    it("should launch firefox in normal mode", async () => {
      setIsCurrentTabValidUrlScheme(true);
      await handleHotkeyPress("launchFirefox", {
        id: 1,
        url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
        })
      ).to.be.true;
    });

    it("should launch firefox in private mode", async () => {
      setIsCurrentTabValidUrlScheme(true);
      await handleHotkeyPress("launchFirefoxPrivate", {
        id: 1,
        url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
      expect(global.chrome.tabs.update.calledOnce).to.be.true;
      expect(
        global.chrome.tabs.update.calledWith(1, {
          url:
            "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
        })
      ).to.be.true;
    });

    it("should do nothing if the command is not recognized", async () => {
      setIsCurrentTabValidUrlScheme(true);
      await handleHotkeyPress("notvalid", {
        id: 1,
        url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
      expect(global.chrome.tabs.update.called).to.be.false;
    });
  });

  describe("getIsFirefoxDefault()", () => {
    it("should return true if firefox is the default browser", async () => {
      setIsFirefoxDefault(true);
      const result = await getIsFirefoxDefault();
      expect(result).to.equal(true);
    });

    it("should return false if firefox is not the default browser", async () => {
      setIsFirefoxDefault(false);
      const result = await getIsFirefoxDefault();
      expect(result).to.equal(false);
    });

    it("should return true if nothing is set", async () => {
      setIsFirefoxDefault(undefined);
      const result = await getIsFirefoxDefault();
      expect(result).to.equal(true);
    });
  });

  describe("getIsFirefoxInstalled()", () => {
    it("should return true if firefox is installed", async () => {
      setIsFirefoxInstalled(true);
      const result = await getIsFirefoxInstalled();
      expect(result).to.equal(true);
    });

    it("should return false if firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await getIsFirefoxInstalled();
      expect(result).to.equal(false);
    });

    it("should return true if nothing is set", async () => {
      setIsFirefoxInstalled(undefined);
      const result = await getIsFirefoxInstalled();
      expect(result).to.equal(true);
    });
  });

  describe("getIsAutoRedirect()", () => {
    it("should return true if auto redirect is enabled", async () => {
      setIsAutoRedirect(true);
      const result = await getIsAutoRedirect();
      expect(result).to.equal(true);
    });

    it("should return false if auto redirect is disabled", async () => {
      setIsAutoRedirect(false);
      const result = await getIsAutoRedirect();
      expect(result).to.equal(false);
    });

    it("should return true if nothing is set", async () => {
      setIsAutoRedirect(undefined);
      const result = await getIsAutoRedirect();
      expect(result).to.equal(true);
    });
  });

  describe("getExternalSites()", () => {
    it("should return the external sites", async () => {
      const site = {
        id: 1,
        url: "https://www.google.com",
        isPrivate: false,
      };
      setExternalSites([site]);
      const result = await getExternalSites();
      expect(result).to.deep.equal([site]);
    });

    it("should return an empty array if nothing is set", async () => {
      setExternalSites(undefined);
      const result = await getExternalSites();
      expect(result).to.deep.equal([]);
    });
  });

  describe("refreshDeclarativeNetRequestRules()", () => {});

  describe("handleAutoRedirect()", () => {});

  describe("getCurrentTabSLD()", () => {
    it("should return the current tab sld", async () => {
      setCurrentTabURL("https://www.google.com");
      const result = await getCurrentTabSLD();
      expect(result).to.equal("google.com");
    });

    it("should return undefined if the url is not valid", async () => {
      setCurrentTabURL(undefined);
      const result = await getCurrentTabSLD();
      expect(result).to.equal("");
    });
  });

  describe("updateAddCurrentSiteToMySitesContextMenu()", () => {
    it("should enable the context menu if the current tab has an SLD", async () => {
      setCurrentTabURL("https://www.google.com");
      await updateAddCurrentSiteToMySitesContextMenu();
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "addCurrentSiteToMySitesContextMenu",
          {
            title: "Add this site to My Firefox Sites",
            enabled: true,
          }
        )
      ).to.be.true;
    });

    it("should disable the context menu if the current tab does not have an SLD", async () => {
      setCurrentTabURL(undefined);
      await updateAddCurrentSiteToMySitesContextMenu();
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "addCurrentSiteToMySitesContextMenu",
          {
            title: "Add this site to My Firefox Sites",
            enabled: false,
          }
        )
      ).to.be.true;
    });
  });

  describe("handleChangeDefaultLaunchContextMenuClick()", () => {
    it("should change the alternative launch context menu to private", async () => {
      setIsFirefoxDefault(false);
      await handleChangeDefaultLaunchContextMenuClick();
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "alternativeLaunchContextMenu",
          {
            title: "Launch this page in Firefox Private Browsing",
          }
        )
      ).to.be.true;
    });

    it("should change the alternative launch context menu to normal", async () => {
      setIsFirefoxDefault(true);
      await handleChangeDefaultLaunchContextMenuClick();
      expect(global.chrome.contextMenus.update.calledOnce).to.be.true;
      expect(
        global.chrome.contextMenus.update.calledWith(
          "alternativeLaunchContextMenu",
          {
            title: "Launch this page in Firefox",
          }
        )
      ).to.be.true;
    });
  });

  describe("handleAutoRedirectCheckboxContextMenuClick", () => {});
});

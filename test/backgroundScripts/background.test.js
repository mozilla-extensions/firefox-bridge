require("../setup.js");

const setIsFirefoxDefault = (isFirefoxDefault) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({isFirefoxDefault});
  });
};

const setIsFirefoxInstalled = (isFirefoxInstalled) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({isFirefoxInstalled});
  });
};

describe("background.js", () => {
  beforeEach(() => {
    setIsFirefoxInstalled(true);
    // replace underscores with spaces
    global.chrome.i18n.getMessage.callsFake((key) => key.replace(/_/g, " "));
  });

  describe("initContextMenu()", () => {
    it("should create the context menu", async () => {
      setIsFirefoxDefault(true);
      await global.chrome.background.initContextMenu();
      expect(global.chrome.contextMenus.create.callCount).to.equal(10);
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "changeDefaultLaunchContextMenu",
        title: "Always use Firefox Private Browsing",
        contexts: ["action"],
        type: "checkbox",
        checked: false,
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "alternativeLaunchContextMenu",
        title: "Launch this page in Firefox Private Browsing",
        contexts: ["action"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "launchInFirefox",
        title: "Launch this page in Firefox",
        contexts: ["page"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "launchInFirefoxPrivate",
        title: "Launch this page in Firefox Private Browsing",
        contexts: ["page"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "launchInFirefoxLink",
        title: "Launch this link in Firefox",
        contexts: ["link"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "launchInFirefoxPrivateLink",
        title: "Launch this link in Firefox Private Browsing",
        contexts: ["link"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "manageExternalSitesContextMenu",
        title: "Manage My Firefox Sites",
        contexts: ["action"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "manageExternalSitesContextMenu",
        title: "Manage My Firefox Sites",
        contexts: ["action"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "separator",
        type: "separator",
        contexts: ["action"],
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "addCurrentSiteContextMenu",
        title: "Add this site to My Firefox Sites",
        contexts: ["action"],
        enabled: false,
      });
      expect(global.chrome.contextMenus.create).to.have.been.calledWith({
        id: "autoRedirectCheckboxContextMenu",
        title: "auto redirect my firefox sites",
        contexts: ["action"],
        type: "checkbox",
        checked: true,
      });

    });
  });

  describe("handleContextMenuClick()", () => {
    it("should change the default launch mode to private", async () => {
      setIsFirefoxDefault(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "changeDefaultLaunchContextMenu"}, {});
      expect(global.chrome.contextMenus.update).to.have.been.calledOnce;
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox",
      });

    });

    it("should change the default launch mode to normal", async () => {
      setIsFirefoxDefault(false);
      await global.chrome.background.handleContextMenuClick({menuItemId: "changeDefaultLaunchContextMenu"}, {});
      expect(global.chrome.contextMenus.update).to.have.been.calledOnce
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox Private Browsing",
      });
    });

    it("should launch firefox in the alternative launch mode to default", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "alternativeLaunchContextMenu"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });

      setIsFirefoxDefault(false);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "alternativeLaunchContextMenu"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledTwice;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in normal mode from the page context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "launchInFirefox"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in private mode from the page context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "launchInFirefoxPrivate"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });
    });

    it("should launch firefox in normal mode from the link context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "launchInFirefoxLink"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in private mode from the link context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleContextMenuClick({menuItemId: "launchInFirefoxPrivateLink"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });
    });
  });

  describe("updateToolbarIcon()", () => {
    it("should update the toolbar icon to firefox icon grey colour", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(false);
      await global.chrome.background.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/firefox32grey.png",
        },
      });
    });

    it("should update the toolbar icon to private browsing icon grey colour", async () => {
      setIsFirefoxDefault(false);
      global.chrome.background.setIsCurrentTabValidUrlScheme(false);
      await global.chrome.background.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/private32grey.png",
        },
      });
    });

    it("should update the toolbar icon to firefox icon", async () => {
      setIsFirefoxDefault(true);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/firefox32.png",
        },
      });
    });

    it("should update the toolbar icon to private browsing icon", async () => {
      setIsFirefoxDefault(false);
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/private32.png",
        },
      });
    });
  });

  describe("launchFirefox()", () => {
    it("should launch firefox in private mode", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      const result = await global.chrome.background.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, false);
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should launch firefox in normal mode", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      const result = await global.chrome.background.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should not launch firefox if the url scheme is not valid", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(false);
      const result = await global.chrome.background.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });

    it("should not launch firefox if firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await global.chrome.background.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });
  });

  describe("checkAndUpdateURLScheme()", () => {
    it("should set the current tab url scheme to be false if it is undefined", () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      global.chrome.background.checkAndUpdateURLScheme({id: 1});
      expect(global.chrome.background.getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be false if it is not http or file", () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      global.chrome.background.checkAndUpdateURLScheme({id: 1, url: "about:blank"});
      expect(global.chrome.background.getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be true if it is http", () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(false);
      global.chrome.background.checkAndUpdateURLScheme({id: 1, url: "http://www.google.com"});
      expect(global.chrome.background.getIsCurrentTabValidUrlScheme()).to.be.true;
    });

    it("should set the current tab url scheme to be true if it is file", () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(false);
      global.chrome.background.checkAndUpdateURLScheme({id: 1, url: "file://C:/Users"});
      expect(global.chrome.background.getIsCurrentTabValidUrlScheme()).to.be.true;
    });
  });

  describe("handleHotkeyPress()", () => {
    it("should launch firefox in normal mode", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleHotkeyPress("launchFirefox", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should launch firefox in private mode", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleHotkeyPress("launchFirefoxPrivate", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should do nothing if the command is not recognized", async () => {
      global.chrome.background.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.background.handleHotkeyPress("notvalid", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });
  });

  describe("getIsFirefoxDefault()", () => {
    it("should return true if firefox is the default browser", async () => {
      setIsFirefoxDefault(true);
      const result = await global.chrome.background.getIsFirefoxDefault();
      expect(result).to.equal(true);
    });

    it("should return false if firefox is not the default browser", async () => {
      setIsFirefoxDefault(false);
      const result = await global.chrome.background.getIsFirefoxDefault();
      expect(result).to.equal(false);
    });

    it("should return true if nothing is set", async () => {
      setIsFirefoxDefault(undefined);
      const result = await global.chrome.background.getIsFirefoxDefault();
      expect(result).to.equal(true);
    });
  });

  describe("getIsFirefoxInstalled()", () => {
    it("should return true if firefox is installed", async () => {
      setIsFirefoxInstalled(true);
      const result = await global.chrome.background.getIsFirefoxInstalled();
      expect(result).to.equal(true);
    });

    it("should return false if firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await global.chrome.background.getIsFirefoxInstalled();
      expect(result).to.equal(false);
    });

    it("should return true if nothing is set", async () => {
      setIsFirefoxInstalled(undefined);
      const result = await global.chrome.background.getIsFirefoxInstalled();
      expect(result).to.equal(true);
    });
  });
});
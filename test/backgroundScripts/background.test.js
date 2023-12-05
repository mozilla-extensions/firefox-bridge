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
  });

  describe("initContextMenu()", () => {
    it("should create the context menu", async () => {
      setIsFirefoxDefault(true);
      await global.chrome.initContextMenu();
      expect(global.chrome.contextMenus.create.callCount).to.equal(6);
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

    });
  });

  describe("handleContextMenuClick()", () => {
    it("should change the default launch mode to private", async () => {
      setIsFirefoxDefault(true);
      await global.chrome.handleContextMenuClick({menuItemId: "changeDefaultLaunchContextMenu"}, {});
      expect(global.chrome.contextMenus.update).to.have.been.calledTwice;
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("changeDefaultLaunchContextMenu", {
        type: "checkbox",
        checked: true,
      });
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox",
      });

    });

    it("should change the default launch mode to normal", async () => {
      setIsFirefoxDefault(false);
      await global.chrome.handleContextMenuClick({menuItemId: "changeDefaultLaunchContextMenu"}, {});
      expect(global.chrome.contextMenus.update).to.have.been.calledTwice;
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("changeDefaultLaunchContextMenu", {
        type: "checkbox",
        checked: false,
      });
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox Private Browsing",
      });
    });

    it("should launch firefox in the alternative launch mode to default", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "alternativeLaunchContextMenu"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });

      setIsFirefoxDefault(false);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "alternativeLaunchContextMenu"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledTwice;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in normal mode from the page context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "launchInFirefox"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in private mode from the page context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "launchInFirefoxPrivate"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });
    });

    it("should launch firefox in normal mode from the link context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "launchInFirefoxLink"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://basicurl.com",
      });
    });

    it("should launch firefox in private mode from the link context", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleContextMenuClick({menuItemId: "launchInFirefoxPrivateLink"}, {id: 1, url: "https://basicurl.com"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      });
    });
  });

  describe("updateToolbarIcon()", () => {
    it("should update the toolbar icon to firefox icon grey colour", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(false);
      await global.chrome.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/firefox32grey.png",
        },
      });
    });

    it("should update the toolbar icon to private browsing icon grey colour", async () => {
      setIsFirefoxDefault(false);
      global.chrome.setIsCurrentTabValidUrlScheme(false);
      await global.chrome.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/private32grey.png",
        },
      });
    });

    it("should update the toolbar icon to firefox icon", async () => {
      setIsFirefoxDefault(true);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.updateToolbarIcon();
      expect(global.chrome.action.setIcon).to.have.been.calledOnce;
      expect(global.chrome.action.setIcon).to.have.been.calledWith({
        path: {
          32: "images/firefox32.png",
        },
      });
    });

    it("should update the toolbar icon to private browsing icon", async () => {
      setIsFirefoxDefault(false);
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.updateToolbarIcon();
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
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      const result = await global.chrome.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, false);
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should launch firefox in normal mode", async () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      const result = await global.chrome.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(true);
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should not launch firefox if the url scheme is not valid", async () => {
      global.chrome.setIsCurrentTabValidUrlScheme(false);
      const result = await global.chrome.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });

    it("should not launch firefox if firefox is not installed", async () => {
      setIsFirefoxInstalled(false);
      const result = await global.chrome.launchFirefox({id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"}, true);
      expect(result).to.equal(false);
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });
  });

  describe("checkAndUpdateURLScheme()", () => {
    it("should set the current tab url scheme to be false if it is undefined", () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      global.chrome.checkAndUpdateURLScheme({id: 1});
      expect(global.chrome.getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be false if it is not http or file", () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      global.chrome.checkAndUpdateURLScheme({id: 1, url: "about:blank"});
      expect(global.chrome.getIsCurrentTabValidUrlScheme()).to.be.false;
    });

    it("should set the current tab url scheme to be true if it is http", () => {
      global.chrome.setIsCurrentTabValidUrlScheme(false);
      global.chrome.checkAndUpdateURLScheme({id: 1, url: "http://www.google.com"});
      expect(global.chrome.getIsCurrentTabValidUrlScheme()).to.be.true;
    });

    it("should set the current tab url scheme to be true if it is file", () => {
      global.chrome.setIsCurrentTabValidUrlScheme(false);
      global.chrome.checkAndUpdateURLScheme({id: 1, url: "file://C:/Users"});
      expect(global.chrome.getIsCurrentTabValidUrlScheme()).to.be.true;
    });
  });

  describe("handleHotkeyPress()", () => {

    it("should launch firefox in normal mode", async () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleHotkeyPress("launchFirefox", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should launch firefox in private mode", async () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleHotkeyPress("launchFirefoxPrivate", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.have.been.calledOnce;
      expect(global.chrome.tabs.update).to.have.been.calledWith(1, {
        url: "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      });
    });

    it("should do nothing if the command is not recognized", async () => {
      global.chrome.setIsCurrentTabValidUrlScheme(true);
      await global.chrome.handleHotkeyPress("notvalid", {id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/"});
      expect(global.chrome.tabs.update).to.not.have.been.called;
    });
  });
});
import { expect } from "chai";
import { describe, it } from "mocha";

import { setCurrentTabURL, setIsFirefoxDefault } from "../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "../../src/chromium/backgroundScripts/launchBrowser.js";

import {
  initContextMenu,
  handleChangeDefaultLaunchContextMenuClick,
  handleContextMenuClick,
  updateAddCurrentSiteToMySitesContextMenu,
} from "../../src/chromium/backgroundScripts/contextMenus.js";


describe("initContextMenu()", () => {
  it("should create the context menu", async () => {
    setIsFirefoxDefault(true);
    await initContextMenu();
    expect(chrome.contextMenus.create.callCount).to.equal(10);
    expect(
      chrome.contextMenus.create.calledWith({
        id: "changeDefaultLaunchContextMenu",
        title: "Always use Firefox Private Browsing",
        contexts: ["action"],
        type: "checkbox",
        checked: false,
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "alternativeLaunchContextMenu",
        title: "Launch this page in Firefox Private Browsing",
        contexts: ["action"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "launchInFirefox",
        title: "Launch this page in Firefox",
        contexts: ["page"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "launchInFirefoxPrivate",
        title: "Launch this page in Firefox Private Browsing",
        contexts: ["page"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "launchInFirefoxLink",
        title: "Launch this link in Firefox",
        contexts: ["link"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "launchInFirefoxPrivateLink",
        title: "Launch this link in Firefox Private Browsing",
        contexts: ["link"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "manageExternalSitesContextMenu",
        title: "Manage My Firefox Sites",
        contexts: ["action"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "manageExternalSitesContextMenu",
        title: "Manage My Firefox Sites",
        contexts: ["action"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "separator",
        type: "separator",
        contexts: ["action"],
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
        id: "addCurrentSiteToMySitesContextMenu",
        title: "Add this site to My Firefox Sites",
        contexts: ["action"],
        enabled: false,
      })
    ).to.be.true;
    expect(
      chrome.contextMenus.create.calledWith({
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
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
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
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
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
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      })
    ).to.be.true;

    setIsFirefoxDefault(false);
    setIsCurrentTabValidUrlScheme(true);
    await handleContextMenuClick(
      { menuItemId: "alternativeLaunchContextMenu" },
      { id: 1, url: "https://basicurl.com" }
    );
    expect(chrome.tabs.update.calledTwice).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
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
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
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
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
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
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
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
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url: "firefox-private:https://basicurl.com",
      })
    ).to.be.true;
  });
});

describe("updateAddCurrentSiteToMySitesContextMenu()", () => {
  it("should enable the context menu if the current tab has an SLD", async () => {
    setCurrentTabURL("https://www.google.com");
    await updateAddCurrentSiteToMySitesContextMenu();
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
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
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
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
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
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
    expect(chrome.contextMenus.update.calledOnce).to.be.true;
    expect(
      chrome.contextMenus.update.calledWith(
        "alternativeLaunchContextMenu",
        {
          title: "Launch this page in Firefox",
        }
      )
    ).to.be.true;
  });
});

describe("handleAutoRedirectCheckboxContextMenuClick", () => {});
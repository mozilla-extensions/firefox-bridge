import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import * as settingEvent from "Shared/generated/settingEvent.js";
import * as launchEvent from "Shared/generated/launchEvent.js";
import { handleDuplicateIDError } from "Shared/backgroundScripts/contextMenus.js";

/**
 * Initialize the chromium specific context menu items.
 */
export async function applyPlatformContextMenus() {
  const externalBrowserName = (await getExternalBrowser()) || "Firefox";

  // action context menu
  await browser.contextMenus.create(
    {
      id: "launchInFirefoxContextMenu",
      title: browser.i18n.getMessage("launchInExternalBrowser", "Firefox"),
      contexts: ["action"],
    },
    handleDuplicateIDError,
  );

  await browser.contextMenus.create(
    {
      id: "launchInFirefoxPrivateContextMenu",
      title: browser.i18n.getMessage(
        "launchInExternalBrowser",
        "Firefox Private Browsing",
      ),
      contexts: ["action"],
    },
    handleDuplicateIDError,
  );

  await browser.contextMenus.create(
    {
      id: "changeDefaultLaunchContextMenu",
      title: browser.i18n.getMessage("changeDefaultLaunchContextMenu"),
      contexts: ["action"],
      type: "checkbox",
      checked: !(externalBrowserName === "Firefox"),
    },
    handleDuplicateIDError,
  );

  // separator
  await browser.contextMenus.create(
    {
      id: "separator",
      type: "separator",
      contexts: ["action"],
    },
    handleDuplicateIDError,
  );

  // External sites context menu
  // browser.contextMenus.create({
  //   id: "separator",
  //   type: "separator",
  //   contexts: ["action"],
  // });
  // browser.contextMenus.create({
  //   id: "addCurrentSiteToMySitesContextMenu",
  //   title: browser.i18n.getMessage("addCurrentSiteToMySitesContextMenu").replace("[SLD] ", ""),
  //   contexts: ["action"],
  //   enabled: false
  // });
  // browser.contextMenus.create({
  //   id: "autoRedirectCheckboxContextMenu",
  //   title: browser.i18n.getMessage("autoRedirectCheckboxContextMenu"),
  //   contexts: ["action"],
  //   type: "checkbox",
  //   checked: await getIsAutoRedirect(),
  // });
  // browser.contextMenus.create({
  //   id: "manageExternalSitesContextMenu",
  //   title: browser.i18n.getMessage("manageExternalSitesContextMenu"),
  //   contexts: ["action"],
  // });

  // page context menu
  await browser.contextMenus.create(
    {
      id: "launchInExternalBrowserPrivatePage",
      title: browser.i18n.getMessage(
        "launchInExternalBrowser",
        "Firefox Private Browsing",
      ),
      contexts: ["page"],
      documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"],
    },
    handleDuplicateIDError,
  );

  // link context menu
  await browser.contextMenus.create(
    {
      id: "launchInExternalBrowserPrivateLink",
      title: browser.i18n.getMessage(
        "launchInExternalBrowserLink",
        "Firefox Private Browsing",
      ),
      contexts: ["link"],
      targetUrlPatterns: ["http://*/*", "https://*/*", "file:///*"],
    },
    handleDuplicateIDError,
  );
}

/**
 * Change the default launch mode on context menu click. Updates
 * context menu items and toolbar icon to reflect the change.
 */
export async function handleChangeDefaultLaunchContextMenuClick() {
  const externalBrowserName = await getExternalBrowser();

  browser.contextMenus.update("changeDefaultLaunchContextMenu", {
    checked: externalBrowserName === "Firefox",
  });

  if (externalBrowserName === "Firefox") {
    browser.storage.sync.set({
      currentExternalBrowser: "Firefox Private Browsing",
    });
  } else {
    browser.storage.sync.set({ currentExternalBrowser: "Firefox" });
  }
}

/**
 * Handles the context menu clicks for the Chromium Extension.
 *
 * @param {*} info  The context menu item info object.
 * @param {*} tab  The tab object to launch the browser with.
 */
export async function handlePlatformContextMenuClick(info, tab) {
  const externalBrowserName = await getExternalBrowser();

  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
    settingEvent.currentBrowser.record({
      from: externalBrowserName,
      to:
        externalBrowserName === "Firefox"
          ? "Firefox Private Browsing"
          : "Firefox",
      source: "action_context_menu",
    });
  } else if (info.menuItemId === "launchInFirefoxContextMenu") {
    if (await launchBrowser(tab.url)) {
      launchEvent.browserLaunch.record({
        browser: "Firefox",
        source: "action_context_menu",
      });
    }
  } else if (info.menuItemId === "launchInFirefoxPrivateContextMenu") {
    if (await launchBrowser(tab.url, true)) {
      launchEvent.browserLaunch.record({
        browser: "Firefox Private Browsing",
        source: "action_context_menu",
      });
    }
  } else if (info.menuItemId === "launchInExternalBrowserPrivatePage") {
    if (await launchBrowser(info.pageUrl, true)) {
      launchEvent.browserLaunch.record({
        browser: "Firefox Private Browsing",
        source: "page_context_menu",
      });
    }
  } else if (info.menuItemId === "launchInExternalBrowserPrivateLink") {
    tab.url = info.linkUrl;
    if (await launchBrowser(info.linkUrl, true)) {
      launchEvent.browserLaunch.record({
        browser: "Firefox Private Browsing",
        source: "link_context_menu",
      });
    }
  }
}

export async function applyPlatformContextMenus() {
  console.log("applyPlatformContextMenus");
  chrome.contextMenus.create({
    id: "separator",
    type: "separator",
    contexts: ["action"],
  });
  chrome.contextMenus.create({
    id: "openWelcomePage",
    title: chrome.i18n.getMessage("openWelcomePage"),
    contexts: ["action"],
  });

  // External sites context menu
  // chrome.contextMenus.create({
  //   id: "separator",
  //   type: "separator",
  //   contexts: ["action"],
  // });
  // chrome.contextMenus.create({
  //   id: "addCurrentSiteToMySitesContextMenu",
  //   title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD] ", ""),
  //   contexts: ["action"],
  //   enabled: false
  // });
  // chrome.contextMenus.create({
  //   id: "autoRedirectCheckboxContextMenu",
  //   title: chrome.i18n.getMessage("auto_redirect_my_firefox_sites"),
  //   contexts: ["action"],
  //   type: "checkbox",
  //   checked: await getIsAutoRedirect(),
  // });
  // chrome.contextMenus.create({
  //   id: "manageExternalSitesContextMenu",
  //   title: chrome.i18n.getMessage("Manage_My_Firefox_Sites"),
  //   contexts: ["action"],
  // });
}

export async function handlePlatformContextMenuClick(info, tab) {
  if (
    info.menuItemId === "openWelcomePage"
  ) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("shared/pages/welcomePage/index.html"),
    });
  }
}
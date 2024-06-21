export function replaceMessage(element, l10nID, href) {
  let message = browser.i18n.getMessage(l10nID);
  if (!message) {
    return false;
  }

  if (message.includes("<a>")) {
    const prefix = message.split("<a>")[0];
    const suffix = message.split("</a>")[1];
    const text = message.split("<a>")[1].split("</a>")[0];
    const anchor = document.createElement("a");
    anchor.href = href || "";
    anchor.textContent = text;
    if (anchor.protocol === "javascript:") {
      element.replaceChildren(prefix, text, suffix);
    } else {
      element.replaceChildren(prefix, anchor, suffix);
    }
  } else {
    element.replaceChildren(message);
  }

  // handle browser shortcut page cases
  if (
    l10nID === "welcomePageManageShortcutsFirefox" ||
    l10nID === "welcomePageNoShortcutsFirefox"
  ) {
    const link = element.querySelector("a");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      browser.experiments.firefox_bridge.openShortcutsPage();
    });
  } else if (
    l10nID === "welcomePageManageShortcutsChromium" ||
    l10nID === "welcomePageNoShortcutsChromium"
  ) {
    const link = element.querySelector("a");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      browser.tabs.create({ url: "chrome://extensions/shortcuts" });
    });
  }

  return true;
}

/**
 * Replace the innerHTML of an element with the localized string.
 *
 * @param {string} id The id of the element in the HTML to replace.
 * @param {string} href The href to use for the link listener if required.
 * @param {string} platform The platform to append to the id if required.
 *
 * @returns {boolean} True if the element was found and replaced, false otherwise.
 */
export function replaceDataLocale(id, href, platform = "") {
  const element = document.querySelector(`[data-locale="${id}"]`);
  if (!element) {
    return false;
  }

  return replaceMessage(element, `${id}${platform}`, href);
}

/**
 * Apply localization to the page.
 */
export function applyLocalization() {
  const elements = document.querySelectorAll("[data-locale]");
  const hrefMapping = {
    welcomePageErrorChromium: "https://mzl.la/dbe-fxinstall",
    welcomePagePrivacyPolicyIntro: "https://www.mozilla.org/privacy/",
    welcomePageNoExternalBrowserErrorChromium:
      "https://www.mozilla.org/firefox/new/",
    welcomePageTryOtherExtensionChromium: "https://mzl.la/dbe-firefox",
    welcomePageTryOtherExtensionFirefox: "https://mzl.la/dbe-chromium",
  };

  // attempt to replace each element
  elements.forEach((element) => {
    const localeId = element.getAttribute("data-locale");

    // attempt to replace the element with the localized string
    if (replaceDataLocale(localeId, hrefMapping[localeId])) {
      return;
    }

    // attempt to replace platform specific elements
    if (IS_FIREFOX_EXTENSION) {
      const platform = "Firefox";
      replaceDataLocale(localeId, hrefMapping[localeId + platform], platform);
    } else if (IS_CHROMIUM_EXTENSION) {
      const platform = "Chromium";
      replaceDataLocale(localeId, hrefMapping[localeId + platform], platform);
    }
  });
}

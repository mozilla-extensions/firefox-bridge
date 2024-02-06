export let isCurrentTabValidUrlScheme = false;

/**
 * Checks if the given tab has a valid url scheme. If so, updates the global variable
 * isCurrentTabValidUrlScheme to true. Otherwise, updates it to false.
 *
 * @param {*} tab The tab to check the url scheme of.
 */
export function checkAndUpdateURLScheme(tab) {
  if (
    tab.url === undefined ||
    tab.url.startsWith("http") ||
    tab.url.startsWith("file")
  ) {
    isCurrentTabValidUrlScheme = true;
  } else {
    isCurrentTabValidUrlScheme = false;
  }
}

/**
 * Checks if the given url's protocol is one of https:, http:, or file:.
 *
 * @param {string} url A url to check the scheme of.
 * @returns {boolean} True if the url is valid, false otherwise.
 */
export function isURLValid(url) {
  return (
    url &&
    (url.startsWith("https:") ||
      url.startsWith("http:") ||
      url.startsWith("file:"))
  );
}

/**
 * Sets the global variable isCurrentTabValidUrlScheme to the given boolean.
 * For use in tests.
 *
 * @param {boolean} bool The boolean to set the global variable to.
 */
export const setIsCurrentTabValidUrlScheme = (bool) => {
  isCurrentTabValidUrlScheme = bool;
};

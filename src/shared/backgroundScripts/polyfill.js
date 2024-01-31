/**
 * Polyfill the browser object to be compatible with both Chrome MV3 and Firefox MV2.
 */
export function polyfillBrowser() {
  globalThis.browser ??= chrome;
  browser.action ??= browser.browserAction;
}

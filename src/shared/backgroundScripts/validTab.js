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

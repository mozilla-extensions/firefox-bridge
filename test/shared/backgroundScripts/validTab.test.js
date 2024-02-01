import {
  checkAndUpdateURLScheme,
  isCurrentTabValidUrlScheme,
  setIsCurrentTabValidUrlScheme,
} from "Shared/backgroundScripts/validTab.js";

describe("shared/backgroundScripts/validTab.js", () => {
  describe("checkAndUpdateURLScheme()", () => {
    it("should return true if the scheme is http or https", () => {
      setIsCurrentTabValidUrlScheme(false);
      checkAndUpdateURLScheme({
        url: "http://www.google.com",
      });
      expect(isCurrentTabValidUrlScheme).toBeTruthy();

      setIsCurrentTabValidUrlScheme(false);
      checkAndUpdateURLScheme({
        url: "https://www.google.com",
      });
      expect(isCurrentTabValidUrlScheme).toBeTruthy();

      setIsCurrentTabValidUrlScheme(false);
      checkAndUpdateURLScheme({
        url: "file://path/to/file",
      });
      expect(isCurrentTabValidUrlScheme).toBeTruthy();
    });

    it("should return false if the scheme is not http or https", () => {
      setIsCurrentTabValidUrlScheme(true);
      checkAndUpdateURLScheme({
        url: "chrome://extensions/",
      });
      expect(isCurrentTabValidUrlScheme).toBeFalsy();

      setIsCurrentTabValidUrlScheme(true);
      checkAndUpdateURLScheme({
        url: "about:blank",
      });
      expect(isCurrentTabValidUrlScheme).toBeFalsy();
    });
  });

  describe("setIsCurrentTabValidUrlScheme()", () => {
    it("should set the value of isCurrentTabValidUrlScheme", () => {
      setIsCurrentTabValidUrlScheme(true);
      expect(isCurrentTabValidUrlScheme).toBeTruthy();

      setIsCurrentTabValidUrlScheme(false);
      expect(isCurrentTabValidUrlScheme).toBeFalsy();
    });
  });
});

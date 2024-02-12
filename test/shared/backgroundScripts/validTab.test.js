import { isURLValid } from "Shared/backgroundScripts/validTab.js";

describe("shared/backgroundScripts/validTab.js", () => {
  describe("isURLValid()", () => {
    it("should return true for a valid URL", () => {
      expect(isURLValid("https://example.com")).toBe(true);
    });
    it("should return false for an invalid URL", () => {
      expect(isURLValid("invalid")).toBe(false);
    });
  });
});

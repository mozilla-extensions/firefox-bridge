import { expect } from "chai";
import { describe, it } from "mocha";

import {
  getDefaultIconPath,
  getGreyedIconPath,
} from "../../../build/firefox/interfaces/getters.js";

describe("firefox/interfaces/getters.js", () => {

  describe("getDefaultIconPath()", () => {
    it("should return the current browser icon path", async () => {
      const result = getDefaultIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/chrome/32.png"),
      });
    });
  });

  describe("getGreyedIconPath()", () => {
    it("should return the greyed current browser icon path", async () => {
      const result = getGreyedIconPath();
      expect(result).to.deep.equal({
        32: chrome.runtime.getURL("images/chrome/32grey.png"),
      });
    });
  });
});

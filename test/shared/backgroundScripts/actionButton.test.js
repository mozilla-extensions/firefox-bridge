import { expect } from "chai";
import { describe, it } from "mocha";

import {
  getDefaultIconPath,
} from "../../../build/chromium/interfaces/getters.js";
import { updateToolbarIcon } from "../../../build/chromium/shared/backgroundScripts/actionButton.js";

import { setStorage } from "../../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "../../../build/chromium/shared/backgroundScripts/validTab.js";

describe("shared/backgroundScripts/actionButton.js", () => {
  describe("updateToolbarIcon()", () => {
    it("should set the toolbar icon to the default icon path and enable it", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      setIsCurrentTabValidUrlScheme(true);
      await updateToolbarIcon();
      expect(browser.browserAction.setIcon.callCount).to.equal(1);
      expect(
        browser.browserAction.setIcon.calledWith({
          path: await getDefaultIconPath(),
        })
      ).to.be.true;
      expect(browser.browserAction.enable.callCount).to.equal(1);
    });

    it("should set the toolbar icon to the default icon path and disable it", async () => {
      setStorage("currentExternalBrowser", "Firefox");
      setIsCurrentTabValidUrlScheme(false);
      await updateToolbarIcon();
      expect(browser.browserAction.setIcon.callCount).to.equal(1);
      expect(
        browser.browserAction.setIcon.calledWith({
          path: await getDefaultIconPath(),
        })
      ).to.be.true;
      expect(browser.browserAction.disable.callCount).to.equal(1);
    });
  });
});

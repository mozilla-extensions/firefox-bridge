import { expect } from "chai";
import { describe, it } from "mocha";

import { initContextMenu } from "../../../build/chromium/shared/backgroundScripts/contextMenus.js";

import { setExternalBrowser, getLocaleMessage, setExtensionIsChromium } from "../../setup.test.js";

describe("shared/backgroundScripts/contextMenus.js", () => {
  describe("initContextMenu()", () => {
    it("should make the shared context menu", async () => {
      setExternalBrowser("Firefox");
      setExtensionIsChromium(true);
      await initContextMenu();
      expect(
        chrome.contextMenus.create.calledWith({
          id: "launchInExternalBrowser",
          title: getLocaleMessage("launchInExternalBrowser"),
          contexts: ["page"],
        })
      ).to.be.true;
      expect(
        chrome.contextMenus.create.calledWith({
          id: "launchInExternalBrowserLink",
          title: getLocaleMessage("launchInExternalBrowserLink"),
          contexts: ["link"],
        })
      ).to.be.true;
    });
  });
});

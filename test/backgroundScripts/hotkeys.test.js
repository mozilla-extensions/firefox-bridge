import { expect } from "chai";
import { describe, it } from "mocha";

import { setIsCurrentTabValidUrlScheme } from "../../src/backgroundScripts/launchBrowser.js";

import { handleHotkeyPress } from "../../src/backgroundScripts/hotkeys.js";

describe("handleHotkeyPress()", () => {
  it("should launch firefox in normal mode", async () => {
    setIsCurrentTabValidUrlScheme(true);
    await handleHotkeyPress("launchFirefox", {
      id: 1,
      url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
    });
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      })
    ).to.be.true;
  });

  it("should launch firefox in private mode", async () => {
    setIsCurrentTabValidUrlScheme(true);
    await handleHotkeyPress("launchFirefoxPrivate", {
      id: 1,
      url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
    });
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url:
            "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      })
    ).to.be.true;
  });

  it("should do nothing if the command is not recognized", async () => {
    setIsCurrentTabValidUrlScheme(true);
    await handleHotkeyPress("notvalid", {
      id: 1,
      url: "https://addons.mozilla.org/en-CA/firefox/extensions/",
    });
    expect(chrome.tabs.update.called).to.be.false;
  });
});
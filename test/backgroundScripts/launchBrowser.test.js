import { expect } from "chai";
import { describe, it } from "mocha";

import { setIsFirefoxInstalled, getIsCurrentTabValidUrlScheme } from "../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "../../src/chromium/backgroundScripts/launchBrowser.js";

import { launchFirefox, checkAndUpdateURLScheme } from "../../src/chromium/backgroundScripts/launchBrowser.js";


describe("launchFirefox()", () => {
  it("should launch firefox in private mode", async () => {
    setIsCurrentTabValidUrlScheme(true);
    const result = await launchFirefox(
      { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
      false
    );
    expect(result).to.equal(true);
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url:
            "firefox-private:https://addons.mozilla.org/en-CA/firefox/extensions/",
      })
    ).to.be.true;
  });

  it("should launch firefox in normal mode", async () => {
    setIsCurrentTabValidUrlScheme(true);
    const result = await launchFirefox(
      { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
      true
    );
    expect(result).to.equal(true);
    expect(chrome.tabs.update.calledOnce).to.be.true;
    expect(
      chrome.tabs.update.calledWith(1, {
        url: "firefox:https://addons.mozilla.org/en-CA/firefox/extensions/",
      })
    ).to.be.true;
  });

  it("should not launch firefox if the url scheme is not valid", async () => {
    setIsCurrentTabValidUrlScheme(false);
    const result = await launchFirefox(
      { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
      true
    );
    expect(result).to.equal(false);
    expect(chrome.tabs.update.called).to.be.false;
  });

  it("should not launch firefox if firefox is not installed", async () => {
    setIsFirefoxInstalled(false);
    const result = await launchFirefox(
      { id: 1, url: "https://addons.mozilla.org/en-CA/firefox/extensions/" },
      true
    );
    expect(result).to.equal(false);
    expect(chrome.tabs.update.called).to.be.false;
  });
});

describe("checkAndUpdateURLScheme()", () => {
  it("should set the current tab url scheme to be false if it is undefined", () => {
    setIsCurrentTabValidUrlScheme(true);
    checkAndUpdateURLScheme({ id: 1 });
    expect(getIsCurrentTabValidUrlScheme()).to.be.false;
  });

  it("should set the current tab url scheme to be false if it is not http or file", () => {
    setIsCurrentTabValidUrlScheme(true);
    checkAndUpdateURLScheme({ id: 1, url: "about:blank" });
    expect(getIsCurrentTabValidUrlScheme()).to.be.false;
  });

  it("should set the current tab url scheme to be true if it is http", () => {
    setIsCurrentTabValidUrlScheme(false);
    checkAndUpdateURLScheme({ id: 1, url: "http://www.google.com" });
    expect(getIsCurrentTabValidUrlScheme()).to.be.true;
  });

  it("should set the current tab url scheme to be true if it is file", () => {
    setIsCurrentTabValidUrlScheme(false);
    checkAndUpdateURLScheme({ id: 1, url: "file://C:/Users" });
    expect(getIsCurrentTabValidUrlScheme()).to.be.true;
  });
});
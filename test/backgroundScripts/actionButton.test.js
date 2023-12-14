import { expect } from "chai";
import { describe, it } from "mocha";

import { setIsFirefoxDefault } from "../setup.test.js";
import { setIsCurrentTabValidUrlScheme } from "../../src/backgroundScripts/launchBrowser.js";

import { updateToolbarIcon } from "../../src/backgroundScripts/actionButton.js";

describe("updateToolbarIcon()", () => {
  it("should update the toolbar icon to firefox icon grey colour", async () => {
    setIsFirefoxDefault(true);
    setIsCurrentTabValidUrlScheme(false);
    await updateToolbarIcon();
    expect(chrome.action.setIcon.calledOnce).to.be.true;
    expect(
      chrome.action.setIcon.calledWith({
        path: {
          32: "../images/firefox32grey.png",
        },
      })
    ).to.be.true;
  });

  it("should update the toolbar icon to private browsing icon grey colour", async () => {
    setIsFirefoxDefault(false);
    setIsCurrentTabValidUrlScheme(false);
    await updateToolbarIcon();
    expect(chrome.action.setIcon.calledOnce).to.be.true;
    expect(
      chrome.action.setIcon.calledWith({
        path: {
          32: "../images/private32grey.png",
        },
      })
    ).to.be.true;
  });

  it("should update the toolbar icon to firefox icon", async () => {
    setIsFirefoxDefault(true);
    setIsCurrentTabValidUrlScheme(true);
    await updateToolbarIcon();
    expect(chrome.action.setIcon.calledOnce).to.be.true;
    expect(
      chrome.action.setIcon.calledWith({
        path: {
          32: "../images/firefox32.png",
        },
      })
    ).to.be.true;
  });

  it("should update the toolbar icon to private browsing icon", async () => {
    setIsFirefoxDefault(false);
    setIsCurrentTabValidUrlScheme(true);
    await updateToolbarIcon();
    expect(chrome.action.setIcon.calledOnce).to.be.true;
    expect(
      chrome.action.setIcon.calledWith({
        path: {
          32: "../images/private32.png",
        },
      })
    ).to.be.true;
  });
});

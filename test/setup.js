const sinonChai = require("sinon-chai");
const chai = require("chai");
const path = require("path");
global.sinon = require("sinon");
global.expect = chai.expect;
chai.use(sinonChai);

global.beforeEach(async () => {
  global.chrome = {
    contextMenus: {
      create: sinon.stub(),
      update: sinon.stub(),
      onClicked: {
        addListener: sinon.stub(),
      },
    },
    storage: {
      sync: {
        get: sinon.stub(),
        onChanged: {
          addListener: sinon.stub(),
        },
      },
    },
    runtime: {
      onInstalled: {
        addListener: sinon.stub(),
      },
    },
    action: {
      setIcon: sinon.stub(),
      onClicked: {
        addListener: sinon.stub(),
      },
    },
    tabs: {
      onUpdated: {
        addListener: sinon.stub(),
      },
      onActivated: {
        addListener: sinon.stub(),
      },
      onCreated: {
        addListener: sinon.stub(),
      },
    }
  };
  require(path.join(__dirname, "../src/background.js"));
});

describe("initContextMenu", () => {

  it("should create the context menu", async () => {
    const initContextMenu = global.chrome.initContextMenu;
    initContextMenu();
    expect(global.chrome.contextMenus.create).to.have.been.calledTwice;
    expect(global.chrome.contextMenus.create).to.have.been.calledWith({
      id: "changeDefaultLaunchContextMenu",
      title: "Always use Firefox Private Browsing",
      contexts: ["action"],
      type: "checkbox",
      checked: false,
    });
    expect(global.chrome.contextMenus.create).to.have.been.calledWith({
      id: "alternativeLaunchContextMenu",
      title: "Launch this page in Firefox Private Browsing",
      contexts: ["action"],
    });

  });
});
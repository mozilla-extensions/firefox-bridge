const sinonChai = require("sinon-chai");
const chai = require("chai");
global.sinon = require("sinon");
global.expect = chai.expect;
chai.use(sinonChai);

describe("initContextMenu", () => { 
  beforeEach(() => {
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

  });
  afterEach(() => {
    delete global.chrome;
  });
  it("should create context menus", () => {
    const {initContextMenu} = require("../src/background.js");
    initContextMenu();
    expect(global.chrome.contextMenus.create).to.have.been.calledTwice;
  });
}
);
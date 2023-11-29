const sinonChai = require("sinon-chai");
const chai = require("chai");
const path = require("path");
global.sinon = require("sinon");
global.expect = chai.expect;
chai.use(sinonChai);

global.chrome = {
  isTestEnv: true,
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
      set: sinon.stub(),
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
    update: sinon.stub(),
  }
};
require(path.join(__dirname, "../src/background.js"));

global.afterEach(() => {
  // reset stubs
  global.chrome.contextMenus.create.reset();
  global.chrome.contextMenus.update.reset();
  global.chrome.storage.sync.get.reset();
  global.chrome.storage.sync.set.reset();
  global.chrome.action.setIcon.reset();
  global.chrome.tabs.update.reset();
  global.chrome.action.onClicked.addListener.reset();
  global.chrome.tabs.onUpdated.addListener.reset();
  global.chrome.tabs.onActivated.addListener.reset();
  global.chrome.tabs.onCreated.addListener.reset();
  global.chrome.runtime.onInstalled.addListener.reset();
  global.chrome.contextMenus.onClicked.addListener.reset();
});

import sinon from "sinon";
import { beforeEach, afterEach } from "mocha";

import {
  isCurrentTabValidUrlScheme,
} from "../src/backgroundScripts/launchBrowser.js";

/* global global */
global.chrome = {
  testEnv: true,
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
    local: {
      get: sinon.stub(),
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
    create: sinon.stub(),
    query: sinon.stub(),
  },
  commands: {
    onCommand: {
      addListener: sinon.stub(),
    },
  },
  i18n: {
    getMessage: sinon.stub(),
  },
  webRequest: {
    onBeforeRequest: {
      addListener: sinon.stub(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: sinon.stub(),
    getDynamicRules: sinon.stub(),
  },
};

global.document = {
  addEventListener: sinon.stub(),
};

export const setIsFirefoxDefault = (isFirefoxDefault) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ isFirefoxDefault });
  });
};

export const setIsFirefoxInstalled = (isFirefoxInstalled) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isFirefoxInstalled });
  });
};

export const setIsAutoRedirect = (isAutoRedirect) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isAutoRedirect });
  });
};

export const setExternalSites = (firefoxSites) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ firefoxSites });
  });
};

export const setCurrentTabURL = (currentTabURL) => {
  global.chrome.tabs.query.callsFake((queryInfo, callback) => {
    callback([
      {
        url: currentTabURL,
      },
    ]);
  });
};

export const getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};

function resetStubs(obj) {
  for (const prop in obj) {
    if (typeof obj[prop] === "object") {
      resetStubs(obj[prop]);
    } else if (obj[prop].reset) {
      obj[prop].reset();
    }
  }
}

beforeEach(() => {
  setIsFirefoxInstalled(true);
  // replace underscores with spaces for i18n
  global.chrome.i18n.getMessage.callsFake((key) => key.replace(/_/g, " "));
});

afterEach(() => {
  resetStubs(global.chrome);
  resetStubs(global.document);
});
const sinonChai = require("sinon-chai");
const chai = require("chai");
const path = require("path");
global.sinon = require("sinon");
global.expect = chai.expect;
chai.use(sinonChai);

// -------------------------------------
//               Mocks
// -------------------------------------
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
};

global.document = {
  addEventListener: sinon.stub(),
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

global.afterEach(() => {
  resetStubs(global.chrome);
  resetStubs(global.document);
});


// -------------------------------------
//           Scripts to test
// -------------------------------------
require(path.join(__dirname, "../src/background.js"));
require(path.join(__dirname, "../src/pages/welcomePage/script.js"));


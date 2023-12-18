import { expect } from "chai";
import { describe, it } from "mocha";

import { setIsFirefoxDefault, setIsAutoRedirect, setCurrentTabURL, setExternalSites, setIsFirefoxInstalled } from "../setup.test.js";

import { getCurrentTabSLD, getExternalSites, getIsAutoRedirect, getIsFirefoxDefault, getIsFirefoxInstalled } from "../../src/chromium/backgroundScripts/getters.js";

describe("getIsFirefoxDefault()", () => {
  it("should return true if firefox is the default browser", async () => {
    setIsFirefoxDefault(true);
    const result = await getIsFirefoxDefault();
    expect(result).to.equal(true);
  });

  it("should return false if firefox is not the default browser", async () => {
    setIsFirefoxDefault(false);
    const result = await getIsFirefoxDefault();
    expect(result).to.equal(false);
  });

  it("should return true if nothing is set", async () => {
    setIsFirefoxDefault(undefined);
    const result = await getIsFirefoxDefault();
    expect(result).to.equal(true);
  });
});

describe("getIsFirefoxInstalled()", () => {
  it("should return true if firefox is installed", async () => {
    setIsFirefoxInstalled(true);
    const result = await getIsFirefoxInstalled();
    expect(result).to.equal(true);
  });

  it("should return false if firefox is not installed", async () => {
    setIsFirefoxInstalled(false);
    const result = await getIsFirefoxInstalled();
    expect(result).to.equal(false);
  });

  it("should return true if nothing is set", async () => {
    setIsFirefoxInstalled(undefined);
    const result = await getIsFirefoxInstalled();
    expect(result).to.equal(true);
  });
});

describe("getIsAutoRedirect()", () => {
  it("should return true if auto redirect is enabled", async () => {
    setIsAutoRedirect(true);
    const result = await getIsAutoRedirect();
    expect(result).to.equal(true);
  });

  it("should return false if auto redirect is disabled", async () => {
    setIsAutoRedirect(false);
    const result = await getIsAutoRedirect();
    expect(result).to.equal(false);
  });

  it("should return true if nothing is set", async () => {
    setIsAutoRedirect(undefined);
    const result = await getIsAutoRedirect();
    expect(result).to.equal(true);
  });
});

describe("getExternalSites()", () => {
  it("should return the external sites", async () => {
    const site = {
      id: 1,
      url: "https://www.google.com",
      isPrivate: false,
    };
    setExternalSites([site]);
    const result = await getExternalSites();
    expect(result).to.deep.equal([site]);
  });

  it("should return an empty array if nothing is set", async () => {
    setExternalSites(undefined);
    const result = await getExternalSites();
    expect(result).to.deep.equal([]);
  });
});

describe("getCurrentTabSLD()", () => {
  it("should return the current tab sld", async () => {
    setCurrentTabURL("https://www.google.com");
    const result = await getCurrentTabSLD();
    expect(result).to.equal("google.com");
  });

  it("should return undefined if the url is not valid", async () => {
    setCurrentTabURL(undefined);
    const result = await getCurrentTabSLD();
    expect(result).to.equal("");
  });
});

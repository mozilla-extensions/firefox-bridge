require("../setup.js");

describe("Toolbar Context Menu", () => {
  describe("initContextMenu()", () => {
    it("should create the context menu", async () => {
      global.chrome.initContextMenu();
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

  describe("handleContextMenuClick()", () => {
    it("should update the context menu", async () => {
      global.chrome.handleContextMenuClick({menuItemId: "changeDefaultLaunchContextMenu"});
      expect(global.chrome.contextMenus.update).to.have.been.calledTwice;
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("changeDefaultLaunchContextMenu", {
        type: "checkbox",
        checked: true,
      });
      expect(global.chrome.contextMenus.update).to.have.been.calledWith("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox",
      });
    });
  });
});
function populateBrowserList() {
  let browserList = document.getElementById("browser-list");
  browserList.innerHTML = "";
  const loadedBrowsers = new Set();
  browser.experiments.firefox_launch
    .getAvailableBrowsers()
    .then((availableBrowsers) => {
      console.log(availableBrowsers.logs);
      availableBrowsers.browsers.forEach((browser) => {
        console.log(browser);
        
        if (loadedBrowsers.has(browser.name)) {
          return;
        } 
        loadedBrowsers.add(browser.name);

        let browserItem = document.createElement("li");

        let setDefaultButton = document.createElement("button");
        setDefaultButton.innerText = "Set Default";
        setDefaultButton.addEventListener("click", () => {
          chrome.storage.local.set({
            currentExternalBrowserLaunchProtocol: browser.executable,
          });
          chrome.storage.sync.set({ currentExternalBrowser: browser.name });
        });

        let browserImage = document.createElement("img");
        browserImage.setAttribute(
          "src",
          `../../images/${browser.name.toLowerCase()}/32.png`
        );

        browserItem.innerText = browser.name;
        browserItem.appendChild(browserImage);
        browserItem.appendChild(setDefaultButton);

        browserList.appendChild(browserItem);
      });
    });
}

async function checkHotkeys() {
  // get hotkeys with id launchFirefox and launchFirefoxPrivate
  const hotkeys = await chrome.commands.getAll();
  const launchBrowser = hotkeys.find(
    (hotkey) => hotkey.name === "launchBrowser"
  );
  const launchBrowserHotkey = launchBrowser.shortcut || "Not Yet Defined.";

  // update hotkey text
  document.getElementById("hotkeys").innerText = launchBrowserHotkey;
}

document.addEventListener("DOMContentLoaded", async function() {
  populateBrowserList();
  checkHotkeys();
});

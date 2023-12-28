function populateBrowserList() {
  let browserList = document.getElementById("browser-list");
  browserList.innerHTML = "";
  browser.experiments.firefox_launch
    .getAvailableBrowsers()
    .then((availableBrowsers) => {
      availableBrowsers.forEach((browser) => {
        let browserItem = document.createElement("li");

        let setDefaultButton = document.createElement("button");
        setDefaultButton.innerText = "Set Default";
        setDefaultButton.addEventListener("click", () => {
          chrome.storage.local.set({
            currentExternalBrowserLaunchProtocol: browser.executable,
          });
          chrome.storage.sync.set({ currentExternalBrowser: browser.name });
        });

        browserItem.innerText = browser.name;
        browserItem.appendChild(setDefaultButton);

        browserList.appendChild(browserItem);
      });
    });
}

document.addEventListener("DOMContentLoaded", async function() {
  populateBrowserList();
});

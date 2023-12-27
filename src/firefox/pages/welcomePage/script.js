document.addEventListener("DOMContentLoaded", async function() {
  console.log("experiments: ", browser.experiments.firefox_launch);

  let appsList = await browser.experiments.firefox_launch.getAvailableBrowsers();
  console.log(appsList);
  let defaultAppData = await browser.experiments.firefox_launch.getDefaultBrowser();
  console.log(defaultAppData);
});

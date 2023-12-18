

// export function getIsAutoRedirect() {
//   return new Promise((resolve) => {
//     chrome.storage.local.get(["isAutoRedirect"], (result) => {
//       if (result.isAutoRedirect === undefined) {
//         resolve(true);
//         chrome.storage.local.set({ isAutoRedirect: true });
//       } else {
//         resolve(result.isAutoRedirect);
//       }
//     });
//   });
// }

// export function getExternalSites() {
//   return new Promise((resolve) => {
//     chrome.storage.sync.get(["firefoxSites"], (result) => {
//       if (result.firefoxSites === undefined) {
//         resolve([]);
//       } else {
//         resolve(result.firefoxSites);
//       }
//     });
//   });
// }

// export function getCurrentTabSLD() {
//   return new Promise((resolve) => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const currentTab = tabs[0];
//       if (currentTab.url === undefined || !currentTab.url.startsWith("http")) resolve("");

//       try {
//         const url = new URL(tabs[0].url);
//         resolve(url.hostname.split(".").slice(-2).join("."));
//       } catch (e) {
//         resolve("");
//       }
//     });
//   });
// }
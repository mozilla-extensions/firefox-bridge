export function getIsFirefoxDefault() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["isFirefoxDefault"], (result) => {
      if (result.isFirefoxDefault === undefined) {
        resolve(true);
      } else {
        resolve(result.isFirefoxDefault);
      }
    });
  });
}

export async function getDefaultIconPath() {
  if (await getIsFirefoxDefault()) {
    return {
      32: "../images/firefox/firefox32.png",
    };
  } else {
    return {
      32: "../images/firefox-private/private32.png",
    };
  }
}

export async function getGreyedIconPath() {
  if (await getIsFirefoxDefault()) {
    return {
      32: "../images/firefox/firefox32grey.png",
    };
  } else {
    return {
      32: "../images/firefox-private/private32grey.png",
    };
  }
}
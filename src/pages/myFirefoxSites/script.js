let entries = [];

function getUnusedID() {
  if (!entries || entries.length === 0) {
    return 1;
  }
  const lastEntry = entries[entries.length - 1];
  return lastEntry.id + 1;
}

function addErrorToEntry(entryDivId) {
  if (document.getElementById(entryDivId).querySelector(".error")) {
    return;
  }
  const entryDiv = document.getElementById(entryDivId);
  const urlInput = entryDiv.querySelector("input");
  urlInput.style.border = "1px solid red";
  const errorMessage = document.createElement("p");
  errorMessage.className = "error";
  errorMessage.innerText = "Please enter a valid URL";
  entryDiv.appendChild(errorMessage);
}

function removeErrorFromEntry(entryDivId) {
  const entryDiv = document.getElementById(entryDivId);
  const urlInput = entryDiv.querySelector("input");
  urlInput.style.border = "none";
  const errorMessage = entryDiv.querySelector(".error");
  if (errorMessage) {
    entryDiv.removeChild(errorMessage);
  }
}

function validateEntry(entry) {
  const subdomainPattern = "(?:[a-zA-Z0-9*-]+\\.)";
  const domainPattern = "[a-zA-Z0-9*-]+\\.[a-zA-Z0-9*-]+";
  const pathPattern = "(?:\\/[^\\s]*)?";
  const queryParamsPattern = "(?:\\?[a-zA-Z0-9_=%&]*)*";

  const urlPattern = new RegExp(
    `^${subdomainPattern}*${domainPattern}${pathPattern}${queryParamsPattern}$`
  );

  entry.url = entry.url.replace(/\*+/g, "*"); // replace all groups of * with a single *
  return urlPattern.test(entry.url);
}

async function refreshDeclarativeNetRequestRules() {
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const newRules = [];

  for (const entry of entries) {
    const url = entry.url.replace(/\./g, "\\.").replace(/\*+/g, ".*");
    const rule = {
      id: entry.id,
      priority: 1,
      action: {
        type: "block",
        redirect: {
          regexSubstitution: entry.isPrivate ? "firefox-private:\\0" : "firefox:\\0",
        },
      },
      condition: {
        regexFilter: `http(s)?://${url}`,
        resourceTypes: ["main_frame"],
      },
    };
    newRules.push(rule);
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRules.map((rule) => rule.id),
    addRules: newRules,
  });
}

function saveEntry() {
  let urlInput = document.getElementById("url");
  let entry = {
    id: getUnusedID(),
    url: urlInput.value,
    isPrivate: document.getElementById("privateBrowsing").checked,
  };

  if (validateEntry(entry)) {
    entries.push(entry);
    refreshDeclarativeNetRequestRules();
    chrome.storage.sync.set({ firefoxSites: entries }, function() {
      renderEntries();
    });
    urlInput.value = "";
    removeErrorFromEntry("newEntry");
  } else {
    addErrorToEntry("newEntry");
  }
}

function deleteEntry(entryToDelete) {
  entries = entries.filter((entry) => entry.id !== entryToDelete.id);
  refreshDeclarativeNetRequestRules();
  chrome.storage.sync.set({ firefoxSites: entries }, function() {
    renderEntries();
    return true;
  });
}

function updateEntry(entryToUpdate) {
  let entry = entries.find((entry) => entry.id === entryToUpdate.id);
  const entryDiv = document.getElementById(entry.id);
  const urlInput = entryDiv.querySelector("input");
  const privateCheckbox = entryDiv.querySelector("input[type='checkbox']");
  entry.url = urlInput.value;
  entry.isPrivate = privateCheckbox.checked;

  if (!validateEntry(entry)) {
    addErrorToEntry(entryToUpdate.id);
    return;
  }

  removeErrorFromEntry(entryToUpdate.id);
  refreshDeclarativeNetRequestRules();
  chrome.storage.sync.set({ firefoxSites: entries }, function() {
    renderEntries();
    return true;
  });
}

function fetchAndRenderEntries() {
  chrome.storage.sync.get("firefoxSites", function(data) {
    entries = data.firefoxSites || [];
    renderEntries();
  });
}

function renderEntries() {
  document.getElementById("entryList").innerHTML = "";

  if (!entries || entries.length === 0) {
    const noEntriesMessage = document.createElement("p");
    noEntriesMessage.innerText = "You have not defined any Firefox sites yet";
    document.getElementById("entryList").appendChild(noEntriesMessage);
    return;
  }

  entries.forEach((entry) => {
    const entryDiv = document.createElement("div");
    entryDiv.id = entry.id;
    entryDiv.className = "entry";

    const urlLabel = document.createElement("label");
    urlLabel.innerText = "https:// ";

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = entry.url;

    const privateCheckbox = document.createElement("input");
    privateCheckbox.type = "checkbox";
    privateCheckbox.checked = entry.isPrivate;

    const privateLabel = document.createElement("label");
    privateLabel.innerText = "Private Browsing ";

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", function() {
      deleteEntry(entry);
    });

    const updateButton = document.createElement("button");
    updateButton.innerText = "Update";
    updateButton.addEventListener("click", function() {
      updateEntry(entry);
    });

    entryDiv.appendChild(urlLabel);
    entryDiv.appendChild(urlInput);
    entryDiv.appendChild(privateCheckbox);
    entryDiv.appendChild(privateLabel);
    entryDiv.appendChild(deleteButton);
    entryDiv.appendChild(updateButton);
    document.getElementById("entryList").appendChild(entryDiv);
  });
}

// on load, fetch entries and render them
fetchAndRenderEntries();

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("save").addEventListener("click", saveEntry);
});

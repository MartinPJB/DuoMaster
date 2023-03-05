import { chromeStorageGetAsync } from "./include/functions.js";

// Function: Set the badge text and color depending on the value of DuoMasterEnabled
async function setBadge() {
    const enabled = await chromeStorageGetAsync("DuoMasterEnabled");
    let isEnabled = false;
    if (enabled) isEnabled = enabled;

    chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#58cc02" : "#ff4b4b" });
}

// Function: Handle the installation of the extension and the storage changes
async function handleInstall() {
    console.log("DuoMasterEnabled is ready to use 🚀");
    const options = await chromeStorageGetAsync("DuoMasterSettings");
    let settings = {
        humanLike: false,
        robotSpeed: 200,
        humanChooseSpeedRange: [500, 900],
        humanTypeSpeedRange: [50, 300],
        autoskip: true,
        debug: false,
        autoPractice: false,
    }

    if (options) settings = options;
    chrome.storage.local.set({
        DuoMasterEnabled: true,
        DuoMasterSettings: settings
    });

    setBadge();
}

// Function: Handle the storage changes and update the badge depending on the value
function handleStorage(changes, namespace) {
    setBadge();
}

// Event: Listener for the extension installation
chrome.runtime.onInstalled.addListener(handleInstall);

// Event: Listener for storage changes
chrome.storage.onChanged.addListener(handleStorage);

// Event: Listener for extension loading
chrome.runtime.onStartup.addListener(setBadge);
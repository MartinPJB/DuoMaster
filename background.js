/**
 * Gets a value from chrome.storage.local asynchronously.
 * @param {String} key - The key to get from chrome.storage.local.
 * @returns {Promise} - A promise that resolves with the value.
 */
async function chromeStorageGetAsync(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
};

// Function: Handle the installation of the extension and the storage changes
async function handleInstall() {
    console.log("DuoMasterEnabled is ready to use 🚀");
    const options = await chromeStorageGetAsync("DuoMasterSettings");
    let settings = {
        humanFeel: false,
        robotSpeed: 200,
        humanChooseSpeedRange: [500, 900],
        humanTypeSpeedRange: [50, 300],
        autoskip: true,
        debug: true
    }

    if (options) settings = options;
    chrome.storage.local.set({
        DuoMasterEnabled: true,
        DuoMasterSettings: settings
    });

    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#58cc02" });
}

// Function: Handle the storage changes and update the badge depending on the value
function handleStorage(changes, namespace) {
    if (changes["DuoMasterEnabled"]) {
        let isEnabled = Boolean(changes.DuoMasterEnabled.newValue);
        chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#58cc02" : "#ff4b4b" });
    }
}

// Event: Listener for the extension installation
chrome.runtime.onInstalled.addListener(handleInstall);

// Event: Listener for storage changes
chrome.storage.onChanged.addListener(handleStorage);
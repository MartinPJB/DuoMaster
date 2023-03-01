// Function: Handle the installation of the extension and the storage changes
function handleInstall() {
    console.log("DuoMasterEnabled is ready to use 🚀");
    chrome.storage.local.set({
        DuoMasterEnabled: true,
        DuoMasterSettings: {
			humanFeel: false,
			robotSpeed: 500,
			humanChooseSpeedRange: [500, 900],
			humanTypeSpeedRange: [50, 300],
			autoskip: true,
            debug: true
		}
    });

    handleStorage({ DuoMasterEnabled: { newValue: true } }, "local");
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
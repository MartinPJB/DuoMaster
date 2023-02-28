// Define variables
let enabled = false;
const enableSwitch = document.getElementById("DuoMasterInput");
const enableText = document.getElementById("DuoMasterText");

// Update slider function
function updateSlider(value) {
	enableText.innerText = value ? "Enabled" : "Disabled";
	enableSwitch.checked = value;
}

// Reload Duolingo tabs function
function reloadDuolingoTabs() {
	chrome.tabs.query({ url: "https://www.duolingo.com/*" }, function (tabs) {
		for (const tab of tabs) {
			chrome.tabs.reload(tab.id);
		}
	});
}

// Toggle switch function
function toggleSwitch() {
	enabled = !enabled;
	chrome.storage.local.set({ DuoMasterEnabled: enabled });
	updateSlider(enabled);
	reloadDuolingoTabs();
}

// Initialize popup window event listeners
function initPopupWindow() {
	enableSwitch.checked = enabled;
	enableSwitch.addEventListener("click", toggleSwitch);
}

// Load extension enabled state from cache and update slider
chrome.storage.local.get("DuoMasterEnabled", function (response) {
	enabled = Boolean(response.DuoMasterEnabled);
	updateSlider(enabled);
});

initPopupWindow();
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

/**
 * Injects the duomaster file into the current page.
 * @param {object} settings - The settings to inject.
 */
function injectDuoMaster(settings) {
	// Injects the settings (Didn't find a better way to do it yet)
	const settingsElement = document.createElement("input");
	settingsElement.type = "hidden";
	settingsElement.id = "duomaster-settings";
	settingsElement.value = btoa(JSON.stringify(settings));
	document.body.appendChild(settingsElement);

	console.log(settings);

	// Injects the script
	const script = document.createElement("script");
	script.type = "module";
	script.src = `chrome-extension://${chrome.runtime.id}/content_scripts/injected/script.js`;
	document.body.appendChild(script);
}

// Check if the extension is enabled before injecting the script.
chrome.storage.local.get("DuoMasterEnabled", async ({ DuoMasterEnabled }) => {
	// If enabled
	if (DuoMasterEnabled) {
		const settings = await chromeStorageGetAsync("DuoMasterSettings");
		injectDuoMaster(settings);
	}
});

// Imports the chromeStorageGetAsync function from functions.js
// Why doesn't content_scripts use basic ES6 imports? Maybe I should consider using webpack.
function importModule(path) {
	return new Promise(async (resolve, reject) => {
		const src = chrome.runtime.getURL(path);
		const content = await import(src);
		resolve(content);
	});
}

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
	script.src = chrome.runtime.getURL("/content_scripts/injected/script.js");
	document.body.appendChild(script);
}

// Check if the extension is enabled before injecting the script.
chrome.storage.local.get("DuoMasterEnabled", async ({ DuoMasterEnabled }) => {
	// If enabled
	if (DuoMasterEnabled) {
		const { chromeStorageGetAsync } = await importModule("/include/functions.js");

		const settings = await chromeStorageGetAsync("DuoMasterSettings");
		injectDuoMaster(settings);
	}
});

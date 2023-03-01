/**
 * Injects a script file into the current page.
 * @param {string} fileName - The name of the file to inject.
 */
function injectScript(fileName) {
	const script = document.createElement("script");
	script.type = "module";
	script.src = `chrome-extension://${chrome.runtime.id}/${fileName}`;
	document.body.appendChild(script);
}

// Check if the extension is enabled before injecting the script.
chrome.storage.local.get("DuoMasterEnabled", async ({ DuoMasterEnabled }) => {
	// If enabled
	if (DuoMasterEnabled) {
		// Add the settings
		const settings = {
			humanFeel: true,
			robotSpeed: 500,
			humanChooseSpeedRange: [500, 900],
			humanTypeSpeedRange: [50, 300],
			autoskip: false,
		};

		// Insert those in every duolingo tab existing in the browser
		// NOT DONE, CAUSING ERROR
		const tabs = await chrome.tabs.query({ url: "*://www.duolingo.com/*" });
		for (const tab of tabs) {
			chrome.tabs.executeScript(tab.id, {
				code: `window.duomaster.settings = ${settings}`,
			});
		}

		// Inject the script
		injectScript("content_scripts/injected/script.js");
	}
});

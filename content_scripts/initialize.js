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
chrome.storage.local.get("DuoMasterEnabled", ({ DuoMasterEnabled }) => {
	if (DuoMasterEnabled) {
		// injectScript("content_scripts/script.js");
		injectScript("content_scripts/injected/script.js");
	}
});

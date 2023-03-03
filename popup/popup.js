// Define variables
const switches = {}

// Chrome storage get async function
import { chromeStorageGetAsync } from "../include/functions.js";

function omit(key, obj) {
	const { [key]: omitted, ...rest } = obj;
	return rest;
}

function updateSliders() {
	for (const setting in switches) {
		if (typeof switches[setting] !== "boolean") continue;

		const [key, value] = [setting, switches[setting]];
		const article = document.getElementById(key);

		const switchText = article.querySelector(`.${key}_text`);
		const switchInput = article.querySelector(`.${key}_input`);
		switchInput.dataset.setting = key;

		if (key != "extensionEnabled") {
			switchInput.disabled = !switches.extensionEnabled;
		}

		const newText = key.split(/(?=[A-Z])/).filter(s => s.toLowerCase() != "enabled").join(' ');
		switchText.innerText = `${newText}`;
		switchInput.checked = value;

		// Detects clicks
		if (key != "extensionEnabled" && !switches.extensionEnabled) continue;
		switchInput.addEventListener("change", function (e) {
			if (key == "extensionEnabled") {
				switches["extensionEnabled"] = e.target.checked;
				chrome.storage.local.set({ DuoMasterEnabled: switches["extensionEnabled"] });

			} else {
				// Update the switches object
				switches[key] = e.target.checked;
				const newSwitches = omit("extensionEnabled", switches);
				console.log(newSwitches);
				chrome.storage.local.set({ DuoMasterSettings: newSwitches });
			}
			switchInput.checked = e.target.checked;

			reloadDuolingoTabs();
			updateSliders();
		});
	}

	// Exceptions
	// Auto checks the autoskip checkbox if humanFeel is disabled
	const articleAutoSkip = document.getElementById("autoskip");
	const autoskipInput = articleAutoSkip.querySelector(`.autoskip_input`);
	if (!switches.humanFeel) {
		console.log("Human feel is disabled, autoskip is enabled");
		autoskipInput.checked = true;
		autoskipInput.disabled = true;
	} else {
		if (switches.extensionEnabled) {
			autoskipInput.disabled = false;
		}
	}
}

// Reload Duolingo tabs function
function reloadDuolingoTabs() {
	chrome.tabs.query({ url: "https://www.duolingo.com/*" }, function (tabs) {
		for (const tab of tabs) {
			chrome.tabs.reload(tab.id);
		}
	});
}

// Initialize popup window event listeners
async function initPopupWindow() {
	const extensionEnabled = await chromeStorageGetAsync("DuoMasterEnabled");
	console.log(extensionEnabled);
	switches["extensionEnabled"] = extensionEnabled;

	const settings = await chromeStorageGetAsync("DuoMasterSettings");
	console.log(settings);

	for (const setting in settings) {
		switches[setting] = settings[setting];
	}

	for (const setting in switches) {
		if (typeof switches[setting] !== "boolean") continue;

		const articleToAppend =
			`<article id="${setting}">
            <label class="switch">
                <input class="${setting}_input" type="checkbox">
                <span class="slider"></span>
            </label>
            <span class="${setting}_text">Disabled</span>
        </article>`;
		document.getElementById("content").innerHTML += articleToAppend;
	}
	updateSliders();
}

initPopupWindow();
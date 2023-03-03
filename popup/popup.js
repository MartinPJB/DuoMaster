// Define variables
const switches = {}

// Chrome storage get async function
import { chromeStorageGetAsync } from "../include/functions.js";

function omit(key, obj) {
	const { [key]: omitted, ...rest } = obj;
	return rest;
}

function updateSliders() {
	console.log("Updating sliders");
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
				chrome.storage.local.set({ DuoMasterSettings: newSwitches });
			}
			switchInput.checked = e.target.checked;

			reloadDuolingoTabs();
			updateSliders();
		});

		// Exceptions
		switch(key) {
			case "autoskip":
				console.log(!switches.humanLike || switches.autoPractice, switches.humanLike, switches.autoPractice);
				if (!switches.humanLike || switches.autoPractice) {
					console.log("Human feel is disabled || auto practice is enabled, autoskip is enabled");
					switchInput.checked = true;
					switches.autoskip = switchInput.checked;
					switchInput.disabled = true;
				} else {
					switchInput.disabled = !switches.extensionEnabled;
				}
				break;
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

	const settingNames = Object.keys(switches).filter(name => typeof switches[name] === "boolean");
	const contentHTML = settingNames.map(name => `<article id="${name}">
		<label class="switch">
			<input class="${name}_input" type="checkbox">
			<span class="slider"></span>
		</label>
		<span class="${name}_text">Disabled</span>
	</article>`).join("");
	document.getElementById("content").innerHTML += contentHTML;
	
	updateSliders();
}

initPopupWindow();
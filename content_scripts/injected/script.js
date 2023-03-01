// Script settings
const settings = {
	debug: false,
	lessonPages: [
		"https://www.duolingo.com/lesson",
		"https://www.duolingo.com/practice",
		"https://www.duolingo.com/skill",
		"https://www.duolingo.com/challenge",
	],
	currentURL: "",
};

// Import required modules
import DuoMasterCompleter from "../DuoMasterCompleter.js";

// Custom console log function for the debug
const frame = document.body.appendChild(document.createElement("iframe"));
frame.style.display = "none";

const debug = (...content) => settings.debug ? frame.contentWindow.console.log("DEBUG>", ...content) : null;
console.debug = debug;
frame.contentWindow.console.log("DuoMaster has loaded. 🚀");


// Main script
async function main() {
	// Get the settings from the page
	let duoMasterSettings = document.getElementById("duomaster-settings") ? JSON.parse(atob(document.getElementById("duomaster-settings").value)) : null;
	if (!duoMasterSettings) {
		console.debug("Couldn't find the settings. 🤔");
		console.debug("DuoMaster will use the default settings. 📝");
		duoMasterSettings = {
			humanFeel: true,
			robotSpeed: 500,
			humanChooseSpeedRange: [500, 900],
			humanTypeSpeedRange: [50, 300],
			autoskip: false,
		};
	} else {
		console.debug("Settings found! 📝");
		console.debug("Settings:", duoMasterSettings);
		settings.debug = duoMasterSettings.debug;
	}

	// Check if the current page is a lesson page
	if (settings.lessonPages.includes(settings.currentURL)) {
		console.debug("Current page is a lesson page. 📖");
	
		const completer = new DuoMasterCompleter(duoMasterSettings);
		await completer.start();
		console.debug("Lesson ended! 🎉");
	}

	return;
}

// Watch for URL changes
function watchURLChanges() {
	// Check if the current URL is different from the previous one
	if (settings.currentURL !== window.location.href) {
		settings.currentURL = window.location.href;
		console.debug("URL changed to", window.location.href, "🕯️");
		return main(); // Rerun the main script
	}
}

document.body.addEventListener(
	"click",
	() => {
		requestAnimationFrame(() => {
			watchURLChanges();
		});
	},
	true
);
watchURLChanges();

// Script settings
const settings = {
	debug: false,
	lessonPages: [
		"https://www.duolingo.com/lesson",
		"https://www.duolingo.com/practice",
		"https://www.duolingo.com/skill",
		"https://www.duolingo.com/challenge",
	],
	challengeSolving: false, // Rather a challenge is being solved or not
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


async function completeChallenge(duoMasterSettings) {
	// Start the completer to complete the challenge
	if (settings.challengeSolving) return;
	const completer = new DuoMasterCompleter(duoMasterSettings);
	await completer.start();

	// Solve the challenge when called
	settings.challengeSolving = true;
	do {
		try {
			await completer.resolveChallenge();
		} catch (error) {
			settings.challengeSolving = false;
		}
	} while (settings.challengeSolving);
	settings.challengeSolving = false;

	// Woohoo
	console.debug("Lesson completed! 🎉");
}


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
			autoPractice: false,
		};
	} else {
		console.debug("Settings found! 📝");
		console.debug("Settings:", duoMasterSettings);
		settings.debug = duoMasterSettings.debug;
	}


	// Check if the current page is a lesson page
	if (settings.lessonPages.includes(settings.currentURL)) {
		console.debug("Current page is a lesson page. 📖");
		completeChallenge(duoMasterSettings);
	}


	// Tries to auto launch the practice mode if enabled
	if (duoMasterSettings.autoPractice) {
		console.debug("Auto practice mode is enabled. 🤖");
		const practiceButton = document.querySelector("[data-test='global-practice']");
		if (practiceButton) {
			// Waits a few second to not spam, then click the button
			// If human feels, wait between 5 and 10 seconds
			const randomWait = Math.random() * 10000;
			await new Promise((resolve) => setTimeout(resolve, duoMasterSettings.humanFeel ? randomWait : 3000));

			console.debug("Auto starting the practice mode. 🚀");
			practiceButton.click();
		} else {
			console.debug("Couldn't find the practice button. 🤔");
		}
	}
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

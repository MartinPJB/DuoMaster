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
import DuoMasterCompleter from "../duoMasterCompleter.js";

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

		// Deletes the splash screen if exists
		if (document.querySelector(".duomaster-splash-screen")) document.body.removeChild(document.querySelector(".duomaster-splash-screen"));
		completeChallenge(duoMasterSettings);
	}


	// Tries to auto launch the practice mode if enabled
	if (duoMasterSettings.autoPractice) {
		console.debug("Auto practice mode is enabled. 🤖");
		const practiceButton = document.querySelector("[data-test='global-practice']");

		// If the practice button is found
		if (practiceButton) {
			// If human feels, wait between 5 and 10 seconds before clicking the button
			const waitingTime = duoMasterSettings.humanFeel ? Math.random() * 10000 : 3000;


			// Adds a class to the body to hide the overflow
			document.body.classList.add("duomaster-autoPractice");

			// Adds a kind of splash screen to warn the user he has the auto practice mode enabled
			// Sets the container of that splash screen
			const splashScreen = document.body.appendChild(document.createElement("div"));
			splashScreen.classList.add("duomaster-splash-screen");

			// Sets the title and the text of the splash screen
			const splashScreenTitle = splashScreen.appendChild(document.createElement("h1"));
			const splashScreenText = splashScreen.appendChild(document.createElement("p"));

			splashScreenTitle.innerHTML = "Auto practice mode <span>enabled</span>!";
			splashScreenText.innerText = `DuoMaster will start the practice mode automatically in ${Math.floor(waitingTime / 1000)} seconds. You can disable this feature in the settings.\n\nIf the "human feel" option is enabled, the time will be random between 5 and 10 seconds. If not, it will be 3 seconds.`;

			// Adds the splash screen to the page
			splashScreen.appendChild(splashScreenTitle);
			splashScreen.appendChild(splashScreenText);
			document.body.appendChild(splashScreen);

			// Waits a few second to not spam, then click the button
			await new Promise((resolve) => setTimeout(resolve, waitingTime));

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

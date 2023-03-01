// Script settings
const settings = {
	debug: true,
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

const debug = settings.debug
	? (...content) => frame.contentWindow.console.log("DEBUG>", ...content)
	: () => {};
console.debug = debug;
console.debug("DuoMaster has loaded. 🚀");


// Main script
async function main() {

	// Check if the current page is a lesson page
	if (settings.lessonPages.includes(settings.currentURL)) {
		console.debug("Current page is a lesson page. 📖");
		const completer = new DuoMasterCompleter(window.duomaster.settings);

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

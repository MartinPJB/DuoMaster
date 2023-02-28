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
		const completer = new DuoMasterCompleter({
			humanFeel: true,
			robotSpeed: 500,
			humanChooseSpeedRange: [500, 900],
			humanTypeSpeedRange: [50, 300],
			autoskip: false,
		});

		await completer.start();
		console.debug("Lesson ended! 🎉");
	}

	// Add a link in the duolingo sidebar to the extension's options page
	const sidebar = document.querySelector("._1AGG_._3bTT7");
	if (sidebar && !sidebar.querySelector("#duomaster_link")) {
		// Get the chrome extension ID
		const imageLink = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aCBkPSJNMyA3Ljc1QzMgNS42Nzg5MyA0LjY3ODkzIDQgNi43NSA0SDI0LjI1QzI2LjMyMTEgNCAyOCA1LjY3ODkzIDI4IDcuNzVWMjUuMjVDMjggMjcuMzIxMSAyNi4zMjExIDI5IDI0LjI1IDI5SDYuNzVDNC42Nzg5MyAyOSAzIDI3LjMyMTEgMyAyNS4yNVY3Ljc1WiIgZmlsbD0iIzRCNEI0QiIvPg0KICAgIDxwYXRoIGQ9Ik02Ljc1IDI0QzYuNzUgMjIuNjE5MyA3Ljg2OTI5IDIxLjUgOS4yNSAyMS41SDIxLjc1QzIzLjEzMDcgMjEuNSAyNC4yNSAyMi42MTkzIDI0LjI1IDI0QzI0LjI1IDI1LjM4MDcgMjMuMTMwNyAyNi41IDIxLjc1IDI2LjVIOS4yNUM3Ljg2OTI5IDI2LjUgNi43NSAyNS4zODA3IDYuNzUgMjRaIiBmaWxsPSIjRjdGN0Y3Ii8+DQogICAgPHBhdGggZD0iTTIwLjUgOUMyMC41IDcuNjE5MjkgMjEuNjE5MyA2LjUgMjMgNi41QzI0LjM4MDcgNi41IDI1LjUgNy42MTkyOSAyNS41IDlDMjUuNSAxMC4zODA3IDI0LjM4MDcgMTEuNSAyMyAxMS41QzIxLjYxOTMgMTEuNSAyMC41IDEwLjM4MDcgMjAuNSA5WiIgZmlsbD0iI0ZGQzgwMCIvPg0KPC9zdmc+DQo=";

		// Define the HTML to append
		const htmlToAppend = `<div id="duomaster_link">
			<a class="_3zmPR" href="/duomaster_settings">
				<span class="p4XC6 _3BxbA _2q30B _2GojZ _3WEdM _1YI3x _3G8Us">
				<div class="eMutd"><img class="PtT-7 ZFBAG" src='${imageLink}'>
				</div>
				<span class="_1lJDk">DuoMaster</span>
			</span>
		</a></div>`;
		sidebar.insertAdjacentHTML("beforeend", htmlToAppend);
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

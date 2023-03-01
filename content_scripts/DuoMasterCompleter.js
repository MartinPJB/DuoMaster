// Import the ReactUtils class
import ReactUtils from "./ReactUtils.js";

/**
 * A utility class that extends the ReactUtils class and provides methods to work with the DuoMasterCompleter
 *
 * @extends ReactUtils
 */
export default class DuoMasterCompleter extends ReactUtils {
	/**
	 * Creates an instance of AutolingoCompleter
	 * @param {...Object} args - The arguments to be passed to the constructor
	 */
	constructor(...args) {
		super();

		// Define some variables
		this.previousChallengeId = null;

		// Get arguments
		for (const arg of args) {
			for (const key in arg) {
				this[key] = arg[key];
			}
		}

		// Set autoskip to true if humanFeel is false by default
		if (!this.humanFeel) {
			this.autoskip = true;
		}

		// Contains functions that are common to some of the challenges (So no copy-pasting)
		this.commonChallenges = {
			translateBlankTokens: (contenteditable = false) => {
				return new Promise(async (resolve) => {
					// Get words that are blank
					const wordsToComplete = this.currentChallenge.displayTokens
						.filter((word) => word.isBlank)
						.map((item) => item.text)
						.join(" ");

					// Find the text input element
					const query = !contenteditable ? `[data-test='challenge-text-input']` : "[contenteditable=true]";
					console.debug(query, contenteditable);
					const challengeTranslateInput = document.querySelector(query);

					// Type the words in the text input element
					await this.typeTranslationInput(wordsToComplete, challengeTranslateInput, contenteditable);

					// Done!
					resolve();
				});
			},

			translateText: (dataSelector, solution) => {
				return new Promise(async (resolve) => {
					// The input to put the translation in
					const challengeTranslateInput = document.querySelector(`[data-test='${dataSelector}']`);

					// Types the words
					await this.typeTranslationInput(
						solution,
						challengeTranslateInput
					);

					// Done!
					resolve();
				});
			},

			completeWordBank: () => {
				return new Promise(async (resolve, reject) => {
					// Select the word bank
					const wordBank = document.querySelector("[data-test='word-bank']");

					// Collect all the choices
					const choices = Array.from(wordBank.children);
					const stringChoices = choices.map(choice =>
						choice.querySelector("[data-test='challenge-tap-token-text']").innerText
					);

					// Clicks the correct tokens
					for (const correctToken of this.currentChallenge.correctTokens) {
						const index = stringChoices.indexOf(correctToken);

						if (choices[index]) {
							choices[index].querySelector("[data-test='challenge-tap-token-text']")?.click();
							stringChoices[index] = ""; // Remove the choice so it can't be selected again (avoid bugs)
						}

						// Waits between the ranges to give it a more "human" feel
						if (this.humanFeel) {
							await this.wait(this.randomRange(...this.humanChooseSpeedRange));
						}
					}

					// Done!
					resolve();
				});
			},

			chooseCorrectElement: (dataSelector, index) => {
				return new Promise((resolve, reject) => {
					const choices = document.querySelector(`[data-test='${dataSelector}']`);
					if (index >= choices.length) index = choices.length - 1;

					try {
						choices[index].click();
						resolve();
					} catch (e) {
						reject(e);
					}
				});
			}
		};

		// Define the challenges and how to solve them
		this.challenges = {
			listenMatch: () => {
				return new Promise(async (resolve) => {
					const pairs = this.currentChallenge.pairs;

					// Selects the pairs
					for (const pair of pairs) {
						const toArray = pair.translation.split(" ");
						const prefix = toArray.length > 1 ? toArray.shift() : "";
						const translation = toArray.join("-");

						// Find HTML elements matching the pair, with optional prefix
						const htmlPair = [
							...document.querySelectorAll(`[data-test="${translation}-challenge-tap-token${prefix ? ` ${prefix}` : ""}"]`),
							...document.querySelectorAll(`[data-test="${prefix ? `${prefix} ` : ""}${translation}-challenge-tap-token"]`)
						];

						// Clicks on the pair
						for (const element of htmlPair) {
							element.click();

							// Waits between the ranges to give it a more "human" feel
							if (this.humanFeel) {
								await this.wait(this.randomRange(...this.humanChooseSpeedRange));
							}
						}
					}

					// Done!
					resolve();
				});
			},

			assist: () => {
				return new Promise(async (resolve) => {
					const correctIndex = this.currentChallenge.correctIndex;

					// Selects the correct choice
					const htmlChoices = document.querySelectorAll('[data-test="challenge-choice"]');
					if (htmlChoices[correctIndex]) {
						htmlChoices[correctIndex].click();

						// Waits between the ranges to give it a more "human" feel
						if (this.humanFeel) {
							await this.wait(this.randomRange(...this.humanChooseSpeedRange));
						}

						await this.pressContinueDuoLingo(true);
					}

					// Done!
					resolve();
				});
			},

			translate: () => {
				return new Promise(async (resolve) => {
					// The input to put the translation in
					const challengeTranslateInput = document.querySelector("[data-test='challenge-translate-input']");

					// Translating type (wordbank / typing)
					console.debug(`Translating exercise type: ${challengeTranslateInput ? "Typing" : "Wordbank"} ⚠️`);
					
					// Wordbank
					if (!challengeTranslateInput) await this.commonChallenges.completeWordBank();
					else await this.commonChallenges.translateText("challenge-translate-input", this.currentChallenge.correctSolutions[0]);

					// Done!
					resolve();
				});
			},

			listenComplete: async () => { return await this.commonChallenges.translateBlankTokens() },

			listen: async () => { return await this.commonChallenges.translateText("challenge-translate-input", this.currentChallenge.prompt) },

			name: async () => { return await this.commonChallenges.translateText("challenge-text-input", this.currentChallenge.correctSolutions[0]) },

			completeReverseTranslation: async () => { return await this.commonChallenges.translateBlankTokens() },

			// Why did duolingo use a contenteditable span instead of an input on this 💀
			partialReverseTranslate: async () => { return await this.commonChallenges.translateBlankTokens(true) },

			listenTap: async () => { return await this.commonChallenges.completeWordBank(); },

			form: async () => { return await this.commonChallenges.chooseCorrectElement("challenge-choice", this.currentChallenge.correctIndex) },

			// judge: () => { },
			// selectTranscription: () => { },
			// characterIntro: () => { },
			// selectPronunciation: () => { },
			// tapCompleteTable: () => { },
			// typeCompleteTable: () => { },
			// typeCloze: () => { },
			// typeClozeTable: () => { },
			// tapClozeTable: () => { },
			// tapCloze: () => { },
			// tapComplete: () => { },
			// listenComprehension: () => { },
			// dialogue: () => { },
			// speak: () => { },
			// match: () => { },
			// characterTrace: () => { },
			// partialReverseTranslate: () => { },
		};
	}

	/**
	 * Starts the Autolingo Completer
	 * @returns {Promise<void>} - Resolves when the page is loaded
	 */
	async start() {
		// Wait for the page to load
		console.debug("Waiting for page to load... ⏳");
		await this.waitForChallengePageLoad();

		// Page loaded
		await this.nextChallenge();
		return Promise.resolve();
	}

	/**
	 * Waits for the page to load
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForChallengePageLoad() {
		// Check if the loading indicator is already gone
		if (document.querySelector(".mQ0GW")) {
			// If it is, resolve the promise immediately with the loading indicator element
			return Promise.resolve(document.querySelector(".mQ0GW"));
		}

		// Otherwise, create a new MutationObserver to observe the document body for changes
		return new Promise((resolve) => {
			const observer = new MutationObserver(mutations => {
				// If the loading indicator is found, disconnect the observer and resolve the promise with the element
				if (document.querySelector(".mQ0GW")) {
					observer.disconnect();
					resolve(document.querySelector(".mQ0GW"));
				}
			});

			// Start observing the document body
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	/**
	* Gets the challenge elements
	* @returns {Promise} - The challenge elements
	*/
	getChallengeElements() {
		return new Promise((resolve) => {
			try {
				// Find the prefix of the React Fiber node in the challenge elements
				const prefix = Object.keys(document.querySelector(".mQ0GW")).find((e) =>
					e.includes("__reactFiber$")
				);

				// Get the stateNode props from the challenge elements
				const challengeElements = document.querySelector(".mQ0GW")[prefix];
				const stateNodeProps = challengeElements.return.return.stateNode.props;

				// Return the stateNode props
				return resolve(stateNodeProps);
			} catch (e) {
				return resolve(null);
			}
		});
	}

	/**
	 * Types the translation in the desired input
	 * @param {String} translation - The correct translation
	 * @param {HTMLElement} input - The desired input
	 * @returns {Promise<void>} - When the typing is complete
	 */
	// Returns a promise to be resolved when the typing is done
	typeTranslationInput(translation, input, contenteditable = false) {
		return new Promise(async (resolve) => {
			// Finds the React Fiber node for the input element
			const reactFiber = this.ReactFiber(input);
			const event = new InputEvent("input", { bubbles: true }); // Won't be used if not in a contenteditable

			// Appends the text to the input
			for (let i = 0; i < translation.length; i++) {
				// Gets the current text to append
				const letter = translation.slice(0, i + 1);

				// Appends the letter
				if (contenteditable) {
					input.innerText = letter;
					input.dispatchEvent(event); // dispatch the event to trigger the button
				} else {
					// Simulates an "onChange" event on the input
					reactFiber?.pendingProps?.onChange({
						target: {
							value: letter,
						},
					});
				}

				// If "humanFeel" is enabled, adds a delay for a typewriting effect
				if (this.humanFeel) {
					await this.wait(this.randomRange(...this.humanTypeSpeedRange));
				}
			}

			// Resolves the promise to indicate the typing is done
			resolve();
		});
	}

	/**
	 * Generates a random number between the min and max values
	 * @param {number} min - The minimum value
	 * @param {number} max - The maximum value
	 * @returns {number} - The random number
	 */
	randomRange(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	/**
	 * Waits for a specified amount of time
	 * @param {number} ms - The amount of time to wait in milliseconds
	 * @returns {Promise<void>} - Resolves when the time has passed
	 */
	wait(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	/**
	 * Completes a defined challenge
	 * @param {string} challengeType - The type of challenge to complete
	 * @returns {Promise<void>} - Resolves when the challenge is completed
	 * @throws {Error} - An error occured
	 */
	async completeChallenge(challengeType) {
		return new Promise(async (resolve, reject) => {
			try {
				// If human-like, add a delay before completing the challenge
				if (this.humanFeel) {
					await this.wait(this.autoskip ? this.randomRange(800, 2000) : 500);
				} else {
					await this.wait(this.robotSpeed);
				}

				if (!this.challenges[challengeType]) return reject("Invalid challenge type"); // Invalid challenge type

				const completing = await this.challenges[challengeType](); // Complete the challenge
				console.debug(`Completed challenge: ${this.currentChallenge.type} 🎉`);

				// Resets the current challenge and keeps in mind the previous challenge id
				this.previousChallengeId = this.currentChallenge.id;
				this.currentChallenge = null;

				resolve(completing);
			} catch (e) {
				reject(e); // An error occured
			}
		});
	}

	/**
	 * Presses the continue button on the website so the user doesn't have to
	 * @param {Boolean} check - If it's a check or not
	 * @returns {void}
	 */
	pressContinueDuoLingo(check) {
		return new Promise(async (resolve, reject) => {
			const continueButton = document.querySelector("[data-test='player-next']");

			if (!continueButton) return reject("No continue button found.");

			// If the button exists and autoskip is on, click the button and resolve.
			if (continueButton && (this.autoskip || check)) {
				if (!check) await this.wait(this.humanFeel ? this.randomRange(500, 800) : this.robotSpeed);
				if (check && !this.checkClickAllowed) return resolve();

				continueButton.click();
				this.checkClickAllowed = false;

				resolve(continueButton);
				console.debug(!check ? "Pressed continue button. ✅" : "Pressed check button. 🧩");
			}
			// If the button doesn't exist or autoskip is off, resolve without clicking the button.
			else {
				resolve();
				console.debug("Autoskip not on, resolved without consequences. ⚠️");
			}
		});
	}


	/**
	 * Checks if the skip button is available
	 * @returns {Boolean} - If the skip button is available
	 */
	skipButtonAvailable() {
		return document.querySelector("[data-test='player-skip']") ? !document.querySelector("[data-test='player-skip']").ariaDisabled : false;
	}

	/**
	 * Completes the challenge and proceeds to the next one
	 * @returns {Promise<void>}
	 */
	nextChallenge() {
		this.checkClickAllowed = true;
		console.debug("--------------------");

		return new Promise(async (resolve) => {
			// Get the challenge elements
			console.debug("Getting challenge elements... 📝");
			const challengeElements = await this.getChallengeElements();
			console.debug("Got challenge elements. ✅");

			// To make sure the player doesn't toggle the input type (keyboard/tap) while the challenge is being completed
			const toggler = document.querySelector("[data-test='player-toggle-keyboard']");
			if (toggler) toggler.parentNode.removeChild(toggler);

			// The challenge hasn't been completed yet, so we can continue
			if (!(!this.skipButtonAvailable() && !this.currentChallenge) && challengeElements) {
				console.debug("Completing challenge... 🎯");

				// Tries to get the current challenge
				this.currentChallenge = challengeElements.currentChallenge;

				// If the challenge exists, continue
				if (this.currentChallenge) {

					// Verifies if the challenge is the same as the previous one and that it has not been completed yet (Previous challenge can be the same if failed)
					if (
						!this.previousChallengeId || // Not null
						!challengeElements.correctChallenges.filter(chal => chal.id === this.previousChallengeId).includes(this.currentChallenge) // If the challenge not in the list of completed challenges
					) {

						// This challenge hasn't been completed yet, so we can continue
						const currentChallengeType = this.currentChallenge.type;
						console.debug(`Current challenge: ${currentChallengeType} 🎯`);
						try {
							// Complete the current challenge
							console.debug("Trying to complete challenge... 🚀");
							await this.completeChallenge(currentChallengeType);
							console.debug("Completed challenge. ✅");

							if (!this.humanFeel && this.autoskip) {
								// Wait a bit before continuing to the next challenge
								await this.wait(this.robotSpeed);
							}

							// Validates at least the exercise when done
							this.pressContinueDuoLingo(true);
						} catch (e) {
							// An error occured, let's see which one and skip the challenge for the code to renew
							if (e === "No continue button found.") console.debug(e, "Probably means the lesson's finished or the user left it. ⚠️");
							if (e === "Unknown challenge type.") console.debug(e, "⚠️ (New challenge type?)", currentChallengeType);
							console.debug("ERROR: ", e);
							return resolve();
						}

					} else {
						console.debug("This challenge already has been completed. ⚠️");
					}

				} else {
					return resolve();
				}
			}

			// Try to wait until the next challenge, if the function waitforNextChallenge fails, it means the lesson is probably finished or the user ended it
			try {
				console.debug("No challenge at this moment. ⚠️");
				await this.waitForNextChallenge();
				console.debug("Continuing to next challenge... 🚀");
	
				// Restarts the function
				await this.nextChallenge();
				return resolve();
			} catch(e) {
				console.debug("The user probably ended or left the lesson. 🚫");
				return resolve();
			}
		});
	}

	/**
	 * Waits for the next challenge
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForNextChallenge() {
		return new Promise((resolve, reject) => {
			// Create a mutation observer to watch for changes in the document
			const observer = new MutationObserver(async (mutations) => {
				// Get the current challenge elements
				const challengeElements = await this.getChallengeElements();
				if (!challengeElements) return reject();

				// Get the current supposed challenge
				const supposedCurrentChallenge = challengeElements.currentChallenge;

				// Check if the supposed current challenge is not the same as the current challenge or it does not exist
				if (!this.currentChallenge || supposedCurrentChallenge && supposedCurrentChallenge.id !== this.currentChallenge.id) {
					// Autoclicks the continue button if it exists and autoskip is enabled
					if (this.autoskip) await this.pressContinueDuoLingo();

					// Disconnect the observer and resolve the promise
					observer.disconnect();
					resolve();
					return this.currentChallenge = null;
				}
			});

			// Observe changes in the document body
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}
}
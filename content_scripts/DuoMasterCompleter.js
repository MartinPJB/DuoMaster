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
			translateBlankTokens: () => {
				return new Promise(async (resolve) => {
					// Get words that are blank
					const wordsToComplete = this.currentChallenge.displayTokens
						.filter((word) => word.isBlank)
						.map((item) => item.text)
						.join(" ");

					// Find the text input element
					const challengeTextInput = document.querySelector(
						"[data-test='challenge-text-input']"
					);

					// Type the words in the text input element
					await this.typeTranslationInput(wordsToComplete, challengeTextInput);

					// Click on the continue button
					await this.pressContinueDuoLingo(true);

					resolve();
				});
			},
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

					// Resolves the promise
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
					const challengeTranslateInput = document.querySelector(
						"[data-test='challenge-translate-input']"
					);

					// Translating type (wordbank / typing)
					console.debug(
						`Translating exercise type: ${challengeTranslateInput ? "Typing" : "Wordbank"} ⚠️`
					);

					// Wordbank
					if (!challengeTranslateInput) {
						// Select the word bank
						const wordBank = document.querySelector(
							"[data-test='word-bank']"
						);

						// Collect all the choices
						const choices = Array.from(wordBank.children);
						const stringChoices = choices.map(choice =>
							choice.querySelector(
								"[data-test='challenge-tap-token-text']"
							).innerText
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
					} else {
						// Type the correct translation
						const correctTranslation = this.currentChallenge.correctSolutions[0];
						await this.typeTranslationInput(
							correctTranslation,
							challengeTranslateInput
						);
					}

					// Press continue button
					await this.pressContinueDuoLingo(true);

					// Done!
					resolve();
				});
			},

			listenComplete: this.commonChallenges.translateBlankTokens,

			listen: () => {
				return new Promise(async (resolve) => {
					// The input to put the translation in
					const challengeTranslateInput = document.querySelector(
						"[data-test='challenge-translate-input']"
					);

					// The challenge solution
					const solution = this.currentChallenge.prompt;

					// Types the words
					await this.typeTranslationInput(
						solution,
						challengeTranslateInput
					);

					await this.pressContinueDuoLingo(true);
					resolve();
				});
			},

			name: () => {
				return new Promise(async (resolve) => {
					// The input to put the translation in
					const challengeTranslateInput = document.querySelector(
						"[data-test='challenge-text-input']"
					);

					// The challenge solution
					const solution = this.currentChallenge.correctSolutions[0];

					// Types the words
					await this.typeTranslationInput(
						solution,
						challengeTranslateInput
					);

					await this.pressContinueDuoLingo(true);
					resolve();
				});
			},

			completeReverseTranslation: this.commonChallenges.translateBlankTokens,

			// Why did duolingo use a contenteditable span instead of an input on this 💀
			partialReverseTranslate: () => {
				return new Promise(async (resolve) => {
					// Gets the "input" and creates an input event to dispatch (to trigger the button since it's a span)
					const input = document.querySelector("[contenteditable=true]");
					const event = new InputEvent("input", { bubbles: true });

					// Get words that are blank
					const wordsToComplete = this.currentChallenge.displayTokens
						.filter((word) => word.isBlank)
						.map((item) => item.text)
						.join(" ");

	
					// Appends the text to the input
					for (let i = 0; i < wordsToComplete.length; i++) {
						// Gets the current text to append
						const letter = wordsToComplete.slice(0, i + 1);
	
						// Appends the letter
						input.innerText = letter;
						input.dispatchEvent(event); // dispatch the event to trigger the button

						// Move the text cursor to the end
						input.selectionStart = input.innerText.length;
						input.selectionEnd = input.innerText.length;
	
						// If "humanFeel" is enabled, adds a delay for a typewriting effect
						if (this.humanFeel) {
							await this.wait(this.randomRange(...this.humanTypeSpeedRange));
						}
					}
	
					// Resolves the promise to indicate the typing is done
					resolve();
				});
			},

			// form: () => { },
			// judge: () => { },
			// selectTranscription: () => { },
			// characterIntro: () => { },
			// selectPronunciation: () => { },
			// listenTap: () => { },
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
	typeTranslationInput(translation, input) {
		return new Promise(async (resolve) => {
			// Finds the React Fiber node for the input element
			const reactFiber = this.ReactFiber(input);

			// Appends the text to the input
			for (let i = 0; i < translation.length; i++) {
				// Gets the current text to append
				const letter = translation.slice(0, i + 1);

				// Simulates an "onChange" event on the input
				reactFiber?.pendingProps?.onChange({
					target: {
						value: letter,
					},
				});

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
			if (continueButton && this.autoskip) {
				await this.wait(this.humanFeel ? this.randomRange(500, 800) : this.robotSpeed);
				continueButton.click();

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
	 * Completes the challenge and proceeds to the next one
	 * @returns {Promise<void>}
	 */
	nextChallenge() {
		console.debug("--------------------");
		console.debug("Next challenge... 🔄");

		return new Promise(async (resolve) => {
			// Get the challenge elements
			console.debug("Getting challenge elements... 📝");
			const challengeElements = await this.getChallengeElements();

			console.debug(challengeElements);

			// If no challenge elements are found or that the current challenge is the same as the previous one
			if (!challengeElements ||
				(this.previousChallengeId &&
					(
						challengeElements.currentChallenge.id === this.previousChallengeId && // Same as previous challenge
						!challengeElements.correctChallenges.filter(chal => chal.id === this.previousChallengeId).includes(this.currentChallenge) // Verifies if the bot didn't fail it before, if it did, let's consider it as a new challenge
					)
				)
			) {
				this.currentChallenge = null;
				console.debug("Current challenge is unavailable. 🚫");

				// Tries to basically skip the screen, if it fails, it means the lesson might be finished
				try {
					// Autoskip or not, press the continue button so duolingo doesn't block on a message screen
					await this.wait(this.humanFeel ? this.randomRange(500, 800) : this.robotSpeed);
					await this.pressContinueDuoLingo();
					console.debug("Skipped duolingo motivation / ending screen. 🚫");

					// Basically skips the challenge (even though this one didn't exist)
					await this.nextChallenge();
					return resolve();
				} catch (e) {
					console.debug("No continue button found, probably means the lesson's finished or the user left it. ⚠️");
					return resolve();
				}
			}

			// Challenge elements are found
			this.currentChallenge = challengeElements.currentChallenge;

			// Get the challenge type and proceed to complete it
			const currentChallengeType = this.currentChallenge.type;
			console.debug(`Current challenge: ${this.currentChallenge.type} 🎯`);

			// Tries to complete the current challenge
			try {
				// Complete the current challenge
				await this.completeChallenge(currentChallengeType);

				if (!this.humanFeel && this.autoskip) {
					// Wait a bit before continuing to the next challenge
					await this.wait(this.robotSpeed);
				}

				// Press the continue button to proceed to the next challenge
				console.debug("Waiting for next challenge... 🕑");

				// Wait for the next challenge to appear
				if (this.autoskip) await this.pressContinueDuoLingo();
				await this.waitForNextChallenge();

				console.debug("Continuing to next challenge... 🚀");

				// Start the next challenge
				await this.nextChallenge();
				return resolve();
			} catch (e) {
				// An error occured, let's see which one and skip the challenge for the code to renew
				if (e === "No continue button found.") console.debug(e, "Probably means the lesson's finished or the user left it. ⚠️");
				if (e === "Unknown challenge type.") console.debug(e, "⚠️ (New challenge type?)", currentChallengeType);
				console.debug("ERROR: ", e);
				return resolve();
			}
		});
	}

	/**
	 * Waits for the next challenge
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForNextChallenge() {
		if (!this.currentChallenge) return;
		return new Promise((resolve) => {
			// Create a mutation observer to watch for changes in the document
			const observer = new MutationObserver(async (mutations) => {
				// Get the current challenge elements
				const challengeElements = this.getChallengeElements();

				// Get the current supposed challenge
				const supposedCurrentChallenge = challengeElements.currentChallenge;

				// Check if the supposed current challenge is not the same as the current challenge or it does not exist
				if (
					supposedCurrentChallenge.id !== this.currentChallenge.id ||
					!supposedCurrentChallenge
				) {
					// Disconnect the observer and resolve the promise
					observer.disconnect();
					resolve();
					return;
				} else {
					// Tries clicking on the next button in case Duolingo is being motivational
					if (this.autoskip) {
						try {
							await this.pressContinueDuoLingo();
							console.debug("Duolingo was being motivational 🙄");
							resolve();
						} catch (e) {
							console.debug("Couldn't press continue button. 🤷‍♂️");
						}
					}
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
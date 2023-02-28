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

		// Get arguments
		for (const arg of args) {
			for (const key in arg) {
				this[key] = arg[key];
			}
		}

		// Define the challenges and how to solve them
		this.challenges = {
			// ⚠️ buggy
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
							...document.querySelectorAll(`${prefix ? `${prefix} ` : ""}[data-test="${translation}-challenge-tap-token"]`)
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
							const waitTime = this.randomRange(...this.humanChooseSpeedRange);
							await this.wait(waitTime);
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
								choices[index]
									.querySelector(
										"[data-test='challenge-tap-token-text']"
									)
									?.click();
							}

							// Waits between the ranges to give it a more "human" feel
							if (this.humanFeel) {
								const waitTime = this.randomRange(...this.humanChooseSpeedRange);
								await this.wait(waitTime);
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

			listenComplete: () => {
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

			name: () => { },
			form: () => { },
			judge: () => { },
			selectTranscription: () => { },
			characterIntro: () => { },
			selectPronunciation: () => { },
			completeReverseTranslation: () => { },
			listenTap: () => { },
			tapCompleteTable: () => { },
			typeCompleteTable: () => { },
			typeCloze: () => { },
			typeClozeTable: () => { },
			tapClozeTable: () => { },
			tapCloze: () => { },
			tapComplete: () => { },
			listenComprehension: () => { },
			dialogue: () => { },
			speak: () => { },
			match: () => { },
			characterTrace: () => { },
			partialReverseTranslate: () => { },
		};
	}

	/**
	 * Starts the Autolingo Completer
	 * @returns {Promise<void>} - Resolves when the page is loaded
	 */
	start() {
		this.nextChallenge();
	}

	/**
	 * Waits for the page to load
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForPageLoad() {
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
	* @returns {Object} - The challenge elements
	*/
	getChallengeElements() {
		// Find the prefix of the React Fiber node in the challenge elements
		const prefix = Object.keys(document.querySelector(".mQ0GW")).find((e) =>
			e.includes("__reactFiber$")
		);

		// Get the stateNode props from the challenge elements
		const challengeElements = document.querySelector(".mQ0GW")[prefix];
		const stateNodeProps = challengeElements.return.return.stateNode.props;

		// Return the stateNode props
		return stateNodeProps;
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
					const delay = this.autoskip ? this.randomRange(800, 2000) : 500;
					await this.wait(delay);
				} else {
					await this.wait(500);
				}

				const completing = await this.challenges[challengeType](); // Complete the challenge
				console.debug(`Completed challenge: ${this.currentChallenge.type} 🎉`);

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
		return new Promise(async (resolve) => {
			const continueButton = document.querySelector("[data-test='player-next']");

			// If the button exists and autoskip is on, click the button and resolve.
			if (continueButton && this.autoskip) {
				await this.wait(this.randomRange(500, 800));
				continueButton.click();

				resolve();
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
	 * @returns {Void}
	 */
	async nextChallenge() {
		// Wait for the page to load
		await this.waitForPageLoad();

		// Get the challenge elements
		const challengeElements = this.getChallengeElements();

		// Get the current challenge from the challenge elements
		this.currentChallenge = challengeElements.currentChallenge;
		console.debug("Current challenge:", this.currentChallenge);

		// Get the challenge type and proceed to complete it
		const currentChallengeType = this.currentChallenge.type;
		try {
			// Complete the current challenge
			await this.completeChallenge(currentChallengeType);

			if (!this.humanFeel && this.autoskip) {
				// Wait a bit before continuing to the next challenge
				await this.wait(1000);
			}

			// Press the continue button to proceed to the next challenge
			if (this.autoskip) {
				await this.pressContinueDuoLingo();
			}

			console.debug("Waiting for next challenge... 🕑");

			// Wait for the next challenge to appear
			await this.waitForNextChallenge();

			console.debug("Continuing to next challenge... 🚀");

			// Start the next challenge
			return this.nextChallenge();
		} catch (e) {
			console.debug("ERROR> An error occurred:", e);
		}
	}

	/**
	 * Waits for the next challenge
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForNextChallenge() {
		return new Promise((resolve) => {
			// Create a mutation observer to watch for changes in the document
			const observer = new MutationObserver((mutations) => {
				// Get the current challenge elements
				const challengeElements = this.getChallengeElements();

				// Get the current supposed challenge
				const supposedCurrentChallenge = challengeElements.currentChallenge;
				console.debug(supposedCurrentChallenge);

				// Check if the supposed current challenge is not the same as the current challenge or it does not exist
				if (
					supposedCurrentChallenge.id !== this.currentChallenge.id ||
					!supposedCurrentChallenge
				) {
					// Disconnect the observer and resolve the promise
					observer.disconnect();
					resolve();
					return;
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
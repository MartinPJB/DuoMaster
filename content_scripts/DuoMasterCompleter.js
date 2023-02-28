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
				return new Promise(async (resolve, reject) => {
					const pairs = this.currentChallenge.pairs;

					// Selects the pairs
					for (const pair of pairs) {
						let toArray = pair.translation.split(" ");
						let prefix = "";
						if (toArray.length > 1) prefix = toArray.shift();
						let translation = toArray.join("-");

						// Prefix can be of two types for some reasons 💀
						const htmlPair =
							document.querySelectorAll(
								`[data-test="${translation}-challenge-tap-token${
									prefix ? ` ${prefix}` : ""
								}"]`
							) ||
							document.querySelectorAll(
								`${
									prefix ? `${prefix} ` : ""
								}[data-test="${translation}-challenge-tap-token"]`
							);

						// Clicks on the pair
						for (const element of htmlPair) {
							element.click();

							// Waits between the ranges to give it a more "human" feel
							if (this.humanFeel) {
								await this.wait(
									this.randomRange(
										this.humanChooseSpeedRange[0],
										this.humanChooseSpeedRange[1]
									)
								);
							}
						}
					}

					// Done!
					resolve();
				});
			},

			assist: () => {
				return new Promise(async (resolve, reject) => {
					const correctIndex = this.currentChallenge.correctIndex;

					// Selects the correct choice
					const htmlChoices = document.querySelectorAll(
						'[data-test="challenge-choice"]'
					);
					if (htmlChoices[correctIndex]) {
						htmlChoices[correctIndex].click();

						// Waits between the ranges to give it a more "human" feel
						if (this.humanFeel) {
							await this.wait(
								this.randomRange(
									this.humanChooseSpeedRange[0],
									this.humanChooseSpeedRange[1]
								)
							);
						}

						await this.pressContinueDuoLingo(true);

						// Done!
						resolve();
					}
				});
			},

			translate: () => {
				return new Promise(async (resolve, reject) => {
					// The input to put the translation in
					const challengeTranslateInput = document.querySelector(
						"[data-test='challenge-translate-input']"
					);

					// Translating type (wordbank / typing)
					console.debug(
						`Translating exercise type: ${
							challengeTranslateInput ? "Typing" : "Wordbank"
						} ⚠️`
					);

					// Wordbank
					if (!challengeTranslateInput) {
						let wordBank = document.querySelector(
							"[data-test='word-bank']"
						);
						let choices = Array.from(wordBank.children);
						let stringChoices = [];

						// Choices
						for (const choice of choices) {
							stringChoices.push(
								choice.querySelector(
									"[data-test='challenge-tap-token-text']"
								).innerText
							);
						}

						// Clicks the correct tokens
						for (const correctToken of this.currentChallenge
							.correctTokens) {
							const index = stringChoices.indexOf(correctToken);
							stringChoices.slice(index, 1);

							if (choices[index]) {
								choices[index]
									.querySelector(
										"[data-test='challenge-tap-token-text']"
									)
									?.click();
							}

							// Waits between the ranges to give it a more "human" feel
							if (this.humanFeel) {
								await this.wait(
									this.randomRange(
										this.humanChooseSpeedRange[0],
										this.humanChooseSpeedRange[1]
									)
								);
							}
						}
					} else {
						const correctTranslation =
							this.currentChallenge.correctSolutions[0];

						// Type the correct translation
						await this.typeTranslationInput(
							correctTranslation,
							challengeTranslateInput
						);
					}

					await this.pressContinueDuoLingo(true);
					resolve();
				});
			},

			listenComplete: () => {
				return new Promise(async (resolve, reject) => {
					// Words that are blank
					const wordsToComplete = this.currentChallenge.displayTokens
						.filter((word) => word.isBlank)
						.map((item) => item.text)
						.join(" ");

					const challengeTextInput = document.querySelector(
						"[data-test='challenge-text-input']"
					);

					// Types the words
					await this.typeTranslationInput(
						wordsToComplete,
						challengeTextInput
					);

					await this.pressContinueDuoLingo(true);
					resolve();
				});
			},

			listen: () => {
				return new Promise(async (resolve, reject) => {
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

			name: () => {},
			form: () => {},
			judge: () => {},
			selectTranscription: () => {},
			characterIntro: () => {},
			selectPronunciation: () => {},
			completeReverseTranslation: () => {},
			listenTap: () => {},
			tapCompleteTable: () => {},
			typeCompleteTable: () => {},
			typeCloze: () => {},
			typeClozeTable: () => {},
			tapClozeTable: () => {},
			tapCloze: () => {},
			tapComplete: () => {},
			listenComprehension: () => {},
			dialogue: () => {},
			speak: () => {},
			match: () => {},
			characterTrace: () => {},
			partialReverseTranslate: () => {},
		};
	}

	/**
	 * Types the translation in the desired input
	 * @param {String} translation - The correct translation
	 * @param {HTMLElement} input - The desired input
	 * @returns {Promise<void>} - When the typing is complete
	 */
	typeTranslationInput(translation, input) {
		return new Promise(async (resolve, reject) => {
			const reactFiber = this.ReactFiber(input);

			// Appends the text
			for (let i = 0; i < translation.length; i++) {
				const letter = translation.slice(0, i + 1);

				reactFiber?.pendingProps?.onChange({
					target: {
						value: letter,
					},
				});

				// If humanFeel, adds a delay for a typewriting effect
				if (this.humanFeel) {
					await this.wait(
						this.randomRange(
							this.humanTypeSpeedRange[0],
							this.humanTypeSpeedRange[1]
						)
					);
				}
			}

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
	 * Starts the Autolingo Completer
	 * @returns {Promise<void>} - Resolves when the page is loaded
	 */
	start() {
		this.nextChallenge();
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
				// If human like, waits a bit before completing the challenge
				if (this.humanFeel || (this.humanFeel && this.autoskip))
					await this.wait(this.randomRange(800, 2000));
				if (!this.humanFeel) await this.wait(500);

				const completing = await this.challenges[challengeType]();
				console.debug(
					`Completed challenge: ${this.currentChallenge.type} 🎉`
				);

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
			const continueButton = document.querySelector(
				"[data-test='player-next']"
			);
			if (continueButton && this.autoskip) {
				await this.wait(this.randomRange(500, 800));
				continueButton.click();

				resolve();
				console.debug(
					!check
						? "Pressed continue button. ✅"
						: "Pressed check button. 🧩"
				);
			} else {
				resolve();
				console.debug(
					"Autoskip not on, resolved without consequences. ⚠️"
				);
			}
		});
	}

	/**
	 * Completes the challenge and proceeds to the next one
	 * @returns {Void}
	 */
	async nextChallenge() {
		await this.waitForPageLoad();
		const challengeElements = this.getChallengeElements();

		// Get the currentChallenge from the challenge elements
		this.currentChallenge = challengeElements.currentChallenge;
		console.debug("Current challenge:", this.currentChallenge);

		// Get the challengeType and proceeds to complete it
		const currentChallengeType = this.currentChallenge.type;
		try {
			await this.completeChallenge(currentChallengeType);

			if (!this.humanFeel && this.autoskip) {
				// A timeout so it is not too fast
				await this.wait(1000);
			}

			// Can autoskip
			if (this.autoskip) {
				await this.pressContinueDuoLingo();
			}

			console.debug("Waiting for next challenge... 🕑");
			await this.waitForNextChallenge();
			console.debug("Continuing to next challenge... 🚀");
			return this.nextChallenge();
		} catch (e) {
			console.debug("ERROR> An error occured:", e);
		}
	}

	/**
	 * Waits for the page to load
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForPageLoad() {
		return new Promise((resolve, reject) => {
			if (document.querySelector(".mQ0GW")) {
				resolve(document.querySelector(".mQ0GW"));
				return;
			}
			const observer = new MutationObserver((mutations) => {
				if (document.querySelector(".mQ0GW")) {
					observer.disconnect();
					resolve(document.querySelector(".mQ0GW"));
					return;
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}

	/**
	 * Waits for the next challenge
	 * @returns {Promise<Element>} - Resolves with the element that indicates the page has loaded
	 */
	waitForNextChallenge() {
		return new Promise((resolve, reject) => {
			const observer = new MutationObserver((mutations) => {
				const challengeElements = this.getChallengeElements();
				const supposedCurrentChallenge =
					challengeElements.currentChallenge;

				console.debug(supposedCurrentChallenge);

				if (
					supposedCurrentChallenge.id !== this.currentChallenge.id ||
					!supposedCurrentChallenge
				) {
					observer.disconnect();
					resolve();
					return;
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}

	/**
	 * Gets the challenge elements
	 * @returns {Object} - The challenge elements
	 */
	getChallengeElements() {
		const prefix = Object.keys(document.querySelector(".mQ0GW")).find((e) =>
			e.includes("__reactFiber$")
		);
		const challengeElements = document.querySelector(".mQ0GW")[prefix];
		return challengeElements.return.return.stateNode.props;
	}
}

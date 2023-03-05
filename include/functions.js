/*
* This file contains functions that are used in the extension.
* It is used to avoid code duplication.
*/

/**
 * Gets a value from chrome.storage.local asynchronously.
 * @param {String} key - The key to get from chrome.storage.local.
 * @returns {Promise} - A promise that resolves with the value.
 */
async function chromeStorageGetAsync(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], function (result) {
			if (result[key] === undefined) {
				resolve(null);
			} else {
				resolve(result[key]);
			}
		});
	});
};


// Export functions
export { chromeStorageGetAsync };
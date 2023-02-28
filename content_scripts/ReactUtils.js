/**
 * Helper class for interacting with React internal data structures.
 */
export default class ReactUtils {
	constructor() { }

	/**
	 * Get the React internal instance key for a given element.
	 *
	 * @param {Object} elem - The element to inspect.
	 * @param {string} prefix - The prefix of the key to look for.
	 * @returns {Object} - The React internal instance.
	 */
	ReactKey = (elem, prefix) => {
		// Object.keys() doesn't like null and undefined
		if (elem == null || elem == undefined) return;

		// Find its react internal instance key
		let key = Object.keys(elem).find((key) => key.startsWith(prefix));
		return elem[key];
	};

	/**
	 * Get the React internal instance for a given element.
	 *
	 * @param {Object} elem - The element to inspect.
	 * @returns {Object} - The React internal instance.
	 */
	ReactInternal = (elem) => {
		return this.ReactKey(elem, "__reactInternalInstance$");
	};

	/**
	 * Get the React event handlers for a given element.
	 *
	 * @param {Object} elem - The element to inspect.
	 * @returns {Object} - The React event handlers.
	 */
	ReactEvents = (elem) => {
		return this.ReactKey(elem, "__reactEventHandlers$");
	};

	/**
	 * Get the React Fiber data structure for a given element.
	 *
	 * @param {Object} elem - The element to inspect.
	 * @returns {Object} - The React Fiber data structure.
	 */
	ReactFiber = (elem) => {
		return this.ReactKey(elem, "__reactFiber$");
	};

	/**
	 * Get the React props object for a given element.
	 *
	 * @param {Object} elem - The element to inspect.
	 * @returns {Object} - The React props object.
	 */
	ReactProps = (elem) => {
		return this.ReactKey(elem, "__reactProps$");
	};
}
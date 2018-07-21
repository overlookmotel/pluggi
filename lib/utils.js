/* --------------------
 * pluggi module
 * utils
 * ------------------*/

'use strict';

// Exports

module.exports = {
	/**
	 * Convert snake case to camel case
	 * e.g. 'my-module-name' -> 'myModuleName'
	 * @param {string} str - Snake case string
	 * @returns {string} - Camel case string
	 */
	snakeToCamel: function(str) {
		return str.replace(/-(.)/g, (m, c) => c.toUpperCase()); // jshint ignore:line
	},

	/**
	 * Identify if input is an object
	 * @param {*} obj - Input
	 * @returns {boolean} - `true` if is an object, `false` if not
	 */
	isObject: function(obj) {
		return obj !== null && typeof obj == 'object';
	}
};

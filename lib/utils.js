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
	},

	/**
	 * Identify if input is a subclass of another class
	 * @param {*} obj - Input
	 * @returns {boolean} - `true` if is an object, `false` if not
	 */
	 isSubclassOf: function(obj, Class) {
	 	if (obj == null) return false;
		if (obj === Class) return true;
		while (true) {
			let next = Object.getPrototypeOf(obj);
			if (next === Class) return true;
			if (!next) return false;
			obj = next;
		}
	},

	/**
	 * Uncapitalize first character of string
	 * @param {string} str
	 * @returns {string}
	 */
	uncapitalize: function(str) {
		return `${str[0].toLowerCase()}${str.slice(1)}`;
	}
};

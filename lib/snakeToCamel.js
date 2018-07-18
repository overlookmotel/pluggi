/* --------------------
 * baser module
 * snakeToCamel() function
 * ------------------*/

'use strict';

// Exports

/**
 * Convert snake case to camel case
 * e.g. 'my-module-name' -> 'myModuleName'
 * @param {string} str - Snake case string
 * @returns {string} - Camel case string
 */
module.exports = function(str) {
	return str.replace(/-(.)/g, (m, c) => c.toUpperCase()); // jshint ignore:line
};

/* --------------------
 * pluggi module
 * isObject() function
 * ------------------*/

'use strict';

// Exports

/**
 * Return true if input is an object
 * @param {*} obj - Input
 * @returns {boolean} - `true` if is an object, `false` if not
 */
module.exports = function(obj) {
	return obj !== null && typeof obj == 'object';
};

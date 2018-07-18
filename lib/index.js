/* --------------------
 * pluggi module
 * ------------------*/

'use strict';

// Imports
const snakeToCamel = require('./snakeToCamel');

// Constants
const PLUGIN_PREFIX = '_pluginPrefix';

// Exports
class Pluggi {
	/**
	 * Constructor
	 * Init `plugins` object and save `options`
	 * @param {Object} [options] - Options object
	 */
	constructor(options) {
		this.plugins = {};
		this.options = options || {};
		this[PLUGIN_PREFIX] = null;
	}

	/**
	 * Plugin method
	 * Arguments are overloaded. Can be called with:
	 *   - (name, plugin [, options]) -> default behavior
	 *   - (name [, options]) -> plugin loaded with `require(name)`
	 *   - (plugin [, options]) -> `name` taken from name of function
	 *
	 * Where plugin loaded with `require()`:
	 *   - module name required is prefixed with `this[PLUGIN_PREFIX]` if defined
	 *   - name of plugin converted from snake case to camel case
	 *
	 *
	 * @param {string} [name] - Plugin name
	 * @param {Function} [plugin] - Plugin function
	 * @param {Object} [options] - Options object
	 * @returns {Pluggi} - Pluggi object for chaining
	 */
	plugin(name, plugin, options) {
		// Conform arguments
		if (typeof name == 'function') {
			if (plugin != null) options = plugin;
			plugin = name;
			name = plugin.name;
		} else if (typeof plugin == 'function') {
			if (!name) name = plugin.name;
		} else if (plugin != null) {
			options = plugin;
			plugin = null;
		}

		if (!name) throw new Error('name passed to `.plugin()` must be provided or plugin function must be named');
		if (typeof name != 'string') throw new Error('name passed to `.plugin()` must be a string');

		// Load plugin with `require()`
		if (!plugin) {
			const prefix = this[PLUGIN_PREFIX];
			const moduleName = prefix ? `${prefix}-${name}` : name;
			plugin = require(moduleName);
			name = snakeToCamel(name);
		}

		// Create options object to pass to function
		options = Object.assign({}, this.options[name], options);

		// Run plugin function
		let res = plugin.call(this, options);
		if (!res) res = {};

		// Store plugin result in `plugins` object
		this.plugins[name] = res;

		// Return `this` for chaining
		return this;
	}
}

Pluggi.PLUGIN_PREFIX = PLUGIN_PREFIX;

module.exports = Pluggi;

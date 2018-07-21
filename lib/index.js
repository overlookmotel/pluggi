/* --------------------
 * pluggi module
 * ------------------*/

'use strict';

// Imports
const Plugin = require('./pluginClass'),
	pluginPlugin = require('./plugin'),
	pluginsPlugin = require('./plugins'),
	{isObject, isSubclassOf, snakeToCamel, uncapitalize} = require('./utils');

// Exports
class Pluggi {
	/**
	 * Constructor
	 * Init `plugins` object and save `options`
	 * @param {Object} [options] - Options object
	 */
	constructor(options) {
		// Init plugins object
		this.plugins = {};

		// Save global options to app
		this.options = options || {};

		// Add `plugin` + `plugins` plugins
		this.plugin('plugin', pluginPlugin);
		this.plugin('plugins', pluginsPlugin);
	}

	/**
	 * Plugin method
	 * Arguments are overloaded. Can be called with:
	 *   - (name, plugin [, options]) -> default behavior
	 *   - (name [, options]) -> plugin loaded as module
	 *   - (plugin [, options]) -> `name` taken from name of plugin/plugin function
	 *
	 * Where plugin loaded as a module, name of plugin converted from
	 * snake case to camel case.
	 *
	 * @param {string} [name] - Plugin name
	 * @param {Plugin|Object|Function} [plugin] - Plugin object/function
	 * @param {Object} [options] - Options object
	 * @returns {Pluggi} - Pluggi object for chaining
	 */
	plugin(name, plugin, options) {
		// Conform arguments
		if (isPlugin(name)) {
			if (plugin != null) options = plugin;
			plugin = name;
			name = plugin.name;
			if (name) name = uncapitalize(name);
		} else if (isPlugin(plugin)) {
			if (!name) {
				name = plugin.name;
				if (name) name = uncapitalize(name);
			}
		} else if (plugin != null) {
			options = plugin;
			plugin = null;
		}

		if (!name) throw new Error('name must be provided, or plugin must have name defined, or plugin function must be named');
		if (typeof name != 'string') throw new Error('name must be a string');

		// If no plugin provided, load according to `name`
		if (!plugin) {
			// Load plugin with `require()`
			plugin = this.plugins.plugins.load(name);
			name = snakeToCamel(name);
		}

		// Convert `plugin` to `Plugin` class instance
		if (plugin instanceof Plugin) { // jshint ignore:line
			// Do nothing
		} else if (isSubclassOf(plugin, Plugin)) {
			// Instantiate Plugin subclass
			plugin = new plugin(); // jshint ignore:line
		} else if (typeof plugin == 'function') {
			// Convert function to Plugin
			const init = plugin;
			plugin = new Plugin();
			plugin.init = init;
		} else if (isObject(plugin)) {
			// Convert object to Plugin class instance
			const obj = plugin;
			plugin = new Plugin();
			Object.assign(plugin, obj);
		} else {
			throw new Error('plugin must be an object or function');
		}

		// Merge options onto plugin object
		Object.assign(
			plugin,
			this.options[name], // Global options
			options // Local options
		);

		// Set `name` and `app` properties
		plugin.name = name;
		plugin.app = this;

		// Call `.init()` method + assign return value to plugin
		const res = plugin.init(this, plugin);
		Object.assign(plugin, res);

		// Store plugin in `app.plugins`
		this.plugins[name] = plugin;

		// Return `this` for chaining
		return this;
	}
}

// Export Plugin class as static prop of Pluggi
Pluggi.Plugin = Plugin;

module.exports = Pluggi;

/**
 * Determine if input is a a valid "plugin" input
 * Valid values are:
 *   - instance of 'Plugin' class
 *   - subclass of Plugin
 *   - function
 */
function isPlugin(obj) {
	return typeof obj == 'function' || obj instanceof Plugin || isSubclassOf(obj, Plugin);
}

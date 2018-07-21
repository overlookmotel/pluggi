/* --------------------
 * 'plugins' plugin
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join;

// Imports
const Plugin = require('./pluginClass');

// Exports
module.exports = class Plugins extends Plugin {
	constructor() {
		super();

		this.paths = [];
		this.prefixes = [];
		this.moduleFirst = false;
		this.prefixedOnly = false;
	}

	/**
	 * Add an entry to local paths list
	 * @param {string} path
	 * @returns {PluginsPlugin} - plugin for chaining
	 */
	addPath(path) {
		this.paths.push(path);
		return this;
	}

	/**
	 * Add an entry to prefixes
	 * @param {string} prefix
	 * @returns {PluginsPlugin} - plugin for chaining
	 */
	addPrefix(prefix) {
		this.prefixes.push(prefix);
		return this;
	}

	/**
	 * Resolve path of plugin from name.
	 * Path is what should be passed to `require()` to load.
	 * If cannot be resolved, return `null`
	 *
	 * @param {string} name - Plugin name
	 * @returns {string|null} - Path
	 */
	resolve(name) {
		// Attempt to load as local path first, then module
		// Order reversed if `.moduleFirst` option is set
		const methods = ['resolveLocal', 'resolveModule'];
		if (this.moduleFirst) methods.reverse();

		for (let method of methods) {
			const path = this[method](name);
			if (path) return path;
		}

		// Failed to resolve
		return null;
	}

	resolveLocal(name) {
		// Attempt to resolve from local path
		for (let path of this.paths) {
			path = pathJoin(path, name);
			if (tryResolve(path)) return path;
		}
		return null;
	}

	resolveModule(name) {
		// Attempt to resolve as module with prefixes
		for (let prefix of this.prefixes) {
			const path = `${prefix}-${name}`;
			if (tryResolve(path)) return path;
		}

		// Attempt to load without any prefix
		if (!this.prefixedOnly) {
			if (tryResolve(name)) return name;
		}

		return null;
	}

	/**
	 * Load plugin.
	 * @param {string} name - Plugin name
	 * @returns {*} - The loaded plugin
	 * @throws {Error} - If cannot load
	 */
	load(name) {
		const path = this.resolve(name);
		if (path == null) throw new Error(`Unable to load plugin '${name}'`);
		return require(path);
	}
};

/**
 * Try to `require.resolve()` a module from `path`.
 * Retuns `true` if can be resolved, `false` if not.
 * @param {string} path - Path to try to resolve
 * @return {boolean}
 */
function tryResolve(path) {
	try {
		require.resolve(path);
		return true;
	} catch(err) {
		return false;
	}
}

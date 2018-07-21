/* --------------------
 * Plugin class
 * ------------------*/

'use strict';

// Exports
class Plugin {
	/**
	 * Constructor
	 * Initialize compulsory properties
	 */
	constructor() {
		this.name = undefined;
		this.app = undefined;
	}

	/**
	 * Empty `init()` method
	 */
	init() {}
}

module.exports = Plugin;

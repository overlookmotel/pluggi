// --------------------
// baser module
//
// Plugin constructor
// --------------------

// libraries
var utils = require('./utils');

// exports
module.exports = Plugin;

/*
 * Plugin constructor
 *
 * @param {String} name - Plugin name (optional)
 * @param {Object} plugin - Plugin definition
 */
function Plugin(name, plugin) {
    // allow calling without `new`
    if (!(this instanceof Plugin)) return new Plugin(name, plugin);

    // conform arguments
    if (typeof name == 'object') {
        plugin = name;
        name = undefined;
    }

    if (!plugin || typeof plugin != 'object') throw new Error('Plugin object must be provided');

    // add attributes to Plugin instance
    utils.objectExtend(this, plugin);

    // check name provided and conform to string
    if (name != undefined) this.name = name;

    if (this.name == null) throw new Error('Plugin name must be provided');
    if (typeof this.name != 'string') this.name = this.name + '';

    // conform coroutines attribute
    this.coroutines = (this.coroutines === undefined ? true : !!this.coroutines);

    // create empty plugins object
    this.plugins = {};
}

// prototype methods
Plugin.prototype = {
    /*
     * init method
     *
     * @returns {Plugin} plugin - Plugin instance for chaining
     */
    init: function() {
        // return Plugin instance for chaining
        return this;
    },

    /*
     * plugin method
     *
     * @this {Plugin | Baser} - Parent Plugin/Baser instance
     * @param {Object} plugin - Plugin definition
     * @param {String} name - Plugin name (overloaded onto `plugin` argument)
     * @param {Object} options - Options object (optional)
     * @returns {Plugin | Baser} - Parent Plugin/Baser instance for chaining
     */
    plugin: function(plugin, options) {
        // register plugin
        // xxx pass this.path for resolving plugins which are node modules
        this.app.plugin(plugin, options);
        return this;
    }
};

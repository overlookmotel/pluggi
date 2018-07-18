// --------------------
// baser module
//
// Plugin constructor
// --------------------

// libraries
var Baser = require('./'),
    shared = require('./shared'),
    utils = require('./utils');

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

    // ensure init attribute is a function
    if (typeof this.init != 'function') throw new Error('init attribute must be a function');

    // ensure all methods names are legal
    shared.conformMethods(this, Baser);

    // ensure all methods are functions
    this.methods.forEach(function(methodName) {
        if (this[methodName] != null && typeof this[methodName] != 'function') throw new Error("Attribute '" + methodName + "' is a plugin method and so must be a function");
    }.bind(this));
}

// export reference to Baser
Plugin.Baser = Baser;

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

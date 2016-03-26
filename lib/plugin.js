// --------------------
// baser module
//
// Plugin constructor
// --------------------

// modules
var _ = require('lodash');

// libraries
var shared = require('./shared'),
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
    _.extend(this, plugin);

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
        // conform arguments
        if (plugin == null) throw new Error('Plugin object must be provided');
        if (options != null && typeof options != 'object') throw new Error('options must be an object');
        options = _.extend({}, options || {});

        // if name provided rather than plugin object, load plugin module
        if (plugin !== undefined && typeof plugin != 'object') {
            var name = plugin + '';

            // load plugin object
            // xxx write this
            plugin = {name: name};
        }

        // convert into Plugin instance
        plugin = new Plugin(plugin);

        // save options to plugin
        plugin.options = options;

        // record parent and base of plugin
        plugin.parent = this;
        var base = plugin.base = this.base || this;

        // init methods array
        if (options.methods) plugin.methods = options.methods;
        shared.conformMethods(plugin, base.Baser);

        // wrap all methods to return promises
        plugin.methods.forEach(function(methodName) {
            var method = plugin[methodName];
            if (!method) return;
            if (typeof method != 'function') throw new Error("'" + methodName + "' attribute is a plugin method and so must be a function");
            plugin[methodName] = utils.promiseWrap(method, base.Promise, base.co);

            base.addMethod(methodName);
        });

        // convert all generators to co-routines
        if (plugin.coroutines) utils.generatorsWrap(plugin, base.co);

        // save plugin to Plugin/Baser instance
        if (this.plugins[plugin.name]) throw new Error("A plugin named '" + plugin.name + "' is already loaded");
        this.plugins[plugin.name] = plugin;

        // run init method
        plugin.init();

        // return Plugin/Baser instance for chaining
        return this;
    }
};

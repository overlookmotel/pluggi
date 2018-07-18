// --------------------
// baser module
// --------------------

// modules
var _co = require('co-use');

// export Baser constructor
// NB export before requiring libs so libs can require Baser constructor
module.exports = Baser;

// libraries
var _Promise = require('./promise'),
    Plugin = require('./plugin'),
    addMethod = require('./addMethod'),
    shared = require('./shared'),
    utils = require('./utils');

/*
 * Baser constructor
 * @param {Object} options - options object
 */
function Baser(name, path, options) {
    // allow calling without `new`
    if (!(this instanceof Baser)) return new Baser(name, path, options);

    // conform arguments
    if (typeof name == 'object') {
        options = name;
        name = undefined;
        path = undefined;
    } else if (typeof path == 'object') {
        options = path;
        path = undefined;
    } else if (options == null) {
        options = {};
    } else if (typeof options != 'object') {
        throw new Error('Options must be an object');
    }

    this.options = options = utils.objectClone(options);

    name = this.name = options.name = utils.defaultValue(name, options.name, 'baser');
    if (typeof name != 'string') throw new Error('App name must be a string');

    path = utils.defaultValue(path, options.path);
    if (path === undefined) {
        // get path
        // xxx write this!
        path = '/path/to/root/of/app';
    } else if (typeof path != 'string') {
        throw new Error('App path must be a string');
    }
    this.path = options.path = path;

    // init empty plugins object
    this.plugins = {};

    // init methods array
    this.methods = options.methods;
    shared.conformMethods(this, Baser);

    // create methods for each method
    options.methods.forEach(addMethod.bind(this));

    // run init method
    this.init();
}

// export Baser version
Baser.version = require('../package.json').version;

// define default methods
Baser.methods = ['prepare', 'start', 'stop', 'build', 'test'];

// define reserved attributes
// NB all Baser.prototype attributes are also added to this
Baser.reserved = ['name', 'path', 'options', 'plugins', 'parent', 'base', 'methods', 'coroutines'];

// Plugin constructor
Baser.Plugin = Plugin;

// prototype
Baser.prototype = {
    /*
     * Baser attribute
     * Reference to constructor
     */
    Baser: Baser,

    /*
     * Promise attribute
     * Native JS Promise if available or Bluebird
     */
    Promise: _Promise,

    /*
     * co attribute
     * co
     */
    co: _co,

    /*
     * usePromise method
     * Set baser.Promise to supplied promise implementation
     *
     * @param {Object} Promise - promise implementation
     * @returns {Baser} baser - Baser instance for chaining
     */
    usePromise: function(Promise) {
        this.Promise = Promise;
        this.co = _co.use(Promise);
        return this;
    },

    /*
     * init method
     *
     * @returns {Baser} baser - Baser instance for chaining
     */
    init: function() {
        // return Baser instance for chaining
        return this;
    },

    /*
     * Plugin constructor
     */
    Plugin: Plugin,

    /*
     * addMethod method
     *
     * @param {String} methodName - name of method to add
     * @returns {Baser} baser - Baser instance for chaining
     */
    addMethod: function(methodName) {
        // if method already present, skip
        if (this.methods.indexOf(methodName) != -1) return this;

        // add method name to .methods array
        this.methods.push(methodName);

        // create method
        addMethod.call(this, methodName);

        // return Baser instance for chaining
        return this;
    },

    /*
     * plugin method
     *
     * @this {Baser} - Baser instance
     * @param {Object} plugin - Plugin definition
     * @param {String} name - Plugin name (overloaded onto `plugin` argument)
     * @param {Object} options - Options object (optional)
     * @returns {Baser} - Baser instance for chaining
     */
    plugin: function(plugin, options) {
        // conform arguments
        if (plugin == null) throw new Error('Plugin object must be provided');
        if (options != null && typeof options != 'object') throw new Error('options must be an object');
        options = utils.objectClone(options || {});

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
        plugin.base = this;

        // init methods array
        if (options.methods) {
            // check all methods are ones that plugin provides
            // xxx write this
            plugin.methods = options.methods;
        }

        // wrap all methods to return promises
        plugin.methods.forEach(function(methodName) {
            var method = plugin[methodName];
            if (!method) return;
            plugin[methodName] = utils.promiseWrap(method, this.Promise, this.co);
        }.bind(this));

        // convert all generators to co-routines
        if (plugin.coroutines) utils.generatorsWrap(plugin, this.co);

        // save plugin to Baser instance
        if (this.plugins[plugin.name]) throw new Error("A plugin named '" + plugin.name + "' is already loaded");
        this.plugins[plugin.name] = plugin;

        // run init method
        plugin.init();

        // return Baser instance for chaining
        return this;
    }
};

// add Baser.prototype attributes to Baser.reserved array
for (var key in Baser.prototype) {
    Baser.reserved.push(key);
}

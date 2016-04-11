// --------------------
// baser module
// --------------------

// modules
var _co = require('co-use');

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
module.exports = Baser;

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
Baser.reserved = ['name', 'path', 'options', 'plugins', 'parent', 'base', 'app', 'methods', 'coroutines'];

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
     * plugin method
     */
    plugin: Plugin.prototype.plugin,

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
    }
};

// add Baser.prototype attributes to Baser.reserved array
for (var key in Baser.prototype) {
    Baser.reserved.push(key);
}

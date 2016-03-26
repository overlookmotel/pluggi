// --------------------
// baser module
// --------------------

// modules
var _co = require('co-use'),
    _ = require('lodash');

// libraries
var _Promise = require('./promise'),
    Plugin = require('./plugin'),
    shared = require('./shared'),
    utils = require('./utils');

/*
 * Baser constructor
 * @param {Object} options - options object
 */
module.exports = Baser;

function Baser(options) {
    // allow calling without `new`
    if (!(this instanceof Baser)) return new Baser(options);

    // save options
    if (options != null && typeof options != 'object') throw new Error('options must be an object');
    this.options = options = _.extend({}, options || {});

    // init empty plugins object
    this.plugins = {};

    // init methods array
    shared.conformMethods(options, Baser);

    // create methods for each method
    options.methods.forEach(addMethod.bind(this));

    // run init method
    this.init();
}

// define default methods
Baser.methods = ['prepare', 'start', 'stop', 'build', 'test'];

// define reserved attributes
// NB all Baser.prototype attributes are also added to this
Baser.reserved = ['options', 'parent', 'base', 'methods', 'coroutines'];

// Plugin constructor
Baser.Plugin = Plugin;

// lodash
Baser._ = _;

// prototype
Baser.prototype = {
    /*
     * Baser attribute
     * Reference to constructor
     */
    Baser: Baser,

    /*
     * _ attribute
     * Lodash
     */
    _: _,

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
     */
    addMethod: function(methodName) {
        if (this.methods.indexOf(methodName) != -1) return;
        this.methods.push(methodName);

        addMethod.call(this, methodName);
    }
};

// add Baser.prototype attributes to Baser.reserved array
for (var key in Baser.prototype) {
    Baser.reserved.push(key);
}

function addMethod(methodName) {
    this[methodName] = function(options) {
        // conform options
        if (options != null && typeof options != 'object') throw new Error('options must be an object');
        if (!options) options = {};

        // run all plugin methods
        var plugins = utils.objectValues(this.plugins),
            Promise = this.Promise;

        return next(0);

        function next(index) {
            // if finished cascade, return fulfilled promise
            if (index == plugins.length) return Promise.resolve();

            // call plugin method (skip if has no such method)
            var plugin = plugins[index];
            if (plugin.methods.indexOf(methodName) == -1 || !plugin[methodName]) return next(index + 1);
            return plugin[methodName].call(plugin, options, next.bind(this, index + 1));
        }
    };
}

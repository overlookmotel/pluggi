// --------------------
// baser module
// addMethod function
// --------------------

// libraries
var utils = require('./utils');

// exports
module.exports = addMethod;

/*
 * addMethod function
 * Adds method to Baser instance
 *
 * @this {Baser} - Baser instance
 * @param {String} methodName - name of method to add
 */
function addMethod(methodName) {
    this[methodName] = function(options) {
        return callMethod.call(this, methodName, options);
    };
}

/*
 * callMethod function
 * Calls method on Baser instance's plugins.
 * Calls `methodName` of each registered plugin, cascading through the stack
 *   by passing a `next` function to each plugin method which calls the next.
 * Each plugin method is expected to return a Promise.
 * The resolved value of the promises are discarded.
 *
 * @this {Baser} - Baser instance
 * @param {String} methodName - name of method to call
 * @returns {Promise<undefined>} promise - promise which is resolved when all plugin methods have executed
 */
function callMethod(methodName, options) {
    // conform options
    if (options != null && typeof options != 'object') throw new Error('options must be an object');
    if (!options) options = {};

    // run all plugin methods
    var plugins = utils.objectValues(this.plugins),
        Promise = this.Promise;

    return next(0);

    function next(index) {
        // if finished cascade, return fulfilled promise
        if (index >= plugins.length) return Promise.resolve();

        // call plugin method (skip if has no such method)
        var plugin = plugins[index];
        if (plugin.methods.indexOf(methodName) == -1 || !plugin[methodName]) return next(index + 1);
        return plugin[methodName].call(plugin, options, next.bind(null, index + 1)).return();
    }
}

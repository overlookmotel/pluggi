// --------------------
// baser module
// Utility functions
// --------------------

// modules
var isGeneratorFn = require('is-generator').fn;

// exports
var utils = module.exports = {
    /*
     * objectValues function
     * Returns array of object's values
     * Undefined values are skipped
     *
     * @param {Object} obj - Input object
     * @returns {Array} values - Array of object's values
     */
    objectValues: function(obj) {
        var values = [];
        for (var key in obj) {
            if (obj[key] !== undefined) values.push(obj[key]);
        }
        return values;
    },

    /*
     * promiseWrap function
     * Wraps function to always return a promise
     * Generator functions are wrapped with co
     *
     * Sync values are returned as a promise resolved with the value
     * Sync errors are returned as a promise rejected with the error
     * Same as Bluebird.method()
     *
     * @param {Function} fn - Function to be wrapped
     * @param {Object} Promise - Promise implementation
     * @param {Object} co - co implementation
     * @returns {Function} - Wrapped function
     */
    promiseWrap: function(fn, Promise, co) {
        // wrap generator functions with co
        if (isGeneratorFn(fn)) return co.wrap(fn);

        // wrap functions to return promises
        return function() {
            try {
                return Promise.resolve(fn.apply(this, arguments));
            } catch (err) {
                return Promise.reject(err);
            }
        };
    },

    /*
     * generatorWrap function
     * Wraps all attributes of object which are generator functions into coroutines that return a promise
     *
     * @param {Object} obj - Object to have attributes wrapped
     * @param {Object} co - co implementation
     * @returns {Object} obj - Object
     */
    generatorsWrap: function(obj, co) {
        for (var key in obj) {
            if (isGeneratorFn(obj[key])) obj[key] = co.wrap(obj[key]);
        }
        return obj;
    },

    /*
     * defaultValue function
     * Returns first argument which is not null or undefined
     *
     * @param {<any>...} params
     * @returns {<any>} value
     */
    defaultValue: function() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] != null) return arguments[i];
        }
    },

    /*
     * shim function
     * Shims a function with wrapper
     * xxx not used
     *
     * @param {Function} fn - Original function
     * @param {Function} wrapper - Function to wrap fn
     * @returns {Function} - New function, wrapped with wrapper
     */
    shim: function(fn, wrapper) {
        return wrapper(fn);
    },

    /*
     * valueToArray function
     * Conform value to array
     * xxx not used
     *
     * @param {Array | any} value - Input value (optional)
     * @param {Array} _default - Default if no value provided (optional)
     * @returns {Array} - Value conformed to array
     */
    valueToArray: function(value, _default) {
        if (Array.isArray(value)) return value;
        if (value == null) return _default || [];
        return [value];
    },

    /*
     * setReadOnly function
     * Sets property of object to value and makes read-only
     * xxx not used
     *
     * @param {Object} obj - Object to have attribute set
     * @param {String} key - Key
     * @param {any} value - Value
     */
    setReadOnly: function(obj, key, value) {
        Object.defineProperty(obj, key, {
            value: value,
            writable: false
        });

        return value;
    },

    /*
     * setAllReadOnly function
     * Sets property of object to value and makes read-only
     * xxx not used
     *
     * @param {Object} obj - Object to have attribute set
     * @param {String} key - Key
     * @param {any} value - Value
     */
    setAllReadOnly: function(obj, source) {
        for (var key in source) {
            utils.setReadOnly(obj, key, source[key]);
        }

        return obj;
    }
};

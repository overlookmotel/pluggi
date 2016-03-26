// --------------------
// baser module
// Shared functions
// --------------------

// exports
module.exports = {
    /*
     * conformMethods function
     * Conform methods array
     *
     * @param {Object} options - options object
     * @param {Function} Baser - Baser constructor
     * @returns {Array} methods - methods array
     */
    conformMethods: function(options, Baser) {
        if (options.methods == null) {
            options.methods = Baser.methods.concat();
        } else if (!Array.isArray(options.methods)) {
            throw new Error('methods must be an array');
        } else {
            // check for reserved method names and remove duplicates
            var methods = [];
            options.methods.forEach(function(methodName) {
                if (Baser.reserved.indexOf(methodName) != -1) throw new Error("Method name '" + methodName + "' is reserved for internal use");
                if (methods.indexOf(methodName) == -1) methods.push(methodName);
            });
            options.methods = methods;
        }

        return options.methods;
    }
};

// --------------------
// baser module
//
// Promise
// Return native promise if available, or bluebird
// --------------------

// export Promise

// try native promise
var P;
try {
    P = Promise; // jshint ignore:line
} catch (err) {}

// fallback on bluebird
if (!P) P = require('bluebird');

module.exports = P;

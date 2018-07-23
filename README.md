# pluggi.js

# Base for building modularised apps with plugins

## Current status

[![NPM version](https://img.shields.io/npm/v/pluggi.svg)](https://www.npmjs.com/package/pluggi)
[![Build Status](https://img.shields.io/travis/overlookmotel/pluggi/master.svg)](http://travis-ci.org/overlookmotel/pluggi)
[![Dependency Status](https://img.shields.io/david/overlookmotel/pluggi.svg)](https://david-dm.org/overlookmotel/pluggi)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/pluggi.svg)](https://david-dm.org/overlookmotel/pluggi)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookmotel/pluggi.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/pluggi/master.svg)](https://coveralls.io/r/overlookmotel/pluggi)

## What's it for?

An easy way create apps which accept plugins.

A plugin is just a function which is executed and passed the app instance and options.

It's dead simple but powerful.

## Usage

```js
const Pluggi = require('pluggi');

const app = new Pluggi( {
  myPlugin: { a: 1 }
} );

app.plugin( 'myPlugin', function(_app, options) {
  assert(_app == app); // Plugin called with app instance
  assert(options.a == 1); // Options keyed with the name of the plugin are passed
} );
```

### Plugin loading methods

**API: `.plugin( [name], [plugin], [options] )`**

#### Name + plugin function

```js
app.plugin( 'myPlugin', function(app, options) {
  /* ... */
} );
```

#### Named function

If function is named, plugin name is taken from the function name. This is equivalent to the above example:

```js
app.plugin( function myPlugin(app, options) {
  /* ... */
} );
```

#### Module name

If just name is provided, the plugin is loaded as a Node module.

```js
app.plugin( 'my-amazing-plugin' );

assert(app.plugins.myAmazingPlugin);
```

This calls `require('my-amazing-plugin')` internally. Note that the plugin name is converted to camel case.

The module "my-amazing-plugin" should export a plugin function:

```js
module.exports = function myAmazingPlugin(app, options) {
  /* ... */
};
```

### Plugin registry

The app has a property `.plugins` which contains a registry of all loaded plugins.

The value for each property of `.plugins` is the return value from the plugin function.

```js
app.plugin( 'myPlugin', () => ({ aProp: 123 }) );

assert(app.plugins.myPlugin.aProp == 123);
```

Return value must be an object, or an empty object `{}` is used.

### Subclassing

Let's say you're making a web framework called "monkey". You want users to be able to develop plugins for this framework.

Subclass `Pluggi` and set `[PLUGIN_PREFIX]` to `'monkey'`.

```js
const {PLUGIN_PREFIX} = Pluggi;

class Monkey extends Pluggi {
	constructor(options) {
		super(options);
		this[PLUGIN_PREFIX] = 'monkey';
	}
}
```

Now users can develop plugins published on npm as 'monkey-routes', 'monkey-express' etc. When a plugin is loaded by name only, 'monkey-' is added to the start of the module name before it is `require()`-ed.

```js
const app = new Monkey();
app.plugin('router')
  .plugin('express');

assert(app.plugins.router);
assert(app.plugins.express);
```

The plugins are registered as `router` and `express`, but the npm modules which were required were called 'monkey-router' and 'monkey-express'.

Scoped prefixes also work. e.g. with prefix '@monkey', 'routes' will be loaded from '@monkey/routes'.

NB `PLUGIN_PREFIX` is currently a string, but it may be changed to a `Symbol` in a future version. This will not be considered a semver major change, so always use it via `Pluggi.PLUGIN_PREFIX`.

### Options

Options are set for a plugin in 2 places - local and global. The two are merged when passed to the plugin.

```js
const app = new Pluggi( {
  router: { globalOpt: 123 }
} );

// Here is our plugin function
function router(app, options) {
  console.log(options);
}

app.plugin( router, { localOpt: 456 } );

// Logs { globalOpt: 123, localOpt: 456 }
```

Global options are recorded on the app as `app.options`.

### Namespacing

Plugins will typically alter properties on the app.

To ensure two plugins do not clash, it is recommended that they respect a namespace defined by the name of the plugin. They should only make changes in two ways:

1. Set property on app named with plugin name
2. Return a value to be stored in the `app.plugins` object

```js
// Example plugin
function router(app, options) {
  app.router = ...
  return { bindToExpress: function() { ... } };
}
```

The `bindToExpress()` method can now be accessed at `app.plugins.router.bindToExpress()`.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookmotel/pluggi/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/pluggi/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README

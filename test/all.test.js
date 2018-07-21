/* --------------------
 * pluggi module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	spyModule = require('spy-module'),
	Pluggi = require('../lib/'),
	{Plugin} = Pluggi;

// Init
chai.use(sinonChai);
chai.config.includeStack = true;

// Tests

/* jshint expr: true */
/* global describe, it, beforeEach, afterEach */

describe('Constructor', function() {
	let app, options;
	beforeEach(function() {
		options = {globalOpt: 1};
		app = new Pluggi(options);
	});

	it('creates Pluggi instance', function() {
		expect(app).to.be.instanceof(Pluggi);
	});

	it('saves options', function() {
		expect(app.options).to.equal(options);
	});

	it('creates empty options object if no options passed', function() {
		app = new Pluggi();
		expect(app.options).to.be.an('object');
		expect(app.options).to.deep.equal({plugin: {}, plugins: {}});
	});

	it('initializes `plugins` object', function() {
		expect(app.plugins).to.be.an('object');
		expect(app.plugins).to.have.keys('plugin', 'plugins');
		expect(app.plugins.plugin).to.be.instanceof(Plugin);
		expect(app.plugins.plugins).to.be.instanceof(Plugin);
	});
});

describe('`.plugin()`', function() {
	describe('with arguments (name, plugin, options)', function() {
		pluginTests({
			makeArgs: (name, plugin, options) => [name, plugin, options],
			localOptions: true
		});
	});

	describe('with arguments (name, plugin)', function() {
		pluginTests({
			makeArgs: (name, plugin, options) => [name, plugin], // jshint ignore:line
			localOptions: false
		});
	});

	describe('with arguments (plugin, options)', function() {
		pluginTests({
			makeArgs: (name, plugin, options) => [plugin, options], // jshint ignore:line
			name: 'proxy', // name of function returned by `sinon.fake()` is 'proxy'
			localOptions: true,
			throwsWhenNameless: true
		});
	});

	describe('with arguments (plugin)', function() {
		pluginTests({
			makeArgs: (name, plugin, options) => [plugin], // jshint ignore:line
			name: 'proxy', // name of function returned by `sinon.fake()` is 'proxy'
			localOptions: false,
			throwsWhenNameless: true
		});
	});

	describe('with arguments (name, options)', function() {
		afterEach(function() {
			spyModule.resetHistory();
		});

		describe('with no prefixes defined', function() {
			pluginTests({
				makeArgs: (name, plugin, options) => [name, options], // jshint ignore:line
				name: 'spyModule',
				loadName: 'spy-module',
				plugin: spyModule,
				res: spyModule.spyModuleReturnValue,
				localOptions: true
			});
		});

		describe('with prefix defined', function() {
			pluginTests({
				makeArgs: (name, plugin, options) => [name, options], // jshint ignore:line
				prep: app => app.plugins.plugins.addPrefix('spy'),
				name: 'module',
				plugin: spyModule,
				res: spyModule.spyModuleReturnValue,
				localOptions: true
			});
		});
	});

	describe('with arguments (name)', function() {
		afterEach(function() {
			spyModule.resetHistory();
		});

		describe('with no prefixes defined', function() {
			pluginTests({
				makeArgs: (name, plugin, options) => [name], // jshint ignore:line
				name: 'spyModule',
				loadName: 'spy-module',
				plugin: spyModule,
				res: spyModule.spyModuleReturnValue,
				localOptions: false
			});
		});

		describe('with prefix defined', function() {
			pluginTests({
				makeArgs: (name, plugin, options) => [name], // jshint ignore:line
				prep: app => app.plugins.plugins.addPrefix('spy'),
				name: 'module',
				plugin: spyModule,
				res: spyModule.spyModuleReturnValue,
				localOptions: false
			});
		});
	});
});

function pluginTests(opts) {
	if (!opts) opts = {};
	const {makeArgs} = opts;

	let app, plugin, name, name2, loadName,
		globalOptions, options, res, ret;
	beforeEach(function() {
		({name, name2, loadName, plugin, globalOptions, options, res} = Object.assign({
			name: 'plugName',
			name2: 'plugName2',
			loadName: null,
			plugin: null,
			options: {localOpt: 2},
			globalOptions: {globalOpt: 1},
			res: {resProp: 3}
		}, opts));

		if (loadName === null) loadName = name;
		if (!plugin) plugin = sinon.fake.returns(res);

		app = new Pluggi({[name]: globalOptions});

		if (opts.prep) opts.prep(app);

		const args = makeArgs(loadName, plugin, options);
		ret = app.plugin.apply(app, args);
	});

	it('calls plugin', function() {
		expect(plugin).to.be.calledOnce;
	});

	it('calls plugin with 2 args', function() {
		expectCalledWithTwoArgs(plugin);
	});

	it('calls plugin with app', function() {
		expectCalledWithFirstArg(plugin, app);
	});

	if (opts.localOptions) {
		it('calls plugin with local options', function() {
			expectCalledWithSecondArg(plugin, sinon.match(options));
		});
	}

	it('calls plugin with global options', function() {
		expectCalledWithSecondArg(plugin, sinon.match(globalOptions));
	});

	it('records plugin return value in plugins object', function() {
		expectProps(app.plugins[name], this.res);
	});

	if (opts.throwsWhenNameless) {
		it('throws when plugin function is nameless', function() {
			const args = makeArgs(name2, function() {}, options);

			expect(() => {
				app.plugin.apply(app, args);
			}).to.throw(Error, /^name must be provided, or plugin must have name defined, or plugin function must be named$/);
		});
	}

	it('returns `app` for chaining', function() {
		expect(ret).to.equal(app);
	});
}

/*
 * Helper functions
 */
function expectCalledWithTwoArgs(spy) {
	expect(spy).to.be.calledWithExactly(sinon.match.defined, sinon.match.defined);
}

function expectCalledWithFirstArg(spy, arg) {
	expect(spy).to.be.calledWith(arg);
}

function expectCalledWithSecondArg(spy, arg) {
	expect(spy).to.be.calledWith(sinon.match.any, arg);
}

function expectProps(obj, props) {
	for (let prop in props) {
		expect(obj).to.have.property(prop, props[prop]);
	}
}

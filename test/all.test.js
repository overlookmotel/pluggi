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
	Pluggi = require('../lib/');

// Init
chai.use(sinonChai);
chai.config.includeStack = true;

// Tests

/* jshint expr: true */
/* global describe, it, beforeEach, afterEach */

describe('Constructor', function() {
	beforeEach(function() {
		this.options = {globalOpt: 1};
		this.app = new Pluggi(this.options);
	});

	it('creates Pluggi instance', function() {
		expect(this.app).to.be.instanceof(Pluggi);
	});

	it('saves options', function() {
		expect(this.app.options).to.equal(this.options);
	});

	it('creates empty options object if no options passed', function() {
		this.app = new Pluggi();
		expect(this.app.options).to.be.an('object');
		expect(this.app.options).to.deep.equal({});
	});

	it('initializes empty `plugins` object', function() {
		expect(this.app.plugins).to.deep.equal({});
	});

	it('Exports static property PLUGIN_PREFIX', function() {
		expect(Pluggi.PLUGIN_PREFIX).to.be.a('string');
	});

	it('initializes [PLUGIN_PREFIX] as null', function() {
		const b = new Pluggi();
		expect(b[Pluggi.PLUGIN_PREFIX]).to.be.null;
	});
});

describe('`.plugin()`', function() {
	beforeEach(function() {
		this.pluginName = 'plugName';
		this.pluginName2 = 'plugName2';
		this.globalOptions = {globalOpt: 1};
	});

	describe('with arguments (name, plugin, options)', function() {
		beforeEach(function() {
			this.app = new Pluggi({[this.pluginName]: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.app.plugin(this.pluginName, this.plugin, this.options);
			this.app.plugin(this.pluginName2, () => {}, this.options);
		});

		pluginTests({localOptions: true});
	});

	describe('with arguments (name, plugin)', function() {
		beforeEach(function() {
			this.app = new Pluggi({[this.pluginName]: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.app.plugin('plugName', this.plugin);
			this.app.plugin(this.pluginName2, () => {});
		});

		pluginTests({localOptions: false});
	});

	describe('with arguments (plugin, options)', function() {
		beforeEach(function() {
			this.pluginName = 'proxy';
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.app = new Pluggi({[this.pluginName]: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.app.plugin(this.plugin, this.options);
			this.app.plugin(function plugName2() {}, this.options);
		});

		pluginTests({localOptions: true});

		it('throws when plugin function is nameless', function() {
			expect(() => {
				this.app.plugin(function() {}, this.options);
			}).to.throw(Error, /^name passed to `\.plugin\(\)` must be provided or plugin function must be named$/);
		});
	});

	describe('with arguments (plugin)', function() {
		beforeEach(function() {
			this.pluginName = 'proxy';
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.app = new Pluggi({[this.pluginName]: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.app.plugin(this.plugin);
			this.app.plugin(function plugName2() {});
		});

		pluginTests({localOptions: false});

		it('throws when plugin function is nameless', function() {
			expect(() => {
				this.app.plugin(function() {});
			}).to.throw(Error, /^name passed to `\.plugin\(\)` must be provided or plugin function must be named$/);
		});
	});

	describe('with arguments (name, options)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.pluginName = 'spyModule';
				this.app = new Pluggi({[this.pluginName]: this.globalOptions});
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.app.plugin('spy-module', this.options);
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			pluginTests({localOptions: true, skipEmptyObject: true});
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.pluginName = 'module';
				this.app = new Pluggi({[this.pluginName]: this.globalOptions});
				this.app[Pluggi.PLUGIN_PREFIX] = 'spy';
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.app.plugin('module', this.options);
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			pluginTests({localOptions: true, skipEmptyObject: true});
		});
	});

	describe('with arguments (name)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.pluginName = 'spyModule';
				this.app = new Pluggi({[this.pluginName]: this.globalOptions});
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.app.plugin('spy-module');
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			pluginTests({localOptions: false, skipEmptyObject: true});
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.pluginName = 'module';
				this.app = new Pluggi({[this.pluginName]: this.globalOptions});
				this.app[Pluggi.PLUGIN_PREFIX] = 'spy';
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.app.plugin('module');
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			pluginTests({localOptions: false, skipEmptyObject: true});
		});
	});
});

function runTests(makePluginArgs, opts) {
	let app, pluginName, pluginName2, globalOptions, options, res, plugin, ret;
	beforeEach(function() {
		({pluginName, pluginName2, globalOptions, options, res, plugin} = Object.assign({
			pluginName: 'plugName',
			pluginName2: 'plugName2',
			globalOptions: {globalOpt: 1},
			options: {localOpt: 2},
			res: {resProp: 3},
			plugin: sinon.fake.returns(res)
		}, opts));

		app = new Pluggi({[pluginName]: globalOptions});
		const args = makePluginArgs(app, pluginName, plugin, options);
		app.plugin.apply(app, args);
	});
}

function pluginTests(options) {
	if (!options) options = {};

	it('calls plugin', function() {
		expect(this.plugin).to.be.calledOnce;
	});

	it('calls plugin with 2 args', function() {
		expectCalledWithTwoArgs(this.plugin);
	});

	it('calls plugin with app', function() {
		expectCalledWithFirstArg(this.plugin, this.app);
	});

	if (options.localOptions) {
		it('calls plugin with provided options', function() {
			expectCalledWithSecondArg(this.plugin, sinon.match(this.options));
		});

		it('calls plugin with global options', function() {
			expectCalledWithSecondArg(this.plugin, sinon.match(this.globalOptions));
		});
	} else {
		it('calls plugin with global options', function() {
			expectCalledWithSecondArg(this.plugin, this.globalOptions);
		});
	}

	it('records plugin return value in plugins object', function() {
		expect(this.app.plugins[this.pluginName]).to.equal(this.res);
	});

	if (!options.skipEmptyObject) {
		it('records empty object in plugins object when plugin returns undefined', function() {
			expect(this.app.plugins[this.pluginName2]).to.deep.equal({});
		});
	}

	it('returns `app` for chaining', function() {
		expect(this.ret).to.equal(this.app);
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

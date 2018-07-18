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
		this.b = new Pluggi(this.options);
	});

	it('creates Pluggi instance', function() {
		expect(this.b).to.be.instanceof(Pluggi);
	});

	it('saves options', function() {
		expect(this.b.options).to.equal(this.options);
	});

	it('initializes empty `plugins` object', function() {
		expect(this.b.plugins).to.deep.equal({});
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
		this.globalOptions = {globalOpt: 1};
	});

	describe('with arguments (name, plugin, options)', function() {
		beforeEach(function() {
			this.b = new Pluggi({plugName: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.b.plugin('plugName', this.plugin, this.options);
		});

		it('calls plugin', function() {
			expect(this.plugin).to.be.calledOnce;
		});

		it('calls plugin with provided options', function() {
			expect(this.plugin).to.be.calledWithExactly(sinon.match(this.options));
		});

		it('calls plugin with global options', function() {
			expect(this.plugin).to.be.calledWithExactly(sinon.match(this.globalOptions));
		});

		it('calls plugin with context', function() {
			expect(this.plugin).to.be.calledOn(this.b);
		});

		it('records plugin return value in plugins object', function() {
			expect(this.b.plugins.plugName).to.equal(this.res);
		});

		it('when plugin returns undefined, records empty object in plugins object', function() {
			this.b.plugin('plugName2', () => {}, this.options);
			expect(this.b.plugins.plugName2).to.deep.equal({});
		});

		it('returns `app` for chaining', function() {
			expect(this.ret).to.equal(this.b);
		});
	});

	describe('with arguments (name, plugin)', function() {
		beforeEach(function() {
			this.b = new Pluggi({plugName: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.b.plugin('plugName', this.plugin);
		});

		it('calls plugin', function() {
			expect(this.plugin).to.be.calledOnce;
		});

		it('calls plugin with global options', function() {
			expect(this.plugin).to.be.calledWithExactly(this.globalOptions);
		});

		it('calls plugin with context', function() {
			expect(this.plugin).to.be.calledOn(this.b);
		});

		it('records plugin return value in plugins object', function() {
			expect(this.b.plugins.plugName).to.equal(this.res);
		});

		it('records empty object in plugins object when plugin returns undefined', function() {
			this.b.plugin('plugName2', () => {});
			expect(this.b.plugins.plugName2).to.deep.equal({});
		});

		it('returns `app` for chaining', function() {
			expect(this.ret).to.equal(this.b);
		});
	});

	describe('with arguments (plugin, options)', function() {
		beforeEach(function() {
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.b = new Pluggi({proxy: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.b.plugin(this.plugin, this.options);
		});

		it('calls plugin', function() {
			expect(this.plugin).to.be.calledOnce;
		});

		it('calls plugin with provided options', function() {
			expect(this.plugin).to.be.calledWithExactly(sinon.match(this.options));
		});

		it('calls plugin with global options', function() {
			expect(this.plugin).to.be.calledWithExactly(sinon.match(this.globalOptions));
		});

		it('calls plugin with context', function() {
			expect(this.plugin).to.be.calledOn(this.b);
		});

		it('records plugin return value in plugins object', function() {
			expect(this.b.plugins.proxy).to.equal(this.res);
		});

		it('records empty object in plugins object when plugin returns undefined', function() {
			this.b.plugin(function plugName2() {}, this.options);
			expect(this.b.plugins.plugName2).to.deep.equal({});
		});

		it('throws when plugin function is nameless', function() {
			expect(() => {
				this.b.plugin(function() {}, this.options);
			}).to.throw(Error, /^name passed to `\.plugin\(\)` must be provided or plugin function must be named$/);
		});

		it('returns `app` for chaining', function() {
			expect(this.ret).to.equal(this.b);
		});
	});

	describe('with arguments (plugin)', function() {
		beforeEach(function() {
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.b = new Pluggi({proxy: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.ret = this.b.plugin(this.plugin);
		});

		it('calls plugin', function() {
			expect(this.plugin).to.be.calledOnce;
		});

		it('calls plugin with global options', function() {
			expect(this.plugin).to.be.calledWithExactly(this.globalOptions);
		});

		it('calls plugin with context', function() {
			expect(this.plugin).to.be.calledOn(this.b);
		});

		it('records plugin return value in plugins object', function() {
			expect(this.b.plugins.proxy).to.equal(this.res);
		});

		it('records empty object in plugins object when plugin returns undefined', function() {
			this.b.plugin(function plugName2() {});
			expect(this.b.plugins.plugName2).to.deep.equal({});
		});

		it('throws when plugin function is nameless', function() {
			expect(() => {
				this.b.plugin(function() {});
			}).to.throw(Error, /^name passed to `\.plugin\(\)` must be provided or plugin function must be named$/);
		});

		it('returns `app` for chaining', function() {
			expect(this.ret).to.equal(this.b);
		});
	});

	describe('with arguments (name, options)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Pluggi({spyModule: this.globalOptions});
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.b.plugin('spy-module', this.options);
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			it('calls plugin', function() {
				expect(this.plugin).to.be.calledOnce;
			});

			it('calls plugin with provided options', function() {
				expect(this.plugin).to.be.calledWithExactly(sinon.match(this.options));
			});

			it('calls plugin with global options', function() {
				expect(this.plugin).to.be.calledWithExactly(sinon.match(this.globalOptions));
			});

			it('calls plugin with context', function() {
				expect(this.plugin).to.be.calledOn(this.b);
			});

			it('records plugin return value in plugins object', function() {
				expect(this.b.plugins.spyModule).to.equal(this.res);
			});

			it('returns `app` for chaining', function() {
				expect(this.ret).to.equal(this.b);
			});
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Pluggi({'module': this.globalOptions});
				this.b[Pluggi.PLUGIN_PREFIX] = 'spy';
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.b.plugin('module', this.options);
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			it('calls plugin', function() {
				expect(this.plugin).to.be.calledOnce;
			});

			it('calls plugin with provided options', function() {
				expect(this.plugin).to.be.calledWithExactly(sinon.match(this.options));
			});

			it('calls plugin with global options', function() {
				expect(this.plugin).to.be.calledWithExactly(sinon.match(this.globalOptions));
			});

			it('calls plugin with context', function() {
				expect(this.plugin).to.be.calledOn(this.b);
			});

			it('records plugin return value in plugins object', function() {
				expect(this.b.plugins.module).to.equal(this.res);
			});

			it('returns `app` for chaining', function() {
				expect(this.ret).to.equal(this.b);
			});
		});
	});

	describe('with arguments (name)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Pluggi({spyModule: this.globalOptions});
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.b.plugin('spy-module');
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			it('calls plugin', function() {
				expect(this.plugin).to.be.calledOnce;
			});

			it('calls plugin with global options', function() {
				expect(this.plugin).to.be.calledWithExactly(this.globalOptions);
			});

			it('calls plugin with context', function() {
				expect(this.plugin).to.be.calledOn(this.b);
			});

			it('records plugin return value in plugins object', function() {
				expect(this.b.plugins.spyModule).to.equal(this.res);
			});

			it('returns `app` for chaining', function() {
				expect(this.ret).to.equal(this.b);
			});
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Pluggi({'module': this.globalOptions});
				this.b[Pluggi.PLUGIN_PREFIX] = 'spy';
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.ret = this.b.plugin('module');
			});

			afterEach(function() {
				spyModule.resetHistory();
			});

			it('calls plugin', function() {
				expect(this.plugin).to.be.calledOnce;
			});

			it('calls plugin with global options', function() {
				expect(this.plugin).to.be.calledWithExactly(this.globalOptions);
			});

			it('calls plugin with context', function() {
				expect(this.plugin).to.be.calledOn(this.b);
			});

			it('records plugin return value in plugins object', function() {
				expect(this.b.plugins.module).to.equal(this.res);
			});

			it('returns `app` for chaining', function() {
				expect(this.ret).to.equal(this.b);
			});
		});
	});
});

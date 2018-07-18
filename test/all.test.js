/* --------------------
 * baser module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	spyModule = require('spy-module'),
	Baser = require('../lib/');

// Init
chai.use(sinonChai);
chai.config.includeStack = true;

// Tests

/* jshint expr: true */
/* global describe, it, beforeEach, afterEach */

describe('Constructor', function() {
	beforeEach(function() {
		this.options = {globalOpt: 1};
		this.b = new Baser(this.options);
	});

	it('creates Baser instance', function() {
		expect(this.b).to.be.instanceof(Baser);
	});

	it('saves options', function() {
		expect(this.b.options).to.equal(this.options);
	});

	it('initializes empty `plugins` object', function() {
		expect(this.b.plugins).to.deep.equal({});
	});

	it('Exports static property PLUGIN_PREFIX', function() {
		expect(Baser.PLUGIN_PREFIX).to.be.a('string');
	});

	it('initializes [PLUGIN_PREFIX] as null', function() {
		const b = new Baser();
		expect(b[Baser.PLUGIN_PREFIX]).to.be.null;
	});
});

describe('`.plugin()`', function() {
	beforeEach(function() {
		this.globalOptions = {globalOpt: 1};
	});

	describe('with arguments (name, plugin, options)', function() {
		beforeEach(function() {
			this.b = new Baser({plugName: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.b.plugin('plugName', this.plugin, this.options);
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
	});

	describe('with arguments (name, plugin)', function() {
		beforeEach(function() {
			this.b = new Baser({plugName: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.b.plugin('plugName', this.plugin);
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
	});

	describe('with arguments (plugin, options)', function() {
		beforeEach(function() {
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.b = new Baser({proxy: this.globalOptions});
			this.options = {localOpt: 2};
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.b.plugin(this.plugin, this.options);
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
	});

	describe('with arguments (plugin)', function() {
		beforeEach(function() {
			// NB name of function returned by `sinon.fake()` is 'proxy'
			this.b = new Baser({proxy: this.globalOptions});
			this.res = {resProp: 3};
			this.plugin = sinon.fake.returns(this.res);
			this.b.plugin(this.plugin);
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
	});

	describe('with arguments (name, options)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Baser({spyModule: this.globalOptions});
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.b.plugin('spy-module', this.options);
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
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Baser({'module': this.globalOptions});
				this.b[Baser.PLUGIN_PREFIX] = 'spy';
				this.options = {localOpt: 2};
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.b.plugin('module', this.options);
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
		});
	});

	describe('with arguments (name)', function() {
		describe('with no PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Baser({spyModule: this.globalOptions});
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.b.plugin('spy-module');
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
		});

		describe('with PLUGIN_PREFIX defined', function() {
			beforeEach(function() {
				this.b = new Baser({'module': this.globalOptions});
				this.b[Baser.PLUGIN_PREFIX] = 'spy';
				this.res = spyModule.spyModuleReturnValue;
				this.plugin = spyModule;
				this.b.plugin('module');
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
		});
	});
});

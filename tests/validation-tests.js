var should = require('should'),
	leaf = require('../');

describe('Validation', function() {
	describe('constructor parsing', function() {
		var factory = {
			create: function(name) {
				return name;
			}
		};

		it('without comments', function() {
			function Foo() {
				this.foo = 'bar';
			}

			var validator = new leaf.Validator(Foo);
			validator.properties.should.eql({});
		});

		it('with single-line validator', function() {
			function Foo() {
				/** @validator foo */
				this.foo = 'bar';
			}

			var validator = new leaf.Validator(Foo, factory);
			validator.properties.should.eql({ foo: [ 'foo' ] });
		});

		it('with multiple validators', function() {
			function Foo() {
				/**
				 * @validator foo
				 * @validator bar
				 */
				this.foo = 'bar';
			}

			var validator = new leaf.Validator(Foo, factory);
			validator.properties.should.eql({ foo: [ 'foo', 'bar' ] });
		});

		it('with multiple properties', function() {
			function Foo() {
				/**
				 * @validator foo
				 * @validator bar
				 */
				this.foo = 'bar';

				/**
				 * @validator baz
				 * @validator bat
				 */
				this.bar = 'baz';
			}

			var validator = new leaf.Validator(Foo, factory);
			validator.properties.should.eql({ foo: [ 'foo', 'bar' ], bar: [ 'baz', 'bat' ] });
		});

		it('with empty validator arguments', function() {
			var factoryChecked = false;
			var factory = {
				create: function(name, args) {
					factoryChecked = true;
					name.should.equal('foo');
					args.should.eql([]);
				}
			};
			function Foo() {
				/**
				 * @validator foo()
				 */
				this.foo = 'bar';
			}

			new leaf.Validator(Foo, factory);
			factoryChecked.should.equal(true);
		});

		it('with validator string arguments', function() {
			var factoryChecked = false;
			var factory = {
				create: function(name, args) {
					factoryChecked = true;
					name.should.equal('foo');
					args.should.eql([ 'bar', 'baz' ]);
				}
			};

			function Foo() {
				/**
				 * @validator foo('bar', 'baz')
				 */
				this.foo = 'bar';
			}

			new leaf.Validator(Foo, factory);
			factoryChecked.should.equal(true);
		});

		it('with weird validator arguments', function() {
			var factoryChecked = false;
			var factory = {
				create: function(name, args) {
					factoryChecked = true;
					name.should.equal('foo');
					args.should.eql([ /,\)\(/, '))', [ '()' ], 42, true ]);
					return {};
				}
			};

			function Foo() {
				/**
				 * @validator foo(/,\)\(/, '))', [ '()' ], 42, true)
				 */
				this.foo = 'bar';
			}

			new leaf.Validator(Foo, factory);
			factoryChecked.should.equal(true);
		});

		it('with single line comment', function() {
			function Foo() {
				// /** @validator foo */
				this.foo = 'bar';
			}

			var validator = new leaf.Validator(Foo, factory);
			validator.properties.should.eql({ });
		});

		it('with doc comment in string', function() {
			var factory = {
				create: function() {
					throw new Error('factory.create() should not have been called');
				}
			};
			function Foo() {
				'/** @validator foo */'
				this.foo = 'bar';
			}

			var validator = new leaf.Validator(Foo, factory);
			validator.properties.should.eql({ });
		});
	});

	describe('factory', function() {
		it('should throw if validator does not exist', function() {
			(function() {
				new leaf.Factory({}).create('foo');
			}).should.throwError('Cannot create validator "foo"');
		});

		it('should create validator', function() {
			var map = {
				foo: function(arg1, arg2) {
					this.arg1 = arg1;
					this.arg2 = arg2;
				}
			};

			var validator = new leaf.Factory(map).create('foo', [ 'foo', 42 ]);
			should.exist(validator);
			validator.should.have.property('arg1', 'foo');
			validator.should.have.property('arg2', 42);
		});

		it('should use bundled validators as map if not given', function() {
			var factory = new leaf.Factory(),
				validators = require('../src/validators');

			Object.keys(validators).forEach(function(name) {
				factory.map.should.have.property(name);
			});
		});
	});
});
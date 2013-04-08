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

		it('should throw if default factory cannot create validator', function() {
			function Foo() {
				/** @validator baz */
				this.foo = 'bar';
			}

			(function() { new leaf.Validator(Foo); }).should.throwError('Cannot create validator "baz"');
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
});
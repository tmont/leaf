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
					return {
						arg1: arg1,
						arg2: arg2,
						validate: function() {

						},
						getErrorMessage: function() {

						}
					};
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

	describe('for entities', function() {
		function User() {
			/**
			 * @validator required
			 * @validator email
			 */
			this.email = '';

			/**
			 * @validator required
			 * @validator length(3, 30)
			 */
			this.username = '';

			/**
			 * @validator optional
			 * @validator values([ 'admin', 'mod', 'user' ])
			 */
			this.role = null;
		}

		it('should validate entity successfully', function(done) {
			var validator = new leaf.Validator(User),
				user = new User();

			user.email = 'foo@bar.com';
			user.username = 'tmont';
			user.role = 'admin';
			validator.validate(user, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should validate entity successfully without optional property', function(done) {
			var validator = new leaf.Validator(User),
				user = new User();

			user.email = 'foo@bar.com';
			user.username = 'tmont';
			user.role = null;
			validator.validate(user, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should validate entity and aggregate errors', function(done) {
			var validator = new leaf.Validator(User),
				user = new User();

			user.username = 'x';

			validator.validate(user, function(err) {
				should.exist(err);

				err.should.have.property('username');
				err.username.should.have.length(1);
				err.username[0].should.equal('Must be between 3 and 30 characters');

				err.should.have.property('email');
				err.email.should.have.length(1);
				err.email[0].should.equal('This field is required');
				done();
			});
		});

		it('should validate entity and aggregate all errors', function(done) {
			var validator = new leaf.Validator(User),
				user = new User();

			user.username = 'x';
			user.role = 'foo';

			validator.validate(user, true, function(err) {
				should.exist(err);
				err.should.have.property('role');
				err.role.should.have.length(1);
				err.role[0].should.equal('Must be "admin", "mod" or "user"');

				err.should.have.property('username');
				err.username.should.have.length(1);
				err.username[0].should.equal('Must be between 3 and 30 characters');

				err.should.have.property('email');
				err.email.should.have.length(2);
				err.email[0].should.equal('This field is required');
				err.email[1].should.equal('Must be a valid email address');
				done();
			});
		});
	});
});
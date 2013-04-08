var validators = require('../').validators,
	should = require('should');

describe('Validators', function() {
	describe('range', function() {
		it('should validate minimum', function(done) {
			var validator = validators.range(5);
			validator.validate(7, null, function(err) {
				should.not.exist(err);
				validator.validate(3, null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate maximum', function(done) {
			var validator = validators.range(null, 5);
			validator.validate(3, null, function(err) {
				should.not.exist(err);
				validator.validate(7, null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate minimum and maximum', function(done) {
			var validator = validators.range(3, 5);
			validator.validate(4, null, function(err) {
				should.not.exist(err);
				validator.validate(7, null, function(err) {
					err.should.equal(true);
					validator.validate(2, null, function(err) {
						err.should.equal(true);
						done();
					});
				});
			});
		});

		it('maximum should be inclusive', function(done) {
			var validator = validators.range(null, 5);
			validator.validate(5, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('minimum should be inclusive', function(done) {
			var validator = validators.range(5);
			validator.validate(5, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should allow floats', function(done) {
			var validator = validators.range(5);
			validator.validate(5.7, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should parse strings as numbers', function(done) {
			var validator = validators.range(5);
			validator.validate('123', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('unparseable strings are invalid', function(done) {
			var validator = validators.range('5');
			validator.validate('asdf', null, function(err) {
				err.should.equal(true);
				done();
			});
		});

		it('should get error message for minimum', function() {
			validators.range(5).getErrorMessage().should.equal('Must be greater than 5');
		});

		it('should get error message for maximum', function() {
			validators.range(null, 5).getErrorMessage().should.equal('Must be less than 5');
		});

		it('should get error message for minimum and maximum', function() {
			validators.range(3, 5).getErrorMessage().should.equal('Must be between 3 and 5');
		});
	});

	describe('length', function() {
		it('should validate minimum', function(done) {
			var validator = validators.length(5);
			validator.validate('foo bar', null, function(err) {
				should.not.exist(err);
				validator.validate('foo', null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate maximum', function(done) {
			var validator = validators.length(null, 5);
			validator.validate('foo', null, function(err) {
				should.not.exist(err);
				validator.validate('foo bar baz', null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate minimum and maximum', function(done) {
			var validator = validators.length(3, 5);
			validator.validate('food', null, function(err) {
				should.not.exist(err);
				validator.validate('foo bar baz', null, function(err) {
					err.should.equal(true);
					validator.validate('fu', null, function(err) {
						err.should.equal(true);
						done();
					});
				});
			});
		});

		it('maximum should be inclusive', function(done) {
			var validator = validators.length(null, 5);
			validator.validate('fooby', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('minimum should be inclusive', function(done) {
			var validator = validators.length(5);
			validator.validate('fooby', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should validate objects with "length" property', function(done) {
			var validator = validators.length(5);
			validator.validate({ length: 6 }, null, function(err) {
				should.not.exist(err);
				validator.validate([ 1, 2, 3, 4, 5, 6 ], null, function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('objects without "length" property are invalid', function(done) {
			var validator = validators.length(5);
			validator.validate({}, null, function(err) {
				err.should.equal(true);
				done();
			});
		});

		it('should get error message for minimum', function() {
			validators.length(5).getErrorMessage().should.equal('Must be longer than 5 characters');
		});

		it('should get error message for maximum', function() {
			validators.length(null, 5).getErrorMessage().should.equal('Must be shorter than 5 characters');
		});

		it('should get error message for minimum and maximum', function() {
			validators.length(3, 5).getErrorMessage().should.equal('Must be between 3 and 5 characters');
		});
	});

	describe('required', function() {
		it('should validate existence', function(done) {
			var validator = validators.required();
			validator.validate('foo', null, function(err) {
				should.not.exist(err);
				validator.validate(12, null, function(err) {
					should.not.exist(err);
					validator.validate({}, null, function(err) {
						should.not.exist(err);
						validator.validate([], null, function(err) {
							should.not.exist(err);
							validator.validate(true, null, function(err) {
								should.not.exist(err);
								done();
							});
						});
					});
				});
			});
		});

		it('should trim whitespace by default', function(done) {
			var validator = validators.required();
			validator.validate('foo', null, function(err) {
				should.not.exist(err);
				validator.validate(' \t\n\r', null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should trim whitespace', function(done) {
			var validator = validators.required(true);
			validator.validate('foo', null, function(err) {
				should.not.exist(err);
				validator.validate(' \t\n\r', null, function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('should get error message', function() {
			validators.required().getErrorMessage().should.equal('This field is required');
		});
	});

	describe('number', function() {
		it('should validate integer', function(done) {
			validators.number().validate(42, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should validate float', function(done) {
			validators.number().validate(42, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should parse string as number', function(done) {
			validators.number().validate('42', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should not validate things that are not numbers', function(done) {
			var validator = validators.number();
			validator.validate([], null, function(err) {
				err.should.equal(true);
				validator.validate({}, null, function(err) {
					err.should.equal(true);
					validator.validate(Infinity, null, function(err) {
						err.should.equal(true);
						validator.validate(-Infinity, null, function(err) {
							err.should.equal(true);
							validator.validate(null, null, function(err) {
								err.should.equal(true);
								done();
							});
						});
					});
				});
			});
		});

		it('should validate Infinity as a number if specified', function(done) {
			var validator = validators.number(true);
			validator.validate(Infinity, null, function(err) {
				should.not.exist(err);
				validator.validate(-Infinity, null, function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('should get error message', function() {
			validators.number().getErrorMessage().should.equal('Must be a number');
		});
	});

	describe('boolean', function() {
		it('should validate boolean', function(done) {
			validators.boolean().validate(true, null, function(err) {
				should.not.exist(err);
				validators.boolean().validate(false, null, function(err) {
					should.not.exist(err);

					//strict mode
					validators.boolean(true).validate(true, null, function(err) {
						should.not.exist(err);
						validators.boolean(true).validate(false, null, function(err) {
							should.not.exist(err);
							done();
						});
					});
				});
			});
		});

		it('should validate string "true" and "false", ignoring case', function(done) {
			validators.boolean().validate('true', null, function(err) {
				should.not.exist(err);
				validators.boolean().validate('TRUE', null, function(err) {
					should.not.exist(err);
					validators.boolean().validate('false', null, function(err) {
						should.not.exist(err);
						validators.boolean().validate('FALSE', null, function(err) {
							should.not.exist(err);
							done();
						});
					});
				});
			});
		});

		it('should validate number/string "0" and "1"', function(done) {
			validators.boolean().validate('0', null, function(err) {
				should.not.exist(err);
				validators.boolean().validate('1', null, function(err) {
					should.not.exist(err);
					validators.boolean().validate(0, null, function(err) {
						should.not.exist(err);
						validators.boolean().validate(1, null, function(err) {
							should.not.exist(err);
							validators.boolean().validate('asdf', null, function(err) {
								err.should.equal(true);
								validators.boolean().validate(100, null, function(err) {
									err.should.equal(true);
									done();
								});
							});
						});
					});
				});
			});
		});

		it('should not validate strings/numbers in strict mode', function(done) {
			var validator = validators.boolean(true);
			validator.validate('0', null, function(err) {
				err.should.equal(true);
				validator.validate('1', null, function(err) {
					err.should.equal(true);
					validator.validate(0, null, function(err) {
						err.should.equal(true);
						validator.validate(1, null, function(err) {
							err.should.equal(true);
							validator.validate('true', null, function(err) {
								err.should.equal(true);
								validator.validate('false', null, function(err) {
									err.should.equal(true);
									done();
								});
							});
						});
					});
				});
			});
		});

		it('should get error message', function() {
			validators.boolean().getErrorMessage().should.equal('Must be a boolean');
		});
	});

	describe('regex', function() {
		it('should validate', function(done) {
			validators.regex(/^foo.+$/).validate('foobar', null, function(err) {
				should.not.exist(err);
				validators.regex(/^foo.+$/).validate('barfoo', null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should get error message', function() {
			validators.regex(/foo/i).getErrorMessage().should.equal('Must match regular expression "/foo/i"');
		});
	});

	describe('email', function() {
		it('should validate normal email address', function(done) {
			validators.email().validate('foo@example.com', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should validate email address with goofy characters', function(done) {
			validators.email().validate('foo+!@#$%^&*&()~`-=+_/.,\\][}{\';":?>< bar@example.com', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should require a "@" and a "."', function(done) {
			validators.email().validate('foo.com', null, function(err) {
				err.should.equal(true);
				validators.email().validate('foo@example', null, function(err) {
					err.should.equal(true);
					validators.email().validate('@foo.com', null, function(err) {
						err.should.equal(true);
						done();
					});
				});
			});
		});

		it('should get error message', function() {
			validators.email().getErrorMessage().should.equal('Must be a valid email address');
		});
	});
});
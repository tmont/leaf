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
});
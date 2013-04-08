var validators = require('../').validators,
	should = require('should');

describe('Validators', function() {
	describe('length', function() {
		it('should validate minimum', function(done) {
			var validator = validators.length('5');
			validator.validate(7, null, function(err) {
				should.not.exist(err);
				validator.validate(3, null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate maximum', function(done) {
			var validator = validators.length(',5');
			validator.validate(3, null, function(err) {
				should.not.exist(err);
				validator.validate(7, null, function(err) {
					err.should.equal(true);
					done();
				});
			});
		});

		it('should validate minimum and maximum', function(done) {
			var validator = validators.length('3,5');
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
			var validator = validators.length(',5');
			validator.validate(5, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('minimum should be inclusive', function(done) {
			var validator = validators.length('5');
			validator.validate(5, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should allow floats', function(done) {
			var validator = validators.length('5');
			validator.validate(5.7, null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should parse strings as numbers', function(done) {
			var validator = validators.length('5');
			validator.validate('123', null, function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('unparseable strings are invalid', function(done) {
			var validator = validators.length('5');
			validator.validate('asdf', null, function(err) {
				err.should.equal(true);
				done();
			});
		});

		it('should get error message for minimum', function() {
			var validator = validators.length('5');
			validator.getErrorMessage().should.equal('Must be longer than 5 characters');
		});

		it('should get error message for maximum', function() {
			var validator = validators.length(',5');
			validator.getErrorMessage().should.equal('Must be shorter than 5 characters');
		});

		it('should get error message for minimum and maximum', function() {
			var validator = validators.length('3,5');
			validator.getErrorMessage().should.equal('Must be between 3 and 5 characters');
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
			var validator = validators.required('true');
			validator.validate('foo', null, function(err) {
				should.not.exist(err);
				validator.validate(' \t\n\r', null, function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('should get error message', function() {
			var validator = validators.required('true');
			validator.getErrorMessage().should.equal('This field is required');
		});
	});
});
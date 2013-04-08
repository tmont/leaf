function parseConstructor(ctor, factory) {
	var code = ctor.toString(),
		properties = {},
		index = code.indexOf('{') + 1,
		length = code.length,
		validators = [],
		scope = null,
		expectThis = false;

	while (index < length) {
		var c = code.charAt(index);
		index++;
		switch (c) {
			case '/':
				if (scope) {
					break;
				}

				if (code.charAt(index) === '*' && code.charAt(index + 1) === '*') {
					index += 2;
					var comment = code.substring(index, code.indexOf('*/', index));
					index += comment.length + 2;
					validators = [];
					comment.split('\n').forEach(function(line) {
						var match = /^[\s\*]*@validator\s+(\w+)(?:\((.*)\))?\s*$/.exec(line);
						if (!match) {
							return;
						}

						//example:
						/**
						 * @validator required
						 * @validator length(3, 5)
						 * @validator values([ 'foo', /foo,bar/, '[baz]' ])
						 */

						validators.push({ name: match[1], args: match[2] });
					});
					expectThis = true;
				} else if (code.charAt(index) === '/') {
					//single line comment: read to the end of the line
					index = code.indexOf('\n', index) + 1;
				}
				break;
			case 't':
				if (!expectThis) {
					break;
				}

				expectThis = false;
				var substring = code.substring(index - 1),
					match;
				if (match = /^this\.(\w+)/.exec(substring)) {
					properties[match[1]] = validators.map(function(data) {
						return factory.create(data.name, eval('[' + data.args + ']'));
					});
					index += match[0].length;
				}
				break;
			default:
				if (!/\s/.test(c)) {
					expectThis = false;
				}
				break;
		}
	}

	return properties;
}

function ValidatorFactory(map) {
	this.map = map || require('./validators');
}
ValidatorFactory.prototype = {
	create: function(name, args) {
		if (!this.map[name]) {
			throw new Error('Cannot create validator "' + name + '"');
		}

		return this.map[name].apply(null, args);
	}
};

function EntityValidator(ctor, factory) {
	this.properties = parseConstructor(ctor, factory || new ValidatorFactory());
}

EntityValidator.prototype = {
	validate: function(entity, doNotStopOnFail, callback) {
		var self = this,
			toValidate = Object.keys(entity),
			errors = null;

		if (typeof(doNotStopOnFail) === 'function') {
			callback = doNotStopOnFail;
			doNotStopOnFail = false;
		}

		(function validate(property) {
			 if (!property) {
				 //all done
				 process.nextTick(function() {
					 callback(errors);
				 });
				 return;
			 }

			self.validateProperty(entity, property, doNotStopOnFail, function(err) {
				if (err) {
					if (!errors) {
						errors = {};
					}

					errors[property] = err;
				}

				process.nextTick(function() {
					validate(toValidate.shift());
				});
			});
		})(toValidate.shift());
	},

	validateProperty: function(entity, property, doNotStopOnFail, callback) {
		var validators = this.properties[property],
			errors = [],
			value = entity[property];
		if (!validators || !validators.length) {
			callback();
			return;
		}

		(function validate(validator) {
			if (!validator) {
				//all done
				process.nextTick(function() {
					callback(errors.length ? errors : null)
				});
				return;
			}

			validator.validate(value, entity, function(err) {
				err && errors.push(validator.getErrorMessage());
				if (errors.length && !doNotStopOnFail) {
					process.nextTick(function() {
						callback(errors);
					});
					return;
				}

				process.nextTick(function() {
					validate(validators.shift());
				});
			});
		})(validators.shift());
	}
};

exports.Factory = ValidatorFactory;
exports.EntityValidator = EntityValidator;

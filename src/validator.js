function parseConstructor(ctor, factory) {
	var code = ctor.toString();
	var properties = {},
		index = 0,
		length = code.length;

	while (index < length) {

	}

	return properties;
}

function ValidatorFactory() {

}
ValidatorFactory.prototype = {
	create: function(name, arg) {

	}
};

function EntityValidator(ctor, factory) {
	factory = factory || new ValidatorFactory();
	this.properties = parseConstructor(ctor, factory);
}

EntityValidator.prototype = {
	validate: function(entity, callback) {
		var self = this;
		var toValidate = Object.keys(entity);
		var errors = [];
		(function validate(property) {
			 if (!property) {
				 //all done
				 process.nextTick(callback(errors.length ? errors : null));
				 return;
			 }

			self.validateProperty(entity, property, function(err) {
				err && errors.push(err);
				process.nextTick(function() {
					validate(toValidate.pop());
				});
			});
		})(toValidate.pop());
	},

	validateProperty: function(entity, property, callback) {
		var validator = this.properties[property];
		if (!validator) {
			callback();
			return;
		}

		validator.validate(entity[property], entity, callback);
	}
};



exports.Factory = ValidatorFactory;
exports.EntityValidator = EntityValidator;

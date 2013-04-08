var validators = {
	range: function(min, max) {
		min = parseFloat(min);
		max = parseFloat(max);

		if (isNaN(min)) {
			min = -Infinity;
		}
		if (isNaN(max)) {
			max = Infinity;
		}

		return {
			validate: function(value, context, callback) {
				value = parseFloat(value);
				var isValid = !isNaN(value) && value >= min && value <= max;
				callback(isValid ? null : true);
			},
			getErrorMessage: function() {
				var message = 'Must be ';
				if (min !== -Infinity && max !== Infinity) {
					message += 'between ' + min + ' and ' + max;
				} else if (min !== -Infinity) {
					message += 'greater than ' + min;
				} else {
					message += 'less than ' + max;
				}

				return message;
			}
		};
	},
	required: function(doNotTrimWhitespace) {
		return {
			validate: function(value, context, callback) {
				if (typeof(value) === 'string' && !doNotTrimWhitespace) {
					value = value.trim();
				}
				callback(!!value ? null : true);
			},
			getErrorMessage: function() {
				return 'This field is required';
			}
		};
	},
	length: function(min, max) {
		var length = validators.range(min, max);

		return {
			validate: function(value, context, callback) {
				if (typeof(value) === 'string' || (typeof(value) === 'object' && 'length' in value)) {
					length.validate(value.length, context, callback);
					return;
				}

				callback(true);
			},
			getErrorMessage: function() {
				return length.getErrorMessage()
					.replace('less', 'shorter')
					.replace('greater', 'longer') +
					' characters';
			}
		};
	},
	number: function(infinityIsANumber) {
		return {
			validate: function(value, context, callback) {
				value = parseFloat(value);
				var isValid = !isNaN(value) && (infinityIsANumber || (value !== -Infinity && value !== Infinity));
				callback(isValid ? null : true);
			},
			getErrorMessage: function() {
				return 'Must be a number';
			}
		};
	}
};

module.exports = validators;
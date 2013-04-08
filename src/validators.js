module.exports = {
	length: function(min, max) {
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
					message += 'longer than ' + min;
				} else {
					message += 'shorter than ' + max;
				}

				return message + ' characters';
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
	}
};
var validator = require('./src/validator');

exports.Validator = validator.EntityValidator;
exports.Factory = validator.Factory;
exports.validators = require('./src/validators');

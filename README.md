# leaf
[![Build Status](https://travis-ci.org/tmont/leaf.png)](https://travis-ci.org/tmont/leaf)

Leaf is a simple validation framework for validating models.
It parses doc comments out of a constructor function to identify
how to validate each property of an object.

## Installation
Install via NPM: `npm install leaf`

## Usage
This library is meant to be used to validate domain objects (i.e.
models). To ease the pain of configuration, it uses doc comments
in the constructor of your model to determine how to validate
its fields.

Example:

Say you wanted a user model with the following requirements:

1. `email` - must be present, and a valid email address
2. `username` - must be present, between 3 and 30 characters and consist of
   only letters, numbers and the underscore
3. `role` - must be exactly one of "admin", "mod" or "user"

You could represent all of these requirements with the following constructor:
```javascript
function User() {
	/**
	 * @validator required
	 * @validator email
	 */
	this.email = '';

	/**
	 * @validator required
	 * @validator length(3, 30)
	 * @validator regex(/^\w+$/)
	 */
	this.username = '';

	/**
	 * @validator values([ 'admin', 'mod', 'user' ])
	 */
	this.role = null;
}
```

And you could perform validation on it simply like this:
```javascript
var leaf = require('leaf'),
	userValidator = new leaf.Validator(User);

userValidator.validate(new User(), function(err) {
	if (err) {
		console.dir(err);
		return;
	}

	console.log('yay!');
});

// the error would be something like:
/*
{
	email: [ 'This field is required' ],
	username: [ 'This field is required' ],
	role: [ 'Must be one of "admin", "user" or "mod"' ]
}
*/
```

### Validators
There are a bunch of built-in validators that will cover most simple cases.
You can of course build your own.

Bundled validators:

* `length`: validates string length
	* `length(3)`: string length must be greater than or equal to 3
	* `length(null, 3)`: string length must be less than or equal to 3
	* `length(3, 5)`: string length must be between 3 and 5 (inclusive)
* `required`: validates that a value must exist. A value exists if it is truthy:
  the result of `!!value` is `true`
	* `required(true)`: does not trim whitespace
* `regex`: validates a string against a regular expression
	* `regex(/^\w{3,}$/)` - must consist of letters, numbers and underscore, and be at
	  least 3 characters long
* `range`: validates a number is within a given range; same signature as `length`
* `number`: validates that a value is a number (using `parseFloat()`)
* `boolean`: validates that a value is a boolean
	* `boolean`: `0`, `1`, `'true'`, `'false'`, `true` and `false` are all considered booleans
	  (case insensitive)
	* `boolean(true)`: only allows actual booleans: `true` and `false`
* `email`: validates that a string is an email address; this is merely a shorthand
  for `regex(/^.+@.+\..+$/)`
* `values`: validates that a value is one of many values
	* `values([ 'foo', 'bar', 'baz' ])`: validates if the value is `'foo'`, `'bar'` or `'baz'`

### Validator factory and custom validators
You can specify a factory object to the `Validator` constructor, which
instructs Leaf on how to create the validators. By default, uses a simple
map consisting of the bundled validators (specifically, the map is
`require('./src/validators')`).

If you want to change the map, to include your own validators for example,
you could do the following:

```javascript
var map = leaf.validators; //the default validators
map.evenInteger = function() {
	return {
		validate: function(value, context, callback) {
			value = parseInt(value);
			var isValid = !isNaN(value) && value % 2 === 0;
			callback(isValid ? null : true);
		},
		getErrorMessage: function() {
			return 'Must be an even integer';
		}
	};
};

function MyObject() {
	/** @validator evenInteger */
	this.integer = 0;
}

//create a custom validator factory, and inject it into
//the Validator constructor
var factory = new leaf.Factory(map);
var myObjectValidator = new leaf.Validator(MyObject, factory);
```

### Other options
By default, the validator will stop validating a property when
it reaches the first error. You can force it to continue validation
by passing `true` as the second argument to `validate()`:

```javascript
//stop on first error
userValidator.validate(new User(), function(err) {...});

//don't stop
userValidator.validate(new User(), true, function(err) {...});
```

## Development
```bash
git clone git@github.com:tmont/leaf.git
cd leaf
npm install
npm test
```
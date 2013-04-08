# leaf
[![Build Status](https://travis-ci.org/tmont/leaf.png)](https://travis-ci.org/tmont/leaf)

Leaf is a simple validation framework. Here's how you use it:

```javascript
var leaf = require('leaf');

var length3To5 = leaf.validators.length('3,5'),
	value = Math.random() * 10;
length3To5.validate(value, null, function(err) {
	if (err) {
		console.log(length3To5.getErrorMessage());
		return;
	}

	console.log(value + ' is valid!');
});
```

## Installation
Eventually, once I publish it, install via NPM: `npm install leaf`

## Usage
### Validators
There are a bunch of built-in validators that will cover most cases.
You can of course build your own. All of the validators take in a single
argument, which is a string. The reason for this will be covered later.

Bundled validators:

* `length`: validates string length
	* `length('3')`: string length must be greater than or equal to 3
	* `length(',3')`: string length must be less than or equal to 3
	* `length('3,5')`: string length must be between 3 and 5 (inclusive)
* `required`: validates that a value must exist. A value exists if it is truthy:
  the result of `!!value` is `true`
	* `required('true')`: does not trim whitespace

## Development
```bash
git clone git@github.com:tmont/leaf.git
cd leaf
npm install
npm test
```
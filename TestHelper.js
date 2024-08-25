"use strict";

class TestHelper {

	/**
	 * Return all methods part of the object
	 * @see https://stackoverflow.com/questions/30881632/es6-iterate-over-class-methods
	 * @return String[] method names of object
	 */
	static getInstanceMethodNames(obj) {
		return Object
			.getOwnPropertyNames (Object.getPrototypeOf(obj))
			.filter(name => (name !== 'constructor' && typeof obj[name] === 'function'));
	}

	/**
	 * Perform deep variable comparison
	 * Does a poor job comparing date objects
	 * @see https://stackoverflow.com/a/32922084
	 * @param x result
	 * @param y expected result
	 * @return bool	 
	 */
	static deepEqual(x, y) {
		if (y instanceof Date) {
			return TestHelper.equalDate(x, y);
		}

		const ok = Object.keys, tx = typeof x, ty = typeof y;
  		return x && y && tx === 'object' && tx === ty ? (
			ok(x).length === ok(y).length &&
      		ok(x).every(key => TestHelper.deepEqual(x[key], y[key]))) : (x === y);
	}

	/**
	 * Compare date objects, used for test assertions
	 * @param Date result
	 * @param Date expected
	 * @return bool	 
	 */
	static equalDate(result, expected) {
		return result instanceof Date && expected instanceof Date && result.getTime() === expected.getTime();
	} 
}

export default TestHelper;
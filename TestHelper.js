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

}

export default TestHelper;

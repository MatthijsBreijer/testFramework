"use strict";

import Expectation from './Expectation.js';

class Mock {
	// methods the original object can not override
	#methodsUsedByMock = [];

	// original object which we're mocking
	#originalObject;

	// exposed methods in object to mock
	#originalObjectMethods = [];

	// expectation objects per method
	#expectations = [];

	constructor(originalObject) {
		this.#methodsUsedByMock = TestHelper.getInstanceMethodNames(this);
		this.#originalObject = originalObject;
		this.#originalObjectMethods = TestHelper.getInstanceMethodNames(originalObject);

		// create list of available methods to set expectations on.
		for (let i=0;i<this.#originalObjectMethods.length;i++) {

			// we can only define method hooks for methods that do not exist within Mock
			if (this.#methodsUsedByMock.indexOf(this.#originalObjectMethods[i]) >= 0) {
				throw {
					message: 'trying to overwrite method when mocking. Mock.' + this.#originalObjectMethods[i], 
					originalObject: this.#originalObject
				};
			}
			
			this.createMethodHook(this.#originalObjectMethods[i]);
		}

	}

	createMethodHook(method) {
		const mockInstance = this;
		const expectations = this.#expectations;

		this[method] = function(...args) {
			for (let i=0;i<expectations.length;i++) {

				if (expectations[i].isPatternMatch(method, args)) {
					return expectations[i].evaluate(method, args);
				}

			}

			throw mockInstance.getOriginalClassName() + '.' + method + '() called with' + (args.length === 0 ? 'out' : '') + ' arguments but no expectations set for method';
		};
	}

	expects(method) {
		const expectation = new Expectation(this.#originalObject, method);
		this.#expectations.push(expectation);
		return expectation;
	}

	/**
	 * @param Object ...{method:method,times:times,returnvalue:returnvalue}
	 */
	expectsMulti(...paramObjects) {
		for (let i=0;i<paramObjects.length;i++) {
			const params = paramObjects[i];
			const expectation = new Expectation(this.#originalObject, method);
			this.#expectations.push(expectation);
		}
		return this;
	}

	assertExpectationsAreSatisfied() {
		for (let i=0;i<this.#expectations.length;i++) {
			if (!this.#expectations[i].isSatisfied()) {
				throw this.#expectations[i].getErrorMessage();
			}
		}
		return true;
	}

	getOriginalClassName() {
		return this.#originalObject.constructor.name;
	}
}

export default Mock;
"use strict";

class Expectation {
	// Method call expectations
	#originalObject;
	#method;
	#shouldCountTimes = false;
	#timesExpected;
	#timesCalled = 0;

	// Expected arguments, with a default match
	#expectedArguments = [];

	// Return values
	#shouldReturn = false;
	#returnValue;

	constructor(originalObject, method) {
		this.#originalObject = originalObject;
		this.#method = method;
	}

	times(amount) {
		this.#shouldCountTimes = true;
		this.#timesExpected = amount;
		return this;
	}

	withArguments(...args) {
		this.#expectedArguments = args;
		return this;
	}

	return(returnValue) {
		this.#shouldReturn = true;
		this.#returnValue = returnValue;
		return this;
	}

	returnOriginalBehavior() {
		this.#shouldReturn = true;
		this.#returnValue = this.#originalObject[this.#method](...this.#expectedArguments);
		return this;
	}

	/**
	 * @return bool true if evaluation is successful, otherwise false
	 * @throws Exception when timesExpected is exceeded
	 */
	evaluate(method, args) {
		// safety
		if (!this.isPatternMatch(method, args)) {
			throw 'Mock.evaluate() called without pattern match';
		}

		this.#timesCalled++;
		if (this.#shouldCountTimes && this.#timesCalled > this.#timesExpected) {
			throw this.getErrorMessage();
		}

		if (this.#shouldReturn) {
			return this.#returnValue;
		}
	}

	/**
	 * Does this expectation match a pattern?
	 * @return bool
	 */
	isPatternMatch(method, args) {
		// Wrong method
		if (method !== this.#method) {
			return false;
		}

		// We don't match with the count timesCalled here
		// so that we can throw exception on too many calls.

		// Arguments do not match
		if (TestHelper.deepEqual(args, this.expectedArguments)) {
			return false;
		}

		return true;
	}

	/**
	 * After evaluation of the expectations
	 */
	isSatisfied() {
		if (this.#shouldCountTimes) {
			return this.#timesExpected === this.#timesCalled;
		}
		return true;
	}

	/**
	 * If not satisfied, get the error 
	 */
	getErrorMessage() {
		return this.#originalObject.constructor.name + '.' + this.#method + '() called ' + this.#timesCalled + ' time(s), expected ' + this.#timesExpected;
	}
}

export default Expectation;
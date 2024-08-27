"use strict";

// TODO: rewrite to node's assert library
import Assert from 'assert';
import TestHelper from './TestHelper.js';
import Mock from './Mock.js';
import AssertionException from './AssertionException.js';

class TestClass {
	assertsMade = 0;
	mocks = [];
	failures = [];

	setUp() {}

	tearDown() {}

	assert(assertion, ...messages) {
		this.assertsMade++;

		if (!assertion) {
			if (messages.length == 0) {
				messages.push('Assertion failed.');
			}

			throw new AssertionException(messages.toString());
		}
	}

	/**
	 * @param function callback to isolate exception
	 * @param function|object evaluate to evaluate/assert content of exception
	 * 
	 */
	assertException(callback, evaluate) {
		this.assertsMade++;

		try {
			// exception must be thrown here or we will
			callback();
		}
		catch(e) {
			// An exception thrown, which we are expecting
			let exceptionIsEvaluated = false;

			// Do object match
			if (typeof evaluate === 'object') {
				for (const [key, value] of Object.entries(evaluate)) {
					this.assertObjectsMatch(e[key], evaluate[key]);
				}
				exceptionIsEvaluated = true;
			}

			// Allow for custom assertions on exception with callback
			if (typeof evaluate === 'function') {
				evaluate(e);
				exceptionIsEvaluated = true;
			}

			if (exceptionIsEvaluated) {
				return;
			}
		}

		this.assert(false, 'Expected exception to be thrown', callback);
	}


	isAsserted() {
		return this.assertsMade > 0;
	}

	reset() {
		this.assertsMade = 0;
		this.mocks = [];
	}

	/**
	 * Run all the test methods part of the TestClass
	 * Send all logs to browser console
	 */
	run() {
		// get all test methods starting with test
		process.stdout.write("\r\n\x1b[34m-------------------------------\r\n" + this.constructor.name + ": running tests\x1b[0m\r\n");
		const methods = TestHelper.getInstanceMethodNames(this);
		let testCounter = 0;
			
		for (let i=0;i<methods.length;i++) {

			// only run test methods
			if (methods[i].slice(0,4) === 'test') {
				let success = true;
				
				// shallow clone testClass to run each individual test in isolation
				// warning, this also copies this.assertsMade & this.mocks
				const test = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
				// reset all information regarding mocks & assertions so we start testing from scratch.
				test.reset();

				// set up
				try {
					test.setUp();
				}
				catch (e) {
					success = false;
					this.failures.push("\x1b[31m" + this.constructor.name + ".setUp(): caused an uncaught exception.\x1b[0m\r\n");
					this.failures.push(e.stack);
				}

				// run the test
				try {
					test[methods[i]]();
				}
				catch (e) {
					success = false;

					if (e instanceof AssertionException) {
						this.failures.push("\x1b[31m" + e.message.toString() + "\x1b[0m\r\n");
						this.failures.push(this.getErrorLocation(e));
					}
					else {
						this.failures.push("\x1b[31m" + this.constructor.name + '.' + methods[i] + "(): caused an uncaught exception. See next line in console.\x1b[0m\r\n");
						this.failures.push(e.stack);
					}
				}

				// after testing, check assertions on mocks are satisfied
				// if not, the error should be raised adequately
				// assertion on mocks is wrapped in testcase assertion to increase counter
				// otherwise tests only done by mocks will result in isAsserted returning false causing warnings
				for (let m=0;m<this.mocks.length;m++) {
					this.assert(this.mocks[m].assertExpectationsAreSatisfied());
				}

				// tear down
				try {
					test.tearDown();
				}
				catch (e) {
					success = false;
					this.failures.push("\x1b[31m" + this.constructor.name + ".tearDown(): caused an uncaught exception.\x1b[0m\r\n");
					this.failures.push(e.stack)
				}

				if (!test.isAsserted()) {
					process.stdout.write('\x1b[33mW\x1b[0m');
					this.failures.push("\x1b[33mWarning: " + this.constructor.name + '.' + methods[i] + "(): No assertions made.\x1b[0m\r\n");
				}
				else if (success) {
					process.stdout.write('.');
				}
				else {
					success = false;
					process.stdout.write('\x1b[31mF\x1b[0m');
				}

				testCounter++;
			}

		}

		if (testCounter === 0) {
			process.stdout.write("\x1b[33mWarning: " + this.constructor.name + ": No tests found.\x1b[0m\r\n");
		}

		process.stdout.write("\r\n\r\n");
		// all tests ran, display errors if any
		if (this.failures.length > 0) {
			process.stdout.write(this.failures.toString());
		}

		// successful if no failures
		return this.failures.length === 0;
	}

	/**
	 * Render a string to HTML
	 * @return NodeList
	 */
	toHtmlObject(string) {
		let div = document.createElement('div');
		div.innerHTML = string;
		return div.childNodes;
	}

	/**
	 * 
	 */
	mock(originalObj) {
		const mock = new Mock(originalObj);
		this.mocks.push(mock);
		return mock;
	}

	/**
	 * @param result
	 * @param expected
	 * @param args
	 */
	assertObjectsMatch(result, expected, ...args) {
		args = args.concat(['Expected:', expected, 'Result', result]);
		
		this.assertsMade++;
		Assert.deepEqual(result, expected);
	}

	getErrorLocation(offset = 0, exception = undefined) {
		if (typeof exception === 'undefined') {
			exception = new Error();
		}
		return exception.stack.split("\n").slice(1 + offset).join("\r\n");
	}

}

export default TestClass;

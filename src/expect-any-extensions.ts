import { expect as baseExpect } from "@playwright/test";

export const expectAny = baseExpect.extend({
	/**
	 * Asserts that the received value matches at least one of the provided possibilities.
	 *
	 * Supports comparison of:
	 * - Primitive values (strings, numbers, booleans)
	 * - Objects (using deep equality via JSON comparison)
	 * - Special values like NaN
	 *
	 * @param received - The value to check
	 * @param possibilities - One or more values to compare against
	 *
	 * @example
	 * // Primitive values
	 * await expectAny(status).toBeAnyOf(200, 201, 204);
	 * await expectAny(color).toBeAnyOf('red', 'green', 'blue');
	 *
	 * @example
	 * // Objects
	 * await expectAny(response).toBeAnyOf(
	 *   { status: 'success', code: 200 },
	 *   { status: 'created', code: 201 }
	 * );
	 *
	 * @example
	 * // Mixed types
	 * await expectAny(value).toBeAnyOf(null, undefined, 0, '');
	 */
	async toBeAnyOf(received: any, ...possibilities: any[]) {
		const assertionName = "toBeAnyOf";
		const pass = possibilities.some(possibility => {
			try {
				// Handle object comparison
				if (
					typeof possibility === "object" &&
					possibility !== null &&
					typeof received === "object" &&
					received !== null
				) {
					return JSON.stringify(possibility) === JSON.stringify(received);
				}
				// Handle primitive comparison including NaN
				if (Number.isNaN(possibility) && Number.isNaN(received)) {
					return true;
				}
				return possibility === received;
			} catch {
				return possibility === received;
			}
		});

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be any of the provided possibilities\n\n` +
					`Received: ${this.utils.printReceived(received)}\n` +
					`Possibilities: ${this.utils.printExpected(possibilities)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be one of the provided possibilities\n\n` +
					`Received: ${this.utils.printReceived(received)}\n` +
					`Possibilities: ${this.utils.printExpected(possibilities)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			expected: possibilities,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is either null or undefined.
	 *
	 * This is a convenient matcher for checking nullish values,
	 * which is common when dealing with optional properties or API responses.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Testing optional values
	 * await expectAny(user.middleName).toBeNullish();
	 * await expectAny(response.data).not.toBeNullish();
	 *
	 * @example
	 * // API response validation
	 * const config = await api.getConfig();
	 * await expectAny(config.optionalField).toBeNullish();
	 */
	async toBeNullish(received: any) {
		const assertionName = "toBeNullish";
		const pass = received === null || received === undefined;

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be nullish (null or undefined)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be nullish (null or undefined)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is an integer number.
	 *
	 * An integer is a whole number without decimal places.
	 * This uses Number.isInteger() internally, which returns false for
	 * NaN, Infinity, and non-number types.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid integers
	 * await expectAny(42).toBeInteger();
	 * await expectAny(0).toBeInteger();
	 * await expectAny(-100).toBeInteger();
	 *
	 * @example
	 * // Testing API responses
	 * const userCount = await page.locator('.user-count').textContent();
	 * await expectAny(Number(userCount)).toBeInteger();
	 *
	 * @example
	 * // Negative assertions
	 * await expectAny(3.14).not.toBeInteger();
	 * await expectAny('42').not.toBeInteger();
	 */
	async toBeInteger(received: any) {
		const assertionName = "toBeInteger";
		const pass = Number.isInteger(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an integer\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				return (
					hint +
					"\n\n" +
					`Expected value to be an integer\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a floating-point number (has decimal places).
	 *
	 * A float must be:
	 * - A number type
	 * - Not NaN
	 * - Not an integer
	 * - A finite value (not Infinity or -Infinity)
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid floats
	 * await expectAny(3.14).toBeFloat();
	 * await expectAny(0.5).toBeFloat();
	 * await expectAny(-2.718).toBeFloat();
	 *
	 * @example
	 * // Testing calculations
	 * const price = 19.99;
	 * const tax = price * 0.08;
	 * await expectAny(tax).toBeFloat();
	 *
	 * @example
	 * // Not floats
	 * await expectAny(42).not.toBeFloat(); // Integer
	 * await expectAny(NaN).not.toBeFloat(); // NaN
	 * await expectAny(Infinity).not.toBeFloat(); // Infinity
	 */
	async toBeFloat(received: any) {
		const assertionName = "toBeFloat";
		const pass =
			typeof received === "number" &&
			!Number.isNaN(received) &&
			!Number.isInteger(received) &&
			Number.isFinite(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be a float (number with decimal places)\n\n` +
					`Received: ${this.utils.printReceived(received)}`
				);
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				let reason = "";
				if (receivedType !== "number") {
					reason = ` (type is ${receivedType})`;
				} else if (Number.isNaN(received)) {
					reason = " (value is NaN)";
				} else if (!Number.isFinite(received)) {
					reason = " (value is Infinity)";
				} else if (Number.isInteger(received)) {
					reason = " (value is an integer)";
				}
				return (
					hint +
					"\n\n" +
					`Expected value to be a float (number with decimal places)\n\n` +
					`Received: ${this.utils.printReceived(received)}${reason}`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a primitive type.
	 *
	 * Primitive types in JavaScript are:
	 * - string
	 * - number
	 * - boolean
	 * - null
	 * - undefined
	 * - bigint
	 * - symbol
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid primitives
	 * await expectAny('hello').toBePrimitive();
	 * await expectAny(123).toBePrimitive();
	 * await expectAny(true).toBePrimitive();
	 * await expectAny(null).toBePrimitive();
	 * await expectAny(undefined).toBePrimitive();
	 * await expectAny(BigInt(9007199254740991)).toBePrimitive();
	 * await expectAny(Symbol('key')).toBePrimitive();
	 *
	 * @example
	 * // Not primitives
	 * await expectAny({}).not.toBePrimitive();
	 * await expectAny([]).not.toBePrimitive();
	 * await expectAny(new Date()).not.toBePrimitive();
	 *
	 * @example
	 * // Testing API responses
	 * const apiValue = response.data.value;
	 * await expectAny(apiValue).toBePrimitive();
	 */
	async toBePrimitive(received: any) {
		const assertionName = "toBePrimitive";
		const receivedType = typeof received;
		const pass =
			received === null ||
			receivedType === "undefined" ||
			receivedType === "boolean" ||
			receivedType === "number" ||
			receivedType === "string" ||
			receivedType === "bigint" ||
			receivedType === "symbol";

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to not be a primitive type\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			if (!pass && !this.isNot) {
				return (
					hint +
					"\n\n" +
					`Expected value to be a primitive type (string, number, boolean, null, undefined, bigint, or symbol)\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is an array.
	 *
	 * This uses Array.isArray() internally for accurate array detection,
	 * including arrays from different JavaScript contexts (e.g., iframes).
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid arrays
	 * await expectAny([]).toBeArray();
	 * await expectAny([1, 2, 3]).toBeArray();
	 * await expectAny(['a', 'b', 'c']).toBeArray();
	 *
	 * @example
	 * // Testing API responses
	 * const users = await api.getUsers();
	 * await expectAny(users).toBeArray();
	 *
	 * @example
	 * // Testing page data
	 * const items = await page.locator('.item').allTextContents();
	 * await expectAny(items).toBeArray();
	 *
	 * @example
	 * // Not arrays
	 * await expectAny('not array').not.toBeArray();
	 * await expectAny({ length: 3 }).not.toBeArray();
	 */
	async toBeArray(received: any) {
		const assertionName = "toBeArray";
		const pass = Array.isArray(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an array\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				return (
					hint +
					"\n\n" +
					`Expected value to be an array\n\n` +
					`Received: ${this.utils.printReceived(received)} (${receivedType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
	/**
	 * Asserts that the received value is a plain object.
	 *
	 * A plain object must be:
	 * - Of type 'object'
	 * - Not null
	 * - Not an array
	 *
	 * Note: This will match any object including instances of classes,
	 * Date objects, RegExp objects, etc.
	 *
	 * @param received - The value to check
	 *
	 * @example
	 * // Valid objects
	 * await expectAny({}).toBeObject();
	 * await expectAny({ name: 'John', age: 30 }).toBeObject();
	 * await expectAny(new Date()).toBeObject();
	 *
	 * @example
	 * // Testing API responses
	 * const user = await api.getUser(123);
	 * await expectAny(user).toBeObject();
	 * await expectAny(user.profile).toBeObject();
	 *
	 * @example
	 * // Testing configuration
	 * const config = JSON.parse(await fs.readFile('config.json'));
	 * await expectAny(config).toBeObject();
	 *
	 * @example
	 * // Not objects
	 * await expectAny([]).not.toBeObject(); // Arrays are excluded
	 * await expectAny(null).not.toBeObject(); // Null is excluded
	 * await expectAny('string').not.toBeObject();
	 */
	async toBeObject(received: any) {
		const assertionName = "toBeObject";
		const pass = typeof received === "object" && received !== null && !Array.isArray(received);

		const message = () => {
			const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
				isNot: this.isNot,
			});

			if (pass && this.isNot) {
				return `${hint}\n\nExpected value to not be an object\n\nReceived: ${this.utils.printReceived(received)}`;
			}

			if (!pass && !this.isNot) {
				const receivedType = typeof received;
				let actualType: string = receivedType;
				if (received === null) {
					actualType = "null";
				} else if (Array.isArray(received)) {
					actualType = "array";
				}
				return (
					hint +
					"\n\n" +
					`Expected value to be an object (plain object, not array or null)\n\n` +
					`Received: ${this.utils.printReceived(received)} (${actualType})`
				);
			}

			return hint;
		};

		return {
			message,
			pass,
			name: assertionName,
			actual: received,
		};
	},
});

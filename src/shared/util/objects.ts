/**
 * Shallow copy and merge one or more objects into a new object.
 */
import { negate } from './function';

export function copy(...sources: any[]) {
	return Object.assign.apply(undefined, [{}, ...sources]);
}

/**
 * Deep copy and merge one or more objects into a new object.
 * @returns : new object : immutable (does not modify the target)
 */
export function deepCopy(target: object, source: object) {
	let output = Object.assign({}, target);
	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach(key => {
			if (isObject(source[key])) {
				if (!(key in target)) Object.assign(output, { [key]: source[key] });
				else output[key] = deepCopy(target[key], source[key]);
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}

/**
 * Clones an object and deletes the keys specified in an array
 */
export function omit(obj: { [key: string]: any }, ...keysToDel: string[]): { [key: string]: any } {
	const clone = { ...obj };
	keysToDel.forEach(key => delete clone[key]);
	return clone;
}

/**
 * Clones and object and keeps the keys specified in an array
 *
 * */
export function pick<T, K extends keyof T>(obj: T, ...keysToKeep: K[]) {
	return keysToKeep.reduce((newObj, key) => ({ ...newObj, [<string>key]: obj[key] }), {}) as Pick<T, K>;
}

/**
 * Retrieve a value on an object
 * @param object The object to look in
 * @param path The path on the object get the value for, can look at nested values in the format of "foo.bar.x"
 */
export function get(object: any, path: string | Array<string | number>) {
	path = typeof path === 'string' ? path.split('.') : path;
	let obj = object;
	for (let i of path) {
		if (obj === undefined || obj === null) return undefined;
		obj = obj[i];
	}
	return obj;
}

export function transform<T, K extends keyof T, R>(o: T, transformer: (p: T[K], k: K) => R): { [K in keyof T]: R } {
	return Object.keys(o).reduce(
		(obj, key: string) => {
			const value = { [key as string]: transformer(o[key], key as K) };
			return { ...obj, ...value };
		},
		{} as any
	);
}

export enum JSTypes {
	Object = 'Object',
	Array = 'Array',
	String = 'String',
	Undefined = 'Undefined',
	Null = 'Null',
	Date = 'Date',
	Boolean = 'Boolean',
	Function = 'Function',
	Number = 'Number'
}

interface TypeMap {
	Object: object;
	Array: any[];
	String: string;
	Undefined: undefined;
	// 'Null': null;
	Date: Date;
	Boolean: boolean;
	Function: Function;
	Number: Number;
	[key: string]: any;
}

// Runtime
export function isOfType<T extends keyof TypeMap>(targetType: JSTypes, o): o is TypeMap[T] {
	return (Object.prototype.toString.call(o) === `[object ${targetType}]`)!;
}

export function isObject<T>(o: any): o is T {
	return isOfType(JSTypes.Object, <T>o);
}

export function isArray(o: any): o is any[] {
	return isOfType(JSTypes.Array, <any[]>o);
}

export function isString(o: any): o is string {
	return isOfType(JSTypes.String, <string>o);
}

export function toSelfOrEmptyArray(self: any[] | any) {
	return isArray(self) ? self : [];
}

export function isTrue(x: boolean): boolean {
	return x === true;
}

export const isFalse = negate(isTrue);

export function isEmptyObject(obj: {}): boolean {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

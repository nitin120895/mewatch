/**
 * The set of core-js es6 shims in use.
 * Comment out ones not required.
 */

const objectShim = [
	// 'core-js/es6/object', // all shims
	'core-js/fn/object/assign',
	'core-js/fn/object/is',
	'core-js/fn/object/set-prototype-of',
	// 'core-js/fn/object/get-prototype-of',
	// 'core-js/fn/object/create',
	'core-js/fn/object/define-property',
	// 'core-js/fn/object/define-properties',
	// 'core-js/fn/object/get-own-property-descriptor',
	'core-js/fn/object/keys',
	// 'core-js/fn/object/get-own-property-names',
	'core-js/fn/object/freeze',
	'core-js/fn/object/seal',
	// 'core-js/fn/object/prevent-extensions',
	'core-js/fn/object/is-frozen',
	'core-js/fn/object/is-sealed',
	// 'core-js/fn/object/is-extensible',
	'core-js/fn/object/values',
	'core-js/fn/object/entries'
];

const symbolShim = ['core-js/fn/symbol/index'];

const funcShim = [
	// 'core-js/es6/function', // all shims
	'core-js/fn/function/name',
	// 'core-js/fn/function/has-instance',
	'core-js/fn/function/bind'
];

const arrayShim = [
	'core-js/es6/array', // all shims
	'core-js/fn/array/includes'
	// 'core-js/fn/array/of',
	// 'core-js/fn/array/is-array',
	// 'core-js/fn/array/iterator',
	// 'core-js/fn/array/copy-within',
	// 'core-js/fn/array/fill',
	// 'core-js/fn/array/find',
	// 'core-js/fn/array/find-index',
	// 'core-js/fn/array/values',
	// 'core-js/fn/array/keys',
	// 'core-js/fn/array/entries',
	// 'core-js/fn/array/slice',
	// 'core-js/fn/array/join',
	// 'core-js/fn/array/index-of',
	// 'core-js/fn/array/last-index-of',
	// 'core-js/fn/array/every',
	// 'core-js/fn/array/some',
	// 'core-js/fn/array/for-each',
	// 'core-js/fn/array/map',
	// 'core-js/fn/array/filter',
	// 'core-js/fn/array/reduce',
	// 'core-js/fn/array/reduce-right',
	// 'core-js/fn/array/sort'
];

const stringShim = [
	// 'core-js/es6/string', // all shims
	// 'core-js/fn/string/from-code-point',
	// 'core-js/fn/string/raw',
	// 'core-js/fn/string/includes',
	'core-js/fn/string/starts-with',
	'core-js/fn/string/ends-with',
	'core-js/fn/string/repeat',
	// 'core-js/fn/string/code-point-at',
	'core-js/fn/string/trim',
	'core-js/fn/string/pad-start',
	// 'core-js/fn/string/anchor',
	// 'core-js/fn/string/big',
	// 'core-js/fn/string/blink',
	// 'core-js/fn/string/bold',
	// 'core-js/fn/string/fixed',
	// 'core-js/fn/string/fontcolor',
	// 'core-js/fn/string/fontsize',
	// 'core-js/fn/string/italics',
	// 'core-js/fn/string/link',
	// 'core-js/fn/string/small',
	// 'core-js/fn/string/strike',
	// 'core-js/fn/string/sub',
	// 'core-js/fn/string/sup',
	'core-js/fn/string/iterator'
];

const regexShim = [
	// 'core-js/es6/regexp', // all shims
	'core-js/fn/regexp/constructor',
	// 'core-js/fn/regexp/flags',
	// 'core-js/fn/regexp/to-string',
	'core-js/fn/regexp/match',
	'core-js/fn/regexp/replace',
	'core-js/fn/regexp/search',
	'core-js/fn/regexp/split'
];

const numberShim = [
	// 'core-js/es6/number', // all shims
	'core-js/fn/number/constructor',
	'core-js/fn/number/is-finite',
	'core-js/fn/number/is-nan',
	'core-js/fn/number/is-integer',
	// 'core-js/fn/number/is-safe-integer',
	'core-js/fn/number/parse-float',
	'core-js/fn/number/parse-int',
	// 'core-js/fn/number/epsilon',
	// 'core-js/fn/number/max-safe-integer',
	// 'core-js/fn/number/min-safe-integer',
	'core-js/fn/number/to-fixed',
	'core-js/fn/number/to-precision',
	'core-js/fn/parse-float',
	'core-js/fn/parse-int'
];

const promiseShim = [
	// 'core-js/es6/promise',
	'core-js/fn/promise'
];

const dateShim = [
	// 'core-js/es6/date', // all shims
	'core-js/fn/date/to-string',
	'core-js/fn/date/now',
	'core-js/fn/date/to-iso-string',
	'core-js/fn/date/to-json'
	// 'core-js/fn/date/to-primitive'
];

const mapShim = [
	'core-js/fn/map'
	// 'core-js/fn/weak-map'
];

const setShim = [
	'core-js/fn/set'
	// 'core-js/fn/weak-set'
];

module.exports = [
	...objectShim,
	...symbolShim,
	...funcShim,
	...arrayShim,
	...stringShim,
	...regexShim,
	...numberShim,
	...promiseShim,
	...dateShim,
	...mapShim,
	...setShim
];

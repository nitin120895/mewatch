import * as React from 'react';
import DelIcon from './DelIcon';
import SpaceIcon from './SpaceIcon';

export const KEY_ABC = 'KEY_ABC';
export const KEY_SHIFT = 'KEY_SHIFT';
export const KEY_NUMERIC = 'KEY_NUMERIC';
export const KEY_ALPHA = 'KEY_ALPHA';
export const KEY_CLEAR = 'KEY_CLEAR';
export const KEY_DEL = 'KEY_DEL';
export const KEY_SPACE = 'KEY_SPACE';
export const KEY_PUNC = 'KEY_PUNC';

export function getKeyValue(key: string) {
	switch (key) {
		case KEY_ABC:
			return 'ABC';
		case KEY_SHIFT:
			return '';
		case KEY_NUMERIC:
			return '123';
		case KEY_ALPHA:
			return 'abc';
		case KEY_CLEAR:
			return '';
		case KEY_DEL:
			return <DelIcon />;
		case KEY_SPACE:
			return <SpaceIcon />;
		case KEY_PUNC:
			return '!?#';

		default:
			return key;
	}
}

export enum KeyboardType {
	Alphanumeric,
	Numeric,
	Punctuation
}

export type KeyboardMapKey = string;

export type KeyboardMap = {
	type: KeyboardType;
	primaryLayout?: Array<KeyboardMapKey>;
	secondaryLayout?: Array<KeyboardMapKey>;
	special?: Array<KeyboardMapKey>;
	specialToggled?: Array<KeyboardMapKey>;
	suffix?: Array<KeyboardMapKey>;
	actions?: Array<KeyboardMapKey>;
	secondaryNumericLayout?: Array<KeyboardMapKey>;
};

export const keyboardPrimaryLayout: Array<KeyboardMapKey> = [
	KEY_NUMERIC,
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	KEY_DEL,
	KEY_PUNC,
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	KEY_SPACE
];
export const keyboardPunctuationLayout: Array<KeyboardMapKey> = [
	KEY_ABC,
	'!',
	'@',
	'#',
	'$',
	'%',
	'(',
	')',
	'-',
	'_',
	'=',
	'+',
	'\\',
	KEY_DEL,
	KEY_NUMERIC,
	';',
	':',
	'"',
	'*',
	'/',
	'.',
	'[',
	']',
	'{',
	'}',
	"'",
	',',
	KEY_SPACE
];
export const keyboardNumericLayout: Array<KeyboardMapKey> = [
	KEY_ABC,
	KEY_PUNC,
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	KEY_DEL
];

export const keyboardMaps: Array<KeyboardMap> = [
	{
		type: KeyboardType.Alphanumeric,
		primaryLayout: keyboardPrimaryLayout
	},
	{
		type: KeyboardType.Numeric,
		primaryLayout: keyboardNumericLayout
	},
	{
		type: KeyboardType.Punctuation,
		primaryLayout: keyboardPunctuationLayout
	}
];

export const getFocusableMap = (type: KeyboardType) => {
	const getSingleLineFocusableMap = (totalCnt: number) => {
		const map = {};
		let left,
			right,
			up = -1,
			down = -1;

		for (let curIndex = 0; curIndex < totalCnt; curIndex++) {
			left = curIndex - 1;
			right = curIndex + 1;

			if (curIndex === 0) {
				left = totalCnt - 1;
			} else if (curIndex === totalCnt - 1) {
				right = 0;
			}

			map[curIndex] = {
				left: left,
				right: right,
				up: up,
				down: down
			};
		}

		return map;
	};

	const getMultiLineFocusableMap = (totalCnt: number, lineCnt: number) => {
		const map = {};

		if (lineCnt === 1) {
			return getSingleLineFocusableMap(totalCnt);
		}

		const itemsPerLine = totalCnt / lineCnt;

		for (let curIndex = 0; curIndex < totalCnt; curIndex++) {
			let left, right, up, down;
			let curLine = Math.floor(curIndex / itemsPerLine);

			left = ((curIndex - 1) % itemsPerLine) + curLine * itemsPerLine;
			right = ((curIndex + 1) % itemsPerLine) + curLine * itemsPerLine;

			up = curIndex - itemsPerLine;
			down = curIndex + itemsPerLine;

			if (up < 0) up = -1;
			if (down >= totalCnt) down = -1;
			if (left < 0) left = itemsPerLine - 1;

			map[curIndex] = {
				left: left,
				right: right,
				up: up,
				down: down
			};
		}

		return map;
	};

	switch (type) {
		case KeyboardType.Alphanumeric:
			return getMultiLineFocusableMap(keyboardPrimaryLayout.length, 2);

		case KeyboardType.Numeric:
			return getMultiLineFocusableMap(keyboardNumericLayout.length, 1);

		case KeyboardType.Punctuation:
			return getMultiLineFocusableMap(keyboardPunctuationLayout.length, 2);

		default:
			return [];
	}
};

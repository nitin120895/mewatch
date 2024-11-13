import * as React from 'react';
import TextInput, { TextInputProps, TextInputState } from './TextInput';

import './NumberInput.scss';

export const DIGITS_ONLY = /^\d$/;

interface NumberInputProps extends TextInputProps {
	regex?: RegExp;
}

/**
 * Number Input
 *
 * By default an input of type number allows integers, full stop (for decimal places), and hyphens (-).
 * If you wish to change the allowed characters provide a regex prop value. Provided undefined will
 * allow the above scenario, however the defaultProp is capped to integers only.
 */
export default class NumberInput extends React.Component<NumberInputProps, TextInputState> {
	static defaultProps = {
		regex: DIGITS_ONLY
	};

	private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const key = e.key;
		const isBackspace = key === 'Backspace';
		const { regex } = this.props;

		if (!!regex && !regex.test(key)) {
			if (!isBackspace && key !== 'Tab' && key !== 'Shift') {
				e.preventDefault();
			}
			if (!isBackspace) {
				return;
			}
		}
	};

	render() {
		// tslint:disable:no-unused-variable
		const { ref, regex, ...rest } = this.props;
		// tslint:enable
		return <TextInput {...rest} type="number" onKeyDown={this.onKeyDown} />;
	}
}

import * as React from 'react';
import { findDOMNode } from 'react-dom';
import DigitInput from 'ref/responsive/component/input/DigitInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { KEY_CODE } from 'shared/util/keycodes';
import { isIOS } from 'shared/util/browser';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import 'ref/responsive/component/input/PinInput.scss';

interface PinInputProps {
	digits?: number[];
	pinLength?: number;
	onChange: (digits: number[]) => void;
	onFocus?: (e) => void;
	onKeyDown?: (e) => void;
	className?: string;
	label?: string;
	dark?: boolean;
	error?: string;
	focusOnUpdate?: boolean;
	required?: boolean;
	disabled?: boolean;
}

interface PinInputState {
	revealed?: boolean;
	digits?: number[];
}

const bem = new Bem('pin-group');
const PIN_PLACE_HOLDER = '●';

function getValue(value: string) {
	const intValue = parseInt(value, 10);
	return intValue || (intValue === 0 || value === PIN_PLACE_HOLDER) ? intValue : undefined;
}

export default class PinInput extends React.Component<PinInputProps, PinInputState> {
	static defaultProps = {
		digits: [],
		pinLength: 4,
		focus: false,
		required: false,
		disabled: false
	};
	state: PinInputState = {
		revealed: false,
		digits: this.props.digits
	};

	private elements: HTMLInputElement[] = [];
	private ios: boolean;
	private focusChangedByRemove: boolean;

	componentDidMount() {
		this.ios = isIOS();
		this.focusElement(0);
	}

	componentWillReceiveProps(nextProps: PinInputProps) {
		const { digits } = this.props;
		if (digits !== nextProps.digits) this.setState({ digits: nextProps.digits });
	}

	componentDidUpdate(prevProps) {
		const { focusOnUpdate } = this.props;
		if (focusOnUpdate !== prevProps.focusOnUpdate && this.elements.length > 0 && focusOnUpdate) {
			// If we're in a FocusCaptureGroup then there's a chance that we may disrupt its
			// capturing of the previous active element. To avoid this we delay the auto-focus.
			this.focusElement(0);
		}
	}

	focusElement(index: number) {
		// If we're in a FocusCaptureGroup then there's a chance that we may disrupt its
		// capturing of the previous active element. To avoid this we delay the auto-focus.
		this.elements && this.elements[index] && window.requestAnimationFrame(() => this.elements[index].focus());
	}

	private onKeyDown = (e, index: number) => {
		const value = getValue(e.target.value);
		const { pinLength, onKeyDown } = this.props;

		this.focusChangedByRemove = false;
		// Focus previous input when deleting value in current input
		if (index > 0 && e.keyCode === KEY_CODE.BACKSPACE && value === undefined) {
			this.focusChangedByRemove = true;
			this.elements[index - 1].focus();
		}

		if (index > 0 && e.keyCode === KEY_CODE.LEFT) {
			e.preventDefault();
			this.elements[index - 1].focus();
		}

		if (index === 0 && e.keyCode === KEY_CODE.LEFT) {
			e.preventDefault();
			this.selectInput(index);
		}

		if (index === pinLength - 1 && e.keyCode === KEY_CODE.RIGHT) {
			e.preventDefault();
			this.selectInput(index);
		}

		if (index < pinLength - 1 && e.keyCode === KEY_CODE.RIGHT) {
			e.preventDefault();
			this.elements[index + 1].focus();
		}
		if (onKeyDown) onKeyDown(e);
	};

	private onInput = (e, index: number) => {
		const value = getValue(e.target.value);
		const { pinLength, onChange } = this.props;
		const digits = [...this.state.digits];

		if (!(Number.isNaN(value) && index === pinLength - 1)) {
			digits[index] = !this.focusChangedByRemove ? value : undefined;
		}

		if (value !== undefined && !Number.isNaN(value) && !this.focusChangedByRemove && index < pinLength - 1) {
			this.elements[index + 1].focus();
		}
		onChange(digits);
	};

	private selectInput(index: number) {
		if (!this.elements[index].value) return false;
		if (this.ios) {
			setTimeout(() => this.elements[index].setSelectionRange(0, 1), 1);
		} else {
			this.elements[index].setSelectionRange(0, 1);
		}
	}

	private onFocus = (e, index: number) => {
		const { onFocus } = this.props;
		if (this.elements[index] !== undefined) this.selectInput(index);
		if (onFocus) onFocus(e);
	};

	render() {
		const { label, className, dark, error } = this.props;
		const pinError = !!error;
		return (
			<div className={cx(bem.b({ dark }), className)}>
				<IntlFormatter className={bem.e('label', { error: pinError })}>{label}</IntlFormatter>
				<div>{this.renderItems()}</div>
				<IntlFormatter elementType="p" className={bem.e('error', { visible: pinError })} aria-hidden={pinError}>
					{error}
				</IntlFormatter>
			</div>
		);
	}

	private renderItems() {
		const { pinLength, digits, required, error, disabled, dark } = this.props;
		const jsx = [];
		for (let index = 0; index < pinLength; index++) {
			let value;
			if (!this.state.revealed) value = (digits && digits[index]) !== undefined ? PIN_PLACE_HOLDER : '';
			else value = digits[index] || digits[index] === 0 ? digits[index] : '';
			jsx.push(
				<DigitInput
					index={index}
					error={!!error}
					required={required}
					onInputRef={node => (this.elements[index] = findDOMNode(node))}
					key={`pin-${index}`}
					value={value}
					onKeyDown={this.onKeyDown}
					onInput={this.onInput}
					onFocus={this.onFocus}
					onClick={this.onFocus}
					name={`int${index}`}
					disabled={disabled}
					dark={dark}
				/>
			);
		}
		return jsx;
	}
}

import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { noop } from 'shared/util/function';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import * as cx from 'classnames';
import { MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import { formDisplayState } from '../../../pageEntry/account/ssoValidationUtil';
import { InputTypes } from 'toggle/responsive/util/pinUtil';

import './PinCodeInput.scss';

const bem = new Bem('pin');
type Direction = 'left' | 'right';

interface Props {
	name?: string;
	className?: string;
	displayState?: form.DisplayState;
	disabled?: boolean;
	message?: string | React.ReactElement<any>;
	required?: boolean;
	onChange?: (e: any) => void;
	initialValue?: string;
	onFocus?: () => void;
	onBlur?: () => void;
	label?: string;
	fromOTP?: boolean;
	showTogglePin?: boolean;
	validateOnBlur?: boolean;
}

interface State {
	pin: string[];
	errorEmpty: boolean;
	errorNotEnoughNumbers: boolean;
	isVisible: boolean;
	focused: boolean;
}

export default class PinCodeInput extends React.Component<Props, State> {
	private onlyDigitRegexp: RegExp = /\d/;
	private inputsRefs: HTMLElement[] = [];

	static defaultProps = {
		onFocus: noop,
		onBlur: noop,
		showTogglePin: false,
		validateOnBlur: true
	};

	constructor(props) {
		super(props);
		const { initialValue } = props;

		this.state = {
			pin: this.getInitialValue(initialValue),
			errorEmpty: false,
			errorNotEnoughNumbers: false,
			isVisible: false,
			focused: false
		};
	}

	private getInitialValue = initialValue => {
		const emptyArray = Array(MIN_SECURE_STRING_LENGTH).fill('');
		if (!initialValue) return emptyArray;

		initialValue = initialValue.split('');
		const length = initialValue.length;

		if (length < MIN_SECURE_STRING_LENGTH) return emptyArray;
		if (length > MIN_SECURE_STRING_LENGTH) return initialValue.splice(0, MIN_SECURE_STRING_LENGTH);
		else return initialValue;
	};

	private onPinFocus = e => {
		this.setState(
			{
				errorEmpty: false,
				errorNotEnoughNumbers: false,
				focused: true
			},
			this.props.onFocus
		);
	};

	/*
	private getHiddenPinType(): InputTypes {
		return isMobile() ? InputTypes.TEL : InputTypes.PASSWORD;
	}

	private getVisiblePinType(): InputTypes {
		return InputTypes.TEL;
	}
	*/

	private isVisible(): boolean {
		return this.state.isVisible;
	}

	private onPinBlur = e => {
		const { validateOnBlur, onBlur } = this.props;
		const pin = this.state.pin.join('');
		if (!validateOnBlur) return;

		this.setState(
			{
				errorEmpty: !Boolean(pin.length),
				errorNotEnoughNumbers: Boolean(pin.length && pin.length !== MIN_SECURE_STRING_LENGTH),
				focused: false
			},
			onBlur
		);
	};

	private moveFocus = (index: number, direction?: Direction) => {
		let validIndex = index;

		if (direction === 'right')
			validIndex = index < MIN_SECURE_STRING_LENGTH - 1 ? index + 1 : MIN_SECURE_STRING_LENGTH - 1;
		if (direction === 'left') validIndex = index >= 1 ? index - 1 : 0;

		this.inputsRefs[validIndex].focus();
	};

	private updatePin = pin => {
		const { name, onChange } = this.props;
		const fakeEvent = {
			target: {
				name,
				value: pin.join('')
			}
		};
		this.setState({ pin }, () => {
			onChange(fakeEvent);
		});
	};

	private onDigitKeyDown = (index: number) => e => {
		const { key } = e;
		const { pin } = this.state;
		const matchRange = /[0-9]/;

		switch (key) {
			case 'Backspace':
				pin[index] = '';
				this.moveFocus(index, 'left');
				break;
			case 'Delete':
				pin.splice(index, 1, '');
				break;
			case 'ArrowLeft':
				this.moveFocus(index, 'left');
				return;
			case 'ArrowRight':
				this.moveFocus(index, 'right');
				return;
			default:
				break;
		}

		if (key.match(matchRange)) {
			pin.splice(index, 1, '');
		}

		this.updatePin(pin);
	};

	private validatePin = () => {
		const { pin, focused } = this.state;
		const result = { displayState: formDisplayState.DEFAULT };

		if (!pin || focused) return result;
		const isValid = pin && pin.length === MIN_SECURE_STRING_LENGTH && !pin.includes('');
		result.displayState = isValid ? formDisplayState.SUCCESS : formDisplayState.ERROR;

		return result;
	};

	private onDigitChange = (index: number) => e => {
		const { value } = e.target;
		const { pin } = this.state;

		if (value && this.onlyDigitRegexp.test(value)) {
			pin[index] = value;
			this.moveFocus(index, 'right');
		}

		this.updatePin(pin);
	};

	private togglePin = () => {
		this.setState((prevState: State) => ({
			isVisible: !prevState.isVisible
		}));
	};

	private isSuccess(): boolean {
		const { fromOTP, displayState } = this.props;
		if (fromOTP) {
			return displayState === formDisplayState.SUCCESS;
		}
		return this.validatePin().displayState === formDisplayState.SUCCESS;
	}

	render() {
		const { className, message, label, disabled, displayState, showTogglePin } = this.props;
		const { errorEmpty, errorNotEnoughNumbers, focused } = this.state;
		const error = displayState === formDisplayState.ERROR || errorEmpty || errorNotEnoughNumbers;
		const success = !error && this.isSuccess();

		return (
			<div className={cx(className, bem.e('pin-input', { error, disabled }, { focused }, { success }))}>
				{label && <IntlFormatter className={bem.e('label')}>{label}</IntlFormatter>}
				<div className={bem.e('inputs')}>
					{this.renderInputs(error)}
					{error && <div className={bem.e('exclamation')}>{'!'}</div>}
					<TickIcon width={20} height={18} />
					{showTogglePin && (
						<IntlFormatter className={bem.e('toggle-pin')} onClick={this.togglePin}>
							{this.isVisible() ? '@{pin_reset_hide_label}' : '@{pin_reset_show_label}'}
						</IntlFormatter>
					)}
				</div>

				<IntlFormatter tagName="div" className={bem.e('error-message')}>
					{error && !errorEmpty && !errorNotEnoughNumbers && message}
					{errorEmpty && '@{form_register_required_pin_error_message}'}
					{errorNotEnoughNumbers && '@{form_register_not_enough_numbers_pin_error_message}'}
				</IntlFormatter>
			</div>
		);
	}

	private onReference = (index: number) => input => {
		this.inputsRefs[index] = input;
	};

	private onPaste = event => {
		const clipboardData = event.clipboardData || (window as any).clipboardData;
		const code = clipboardData.getData('text');

		if (code.length === MIN_SECURE_STRING_LENGTH && /^\d+$/.test(code)) {
			this.updatePin(code.split(''));
			this.inputsRefs[MIN_SECURE_STRING_LENGTH - 1].focus();
		}

		event.preventDefault();
	};

	private renderInputs(error: boolean) {
		const { disabled, required } = this.props;
		const { pin } = this.state;
		const inputs = [];

		const classes = bem.e('input', { security: !this.isVisible() });

		for (let i = 0; i < MIN_SECURE_STRING_LENGTH; i++) {
			inputs.push(
				<input
					key={i}
					type={this.isVisible() ? InputTypes.TEXT : InputTypes.PASSWORD}
					inputMode={InputTypes.TEL}
					ref={this.onReference(i)}
					className={classes}
					onKeyDown={this.onDigitKeyDown(i)}
					onChange={this.onDigitChange(i)}
					value={pin[i]}
					onFocus={this.onPinFocus}
					onBlur={this.onPinBlur}
					onPaste={this.onPaste}
					maxLength={1}
					autoComplete="off"
					disabled={disabled}
					required={required}
				/>
			);
		}
		return inputs;
	}
}

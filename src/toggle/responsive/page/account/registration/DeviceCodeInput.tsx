import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { onlyAlphanumeric } from '../../../pageEntry/account/ssoValidationUtil';

import './DeviceCodeInput.scss';

const bem = new Bem('code');
type Direction = 'left' | 'right';
const LENGTH = 5;

interface Props {
	name?: string;
	className?: string;
	displayState?: form.DisplayState;
	disabled?: boolean;
	message?: string | React.ReactElement<any>;
	required?: boolean;
	onChange?: (e: any) => void;
	initialValue?: string;
	isValid: (isValid: boolean) => void;
	setTouched: boolean;
}

interface State {
	code: string[];
	errorEmpty: boolean;
	errorNotEnoughNumbers: boolean;
}

export default class DeviceCodeInput extends React.Component<Props, State> {
	private inputsRefs: HTMLElement[] = [];

	state = {
		code: Array(LENGTH).fill(''),
		errorEmpty: false,
		errorNotEnoughNumbers: false
	};

	componentDidMount() {
		const { initialValue } = this.props;
		const code = this.getInitialValue(initialValue);
		if (code) {
			this.setState({ code });
			this.updateCode(code);
			this.onCodeBlur(code);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!this.props.setTouched && nextProps.setTouched) this.onCodeBlur();
	}

	private getInitialValue = initialValue => {
		if (!initialValue || !onlyAlphanumeric.test(initialValue)) return false;

		initialValue = initialValue.split('');
		const length = initialValue.length;

		if (length < LENGTH) return false;
		if (length > LENGTH) return initialValue.splice(0, LENGTH);
		else return initialValue;
	};

	private onCodeFocus = () => {
		this.setState({
			errorEmpty: false,
			errorNotEnoughNumbers: false
		});
	};

	private onCodeBlur = (initialCode?) => {
		const code = initialCode && initialCode.length ? initialCode.join('') : this.state.code.join('');
		const errorEmpty = !code.length;
		const errorNotEnoughNumbers = code.length && code.length !== LENGTH;
		this.props.isValid(!errorEmpty && !errorNotEnoughNumbers);
		this.setState({
			errorEmpty,
			errorNotEnoughNumbers
		});
	};

	private moveFocus = (index: number, direction?: Direction) => {
		let validIndex = index;

		if (direction === 'right') validIndex = index < LENGTH - 1 ? index + 1 : LENGTH - 1;
		if (direction === 'left') validIndex = index >= 1 ? index - 1 : 0;

		this.inputsRefs[validIndex].focus();
	};

	private updateCode = code => {
		const { name, onChange } = this.props;
		const fakeEvent = {
			target: {
				name,
				value: code.join('')
			}
		};
		this.setState({ code }, () => {
			onChange(fakeEvent);
		});
	};

	private onDigitKeyDown = (index: number) => e => {
		const { key } = e;
		const { code } = this.state;

		switch (key) {
			case 'Backspace':
				code[index] = '';
				this.moveFocus(index, 'left');
				break;
			case 'Delete':
				code.splice(index, 1, '');
				break;
			case 'ArrowLeft':
				this.moveFocus(index, 'left');
				return;
			case 'ArrowRight':
			case 'Tab':
				this.moveFocus(index, 'right');
				return;
			default:
				break;
		}

		if (key.match(onlyAlphanumeric)) {
			code.splice(index, 1, '');
		}

		this.updateCode(code);
	};

	private onDigitChange = (index: number) => e => {
		const { value } = e.target;
		const { code } = this.state;

		if (value && onlyAlphanumeric.test(value)) {
			code[index] = value;
			this.moveFocus(index, 'right');
		}

		this.updateCode(code);
	};

	render() {
		const { className, displayState } = this.props;
		const { errorEmpty, errorNotEnoughNumbers } = this.state;
		const error = displayState === 'error' || errorEmpty || errorNotEnoughNumbers;

		return (
			<div className={className}>
				<div className={bem.e('inputs')}>{this.renderInputs(error)}</div>
				{error && this.renderError()}
			</div>
		);
	}

	renderError() {
		const { message } = this.props;
		const { errorEmpty, errorNotEnoughNumbers } = this.state;
		const errorMessage = errorEmpty
			? '@{codePage_device_code_input_validation_empty}'
			: errorNotEnoughNumbers
			? '@{codePage_device_code_input_validation_error}'
			: message;

		return <IntlFormatter className={bem.e('error-message')}>{errorMessage}</IntlFormatter>;
	}

	private onReference = (index: number) => input => {
		this.inputsRefs[index] = input;
	};

	private renderInputs(error: boolean) {
		const { disabled, required } = this.props;
		const inputs = [];
		for (let i = 0; i < LENGTH; i++) {
			inputs.push(
				<input
					key={i}
					type="text"
					ref={this.onReference(i)}
					className={bem.e('input', { error, disabled })}
					onKeyDown={this.onDigitKeyDown(i)}
					onChange={this.onDigitChange(i)}
					value={this.state.code[i]}
					onFocus={this.onCodeFocus}
					onBlur={this.onCodeBlur}
					maxLength={1}
					autoCapitalize="none"
					autoComplete="off"
					disabled={disabled}
					required={required}
				/>
			);
		}
		return inputs;
	}
}

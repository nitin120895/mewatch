import * as React from 'react';
import { findDOMNode } from 'react-dom';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { KEY_CODE } from 'shared/util/keycodes';
import { noop } from 'shared/util/function';
import * as cx from 'classnames';
import './DateOfBirthInput.scss';
import { formDisplayState } from '../../pageEntry/account/ssoValidationUtil';

enum inputs {
	day = 'day',
	month = 'month',
	year = 'year'
}

export enum DoBModifier {
	BORDERED = 'bordered',
	UNBORDERED = 'unbordered'
}

type dobEvent = { target: { name: string; value: string } };

interface DateOfBirthInputProps {
	name?: string;
	value?: string;
	required?: boolean;
	disabled?: boolean;
	displayState?: form.DisplayState;
	label?: string | React.ReactElement<any>;
	errorMessage?: string | React.ReactElement<any>;
	hint?: string | React.ReactElement<any>;
	onChange?: (e?: dobEvent) => void;
	onBlur?: (e?: dobEvent) => void;
	onFocus?: (e?: dobEvent) => void;
	className?: string;
	modifier?: DoBModifier;
}

interface DateOfBirthInputState {
	isEmpty: boolean;
	isFocused: boolean;
	value: { [name: string]: string };
	isTouched: boolean;
	focusedElementName: string;
}

const bem = new Bem('date-of-birth-input');

export default class DateOfBirthInput extends React.Component<DateOfBirthInputProps, DateOfBirthInputState> {
	static defaultProps = {
		displayState: 'default',
		label: '@{dob_input_placeholder}',
		focusedElementName: '',
		value: '',
		hint: '',
		errorMessage: '',
		onChange: noop,
		onBlur: noop,
		onFocus: noop,
		className: '',
		modifier: DoBModifier.BORDERED
	};
	references: { [name: string]: HTMLInputElement } = {};

	state = {
		isEmpty: true,
		isFocused: false,
		isTouched: false,
		value: {
			day: '',
			month: '',
			year: ''
		},
		focusedElementName: ''
	};

	componentDidMount(): void {
		this.setValue(this.props.value);
	}

	componentWillReceiveProps(nextProps: DateOfBirthInputProps) {
		if (nextProps.value !== this.props.value) {
			this.setValue(nextProps.value);
		}
	}

	private setValue(value: string) {
		const [day = '', month = '', year = ''] = value.split('/');
		const isEmpty = !(day || month || year);
		this.setState({ value: { day, month, year }, isEmpty });
	}

	private onReference = node => {
		if (node) this.references[node.props.name] = findDOMNode<HTMLInputElement>(node);
	};

	private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name: inputName, value } = e.target as HTMLInputElement;
		const { onBlur, name } = this.props;
		const oldValue = this.state.value;
		const newValue = {};
		if ((inputName === inputs.day || inputName === inputs.month) && value.length === 1) {
			newValue['value'] = { ...oldValue, [inputName]: value.padStart(2, '0') };
		}
		this.setState(
			{
				isFocused: false,
				focusedElementName: '',
				isEmpty: this.isEmptyValue(),
				...newValue
			},
			() => onBlur({ target: { name, value: this.getValue() } })
		);
	};

	private onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		const focusedElementName = (e.target as HTMLInputElement).name;
		this.setState({ isFocused: true, focusedElementName, isEmpty: this.isEmptyValue() });
		const { onFocus, name } = this.props;
		onFocus({ target: { name, value: this.getValue() } });
	};

	private onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, max } = e.target;
		const oldValue = this.state.value;
		if (value.length > max.length) {
			return;
		}
		this.setState({ isEmpty: false, value: { ...oldValue, [name]: value } }, () => {
			const { onChange, name } = this.props;
			onChange({ target: { name, value: this.getValue() } });
		});
		if (value.length > 1) {
			this.focusNextField(name);
		}
	};

	private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const { name, value } = e.target as HTMLInputElement;
		if (e.keyCode === KEY_CODE.BACKSPACE && !value) {
			this.focusPreviousField(name);
		}
	};

	private focusNextField(name: string) {
		if (name === inputs.day) {
			this.references[inputs.month].focus();
			return;
		}
		if (name === inputs.month) {
			this.references[inputs.year].focus();
			return;
		}
	}
	private focusPreviousField(name: string) {
		if (name === inputs.month) {
			this.references[inputs.day].focus();
			return;
		}
		if (name === inputs.year) {
			this.references[inputs.month].focus();
			return;
		}
	}

	private onClick = () => {
		const { isEmpty, isFocused } = this.state;
		const { disabled } = this.props;
		if (isFocused || disabled) {
			return;
		}
		this.setState({ isFocused: true, isTouched: true }, () => {
			if (isEmpty) {
				this.references[inputs.day].focus();
			} else {
				this.references[inputs.year].focus();
			}
		});
	};

	private isEmptyValue(): boolean {
		const { day, month, year } = this.state.value;
		return !(day || month || year);
	}

	private getValue(): string {
		if (this.isEmptyValue()) return '';
		const { day, month, year } = this.state.value;
		return `${day}/${month}/${year}`;
	}

	private isErrorState() {
		return !this.state.isFocused && this.props.displayState === formDisplayState.ERROR;
	}

	render() {
		const { isEmpty, isFocused } = this.state;
		const { displayState, className, modifier } = this.props;
		const error = this.isErrorState();
		const disabled = displayState === formDisplayState.DISABLED;
		const success = displayState === formDisplayState.SUCCESS;
		const classModifiers = {
			pristine: isEmpty,
			focused: isFocused,
			disabled,
			error,
			success
		};
		return (
			<div onClick={this.onClick} className={cx(className, bem.b(classModifiers), bem.b(modifier))}>
				<div className={bem.e('content')}>
					{this.renderInputs()}
					{this.renderPlaceholder()}
				</div>
				{this.renderMessage()}
			</div>
		);
	}

	private renderInputs() {
		const { focusedElementName, value, isEmpty, isFocused } = this.state;
		const { disabled, modifier } = this.props;
		const { day, month, year } = value;
		const hidden = !(modifier === DoBModifier.UNBORDERED && this.isErrorState()) && isEmpty && !isFocused;

		return (
			<div className={bem.e('inputs-wrapper', { hidden })}>
				<IntlFormatter
					elementType="input"
					name={inputs.day}
					value={day}
					ref={this.onReference}
					onBlur={this.onBlur}
					onFocus={this.onFocus}
					onInput={this.onInput}
					type="tel"
					className={bem.e('input')}
					max="31"
					min="1"
					disabled={disabled}
					formattedProps={{
						placeholder: focusedElementName !== inputs.day ? '@{dob_input_dd}' : ''
					}}
				/>
				<span className={bem.e('divider')} />
				<IntlFormatter
					elementType="input"
					name={inputs.month}
					value={month}
					ref={this.onReference}
					onBlur={this.onBlur}
					onFocus={this.onFocus}
					onInput={this.onInput}
					onKeyDown={this.onKeyDown}
					type="tel"
					className={bem.e('input')}
					max="12"
					min="1"
					disabled={disabled}
					formattedProps={{
						placeholder: focusedElementName !== inputs.month ? '@{dob_input_mm}' : ''
					}}
				/>
				<span className={bem.e('divider')} />
				<IntlFormatter
					elementType="input"
					name={inputs.year}
					value={year}
					ref={this.onReference}
					onBlur={this.onBlur}
					onFocus={this.onFocus}
					onInput={this.onInput}
					onKeyDown={this.onKeyDown}
					type="tel"
					className={bem.e('input')}
					max="9999"
					min="1900"
					disabled={disabled}
					formattedProps={{
						placeholder: focusedElementName !== inputs.year ? '@{dob_input_yyyy}' : ''
					}}
				/>
			</div>
		);
	}

	private renderPlaceholder() {
		const { isFocused, isEmpty } = this.state;
		const { displayState, label, modifier } = this.props;
		const lifted =
			isFocused || displayState === formDisplayState.ERROR || (modifier === DoBModifier.UNBORDERED && !isEmpty);
		const hidden = !lifted && !isEmpty;

		return (
			<IntlFormatter elementType="div" className={bem.e('placeholder', { lifted, hidden })}>
				{label}
			</IntlFormatter>
		);
	}

	private renderMessage() {
		const { errorMessage, hint } = this.props;
		const { isFocused } = this.state;
		const hintMessage = isFocused ? hint : '';
		const error = this.isErrorState();
		const message = error ? errorMessage : hintMessage;

		if (message) {
			return (
				<IntlFormatter elementType="div" className={bem.e('message', { error })}>
					{message}
				</IntlFormatter>
			);
		}
	}
}

import * as React from 'react';
import * as cx from 'classnames';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { KEY_CODE } from 'shared/util/keycodes';
import { omit } from 'shared/util/objects';
import EmailIcon from '../icons/EmailIcon';
import { InputHint, isError, isSuccess, isDisabled } from '../../pageEntry/account/ssoValidationUtil';
import { noop } from 'shared/util/function';

import './TextInput.scss';
import './MePassTxtInput.scss';

const bemTxtInput = new Bem('txt-input');
const bemMePassInput = new Bem('me-pass-txt-input');

export interface TextInputProps extends React.HTMLProps<HTMLInputElement> {
	// Redeclare id and name as mandatory
	id: string;
	name: string;
	maxLength?: number;
	oskType?: form.OskType;
	displayState?: form.DisplayState;
	labelComponent?: React.ReactElement<any>;
	message?: string | React.ReactElement<any>;
	required?: boolean;
	onActive?: (e: boolean) => void;
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
	onPaste?: (e: React.FormEvent<HTMLInputElement>) => void;
	autoCapitalize?: form.SafariAutoCapitalize;
	autoCorrect?: form.AutoCorrect;
	onStateTypeChange?: () => string;
	onReference?: (node: HTMLInputElement) => void;
	focus?: boolean;
	forceError?: boolean;
	mePass?: boolean;
	showEmailIcon?: boolean;
	hint?: InputHint;
	advisoryText?: boolean;
}

export interface TextInputState {
	value?: string;
	error?: boolean;
	active?: boolean;
	focused?: boolean;
	type?: string;
}

const templates = (oskType: form.OskType) => {
	const props: React.HTMLProps<HTMLInputElement> = {};
	switch (oskType) {
		case 'numeric':
			props.type = 'number';
			props.autoCorrect = 'none';
			props.spellCheck = false;
			break;
		case 'numpad':
			props.type = 'number';
			props.pattern = '[0-9]*';
			props.inputMode = 'numeric';
			break;
		case 'phone':
			props.type = 'tel';
			props.autoComplete = 'tel';
			break;
		case 'email':
			props.type = 'email';
			props.autoCorrect = 'off';
			props.autoCapitalize = 'none';
			props.spellCheck = false;
			break;
	}
	return props;
};

// This should match the background colour of your input's CSS.
// This is the colour for transparent.
// Transparent is explicitly specified for the Edge browser

const BACKGROUND_COLOR_CHECK = ['rgba(0, 0, 0, 0)', 'transparent'];

export default class TextInput extends React.Component<TextInputProps, TextInputState> {
	static defaultProps = {
		displayState: 'default',
		type: 'text',
		autoCapitalize: 'none',
		autoCorrect: 'off',
		hint: {
			enable: false,
			enableIcon: false,
			message: ''
		},
		onPaste: noop,
		onKeyPress: noop
	};

	private input: HTMLInputElement;
	private interval: number;

	constructor(props) {
		super(props);
		this.state = {
			value: props.value || '',
			error: false,
			active: false,
			type: props.type
		};
	}

	componentDidMount() {
		this.onInteraction('blur');
		this.setFocus();
		this.interval = window.setInterval(() => {
			// In firefox there is a delay after the
			// input mounts before auto fill is applied.
			// The timeout is to ensure the value is captured
			if (this.state.value.length > 0) {
				this.onInteraction('blur');
				window.clearInterval(this.interval);
			}

			// In chrome when a form is auto filled it wont always trigger an onchange event. When
			// the field is auto filled we want to animate the label. Since we can't rely on the
			// onchange event, we instead check if the background color is different than specified
			// and apply the animation.
			if (!BACKGROUND_COLOR_CHECK.includes(window.getComputedStyle(this.input).backgroundColor)) {
				this.setState({ active: true });
				window.clearInterval(this.interval);
			}
		}, 100);

		setTimeout(() => {
			window.clearInterval(this.interval);
		}, 2000);
	}

	componentWillUnmount() {
		window.clearInterval(this.interval);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.displayState !== this.props.displayState && isError(nextProps.displayState)) {
			this.setState({ error: true });
		}
		if (nextProps.value !== undefined && nextProps.value !== this.state.value) {
			this.setState({ value: nextProps.value, active: nextProps.value !== '' });
		}
	}

	componentDidUpdate(nextProps: TextInputProps) {
		if (nextProps.focus) {
			this.setFocus();
		}
	}

	private canInputSupportSelectionRange = (input: HTMLInputElement): boolean => {
		return input.setSelectionRange && /text|search|password|tel|url/i.test(input.type || '');
	};

	private setFocus = () => {
		if (this.props.focus) {
			const { length } = this.input.value;
			this.input.focus();

			if (this.canInputSupportSelectionRange(this.input)) {
				this.input.setSelectionRange(length, length);
			}
		}
	};

	private onReference = node => {
		this.input = node;
		if (this.props.onReference) this.props.onReference(node);
	};

	private onInteraction = eventType => {
		let active;
		let focused = false;
		if (eventType === 'focus') {
			active = true;
			focused = true;
		}
		if (eventType === 'blur' && this.state.value.length > 0) active = true;
		else if (eventType === 'blur') active = false;
		// use a small setTimeout to delay vertical page jumping and to avoid inaccurate user clicks on neighboring elements
		setTimeout(() => {
			this.setState({ active, focused });
			if (this.props.onActive) this.props.onActive(active);
		}, 200);
	};

	private onFocus = e => {
		if (this.props.onFocus) this.props.onFocus(e);
		if (!e.defaultPrevented) this.onInteraction('focus');
	};

	private onLabelClick = () => {
		if (!this.state.active) {
			this.input.focus();
		}
	};

	private onBlur = e => {
		if (this.props.onBlur) this.props.onBlur(e);
		if (!e.defaultPrevented) this.onInteraction('blur');
	};

	private onChange = (e: React.FormEvent<HTMLInputElement>) => {
		const { value } = e.currentTarget;
		if (this.props.onChange) this.props.onChange(e);

		// In some browsers (e.g. firefox) when autofill is applied via a selection
		// from a menu, an input can change without user input but will fire the
		// onchange event. Here we check if the field has a value and apply style
		// accordingly.
		if (value.length > 0 && !this.state.active) this.setState({ active: true });
		if (value.length === 0) this.setState({ error: false }, () => this.onInteraction('focus'));
		if (!e.defaultPrevented) {
			this.setState({ value });
		}
	};

	private onKeyUp = e => {
		// Required as workaround for MEDTOG-16705
		// HTML maxlength property is not effective on Android native keyboard
		const { maxLength } = this.props;
		const value = e.target.value;

		if (maxLength && value.length > maxLength) {
			this.setState({ value: value.substring(0, maxLength) });
		}
	};

	private onKeyDown = e => {
		// If this input is a child of a form element then hitting enter may trigger a form submission if all the
		// required fields have values. If an error in the submission occurs the input looses focus but the on blur
		// event does not trigger. This sets the blur styling on the element in the mentioned circumstance.
		if (this.props.onKeyDown) this.props.onKeyDown(e);
		if (!e.defaultPrevented && KEY_CODE.ENTER === e.keyCode && this.state.value.length > 0) this.onInteraction('blur');
	};

	private onPaste = e => {
		this.props.onPaste(e);
	};

	private onKeyPress = e => {
		this.props.onKeyPress(e);
	};

	render() {
		// tslint:disable:no-unused-variable
		const {
			id,
			label,
			labelComponent,
			required,
			message,
			displayState,
			oskType,
			className,
			value: propsValue,
			onReference,
			focus,
			placeholder,
			onFocus,
			onBlur,
			onChange,
			onActive,
			forceError,
			mePass,
			showEmailIcon,
			advisoryText,
			...rest
		} = omit(this.props, 'hint');
		// tslint:enable

		const { value, active, focused } = this.state;
		const disabled = isDisabled(displayState);
		const error = isError(displayState);
		const success = isSuccess(displayState);
		const classModifiers = {
			active: active,
			focused: focused,
			success: success && !focused,
			error: error && (!focused || forceError),
			disabled: disabled,
			empty: !value.length,
			'email-icon': this.shouldShowEmailIcon()
		};

		const bem = this.getBem();
		return (
			<div className={cx(bem.b(classModifiers), className)}>
				{this.renderLabel(required, id, labelComponent ? labelComponent : label)}
				<input
					required={required}
					className={bem.e('input')}
					id={id}
					value={value}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					disabled={disabled}
					onChange={this.onChange}
					ref={this.onReference}
					onKeyUp={this.onKeyUp}
					onKeyDown={this.onKeyDown}
					onPaste={this.onPaste}
					onKeyPress={this.onKeyPress}
					{...rest}
					{...templates(oskType)}
				/>
				{this.renderMessages()}
				{this.shouldShowEmailIcon() && <EmailIcon className="email-icon" />}
			</div>
		);
	}

	private renderMessages() {
		const { hint, message, displayState } = this.props;
		const { enable, enableIcon } = hint;
		const { focused } = this.state;
		const bem = this.getBem();

		if (!focused) {
			return (
				<div>
					{isSuccess(displayState) && this.renderSuccessIcon(bem.e('icon', 'success'))}
					{isError(displayState) && this.renderErrorState()}
					{message && (
						<IntlFormatter elementType="p" className={bem.e('message')} aria-hidden={!!message}>
							{message}
						</IntlFormatter>
					)}
				</div>
			);
		} else {
			return (
				<div>
					{(enable || enableIcon) && this.renderHint()}
					{this.props.advisoryText && (
						<IntlFormatter elementType="div" className={bem.e('advisory-header')}>
							{'@{form_advisory_password_header}'}
							<IntlFormatter elementType="ul">
								<IntlFormatter elementType="li" className={bem.e('advisory-text')}>
									{'@{form_advisory_password_text1}'}{' '}
								</IntlFormatter>
								<IntlFormatter elementType="li" className={bem.e('advisory-text')}>
									{'@{form_advisory_password_text2}'}
								</IntlFormatter>
								<IntlFormatter elementType="li" className={bem.e('advisory-text')}>
									{'@{form_advisory_password_text3}'}
								</IntlFormatter>
							</IntlFormatter>
						</IntlFormatter>
					)}
				</div>
			);
		}
	}

	private renderHint() {
		const {
			hint: { enable, enableIcon, message }
		} = this.props;
		const bem = this.getBem();

		return (
			<IntlFormatter elementType="p" className={bem.e('focused-hint')} aria-hidden={enable || enableIcon}>
				{message}
				{enableIcon && this.renderSuccessIcon(bem.e('icon-hint', 'success'))}
			</IntlFormatter>
		);
	}

	shouldShowEmailIcon(): boolean {
		const { mePass, showEmailIcon } = this.props;
		const { active, error } = this.state;
		return mePass && showEmailIcon && !active && !error;
	}

	getBem = (): Bem => (this.props.mePass ? bemMePassInput : bemTxtInput);

	private renderLabel(required, id, label) {
		const bem = this.getBem();

		if (required) {
			return (
				<IntlFormatter
					onClick={this.onLabelClick}
					elementType="label"
					htmlFor={id}
					className={bem.e('label', { 'margin-left': this.shouldShowEmailIcon() })}
					aria-hidden={true}
				>
					{label}
				</IntlFormatter>
			);
		}
		return (
			<label htmlFor={id} className={bem.e('label')} aria-hidden={true}>
				<IntlFormatter>{label}</IntlFormatter>
				<IntlFormatter className={bem.e('optional')}>{` (@{form_common_input_optional_label|Optional})`}</IntlFormatter>
			</label>
		);
	}

	private renderSuccessIcon(className: string, width = 22, height = 22) {
		return <TickIcon className={className} width={width} height={height} />;
	}

	private renderErrorState() {
		return (
			<span className={this.getBem().e('icon', 'error')} aria-hidden="true">
				!
			</span>
		);
	}
}

import * as React from 'react';
import { Bem } from 'shared/util/styles';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { KEY_CODE } from 'shared/util/keycodes';

import './TextInput.scss';

const bemTxtInput = new Bem('txt-input');

export interface TextInputProps extends React.HTMLProps<HTMLInputElement> {
	// Redeclare id and name as mandatory
	id: string;
	name: string;
	maxLength?: number;
	oskType?: form.OskType;
	displayState?: form.DisplayState;
	message?: string;
	required?: boolean;
	onActive?: (e: boolean) => void;
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
	autoCapitalize?: form.SafariAutoCapitalize;
	autoCorrect?: form.AutoCorrect;
	onStateTypeChange?: () => string;
	onReference?: (node: HTMLInputElement) => void;
	focus?: boolean;
	showStateIcon?: boolean;
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
const BACKGROUND_COLOR_CHECK = 'rgba(0, 0, 0, 0)';

export default class TextInput extends React.Component<TextInputProps, TextInputState> {
	static defaultProps = {
		displayState: 'default',
		type: 'text',
		autoCapitalize: 'none',
		autoCorrect: 'off',
		showStateIcon: true
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
		if (this.props.focus) this.input.focus();
		else this.onInteraction('blur');
		this.interval = window.setInterval(() => {
			const { value } = this.state;
			// In firefox there is a delay after the
			// input mounts before auto fill is applied.
			// The timeout is to ensure the value is captured
			if (value && value.length > 0) {
				if (this.props.focus) this.input.focus();
				else this.onInteraction('blur');
				window.clearInterval(this.interval);
			}

			// In chrome when a form is auto filled it wont always trigger an onchange event. When
			// the field is auto filled we want to animate the label. Since we can't rely on the
			// onchange event, we instead check if the background color is different than specified
			// and apply the animation.
			if (
				window.getComputedStyle(this.input).backgroundColor !== BACKGROUND_COLOR_CHECK ||
				(value && value.length > 0)
			) {
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
		if (nextProps.value !== undefined && nextProps.value !== this.state.value) {
			this.setState({ value: nextProps.value });

			// when make not focused input field empty, reset label state as well
			if (!this.state.focused && nextProps.value === '' && nextProps.value.length === 0) {
				this.setState({ active: false });
			}
		}
	}

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
		this.setState({ active, focused });
		if (this.props.onActive) this.props.onActive(active);
	};

	private onFocus = e => {
		if (this.props.onFocus) this.props.onFocus(e);
		if (!e.defaultPrevented) this.onInteraction('focus');
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
		if (!e.defaultPrevented) {
			this.setState({ value });
		}
	};

	private onKeyDown = e => {
		// If this input is a child of a form element then hitting enter may trigger a form submission if all the
		// required fields have values. If an error in the submission occurs the input looses focus but the on blur
		// event does not trigger. This sets the blur styling on the element in the mentioned circumstance.
		if (this.props.onKeyDown) this.props.onKeyDown(e);
		if (!e.defaultPrevented && KEY_CODE.ENTER === e.keyCode && this.state.value.length > 0) this.onInteraction('blur');
	};

	render() {
		// tslint:disable:no-unused-variable
		const {
			id,
			label,
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
			showStateIcon,
			...rest
		} = this.props;
		// tslint:enable

		const { value, active, focused } = this.state;
		const disabled = displayState === 'disabled';
		const error = displayState === 'error';
		const success = displayState === 'success';
		const classModifiers = {
			active: active,
			focused: focused,
			success: success && !focused,
			error: error && !focused,
			disabled: disabled
		};

		return (
			<div className={cx(bemTxtInput.b(classModifiers), className)}>
				{this.renderLabel(required, id, label)}
				<input
					required={required}
					className={bemTxtInput.e('input')}
					id={id}
					value={value}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					disabled={disabled}
					onChange={this.onChange}
					ref={this.onReference}
					onKeyDown={this.onKeyDown}
					{...rest}
					{...templates(oskType)}
				/>
				{showStateIcon && success && this.renderSuccessState()}
				{showStateIcon && error && this.renderErrorState()}
				<IntlFormatter elementType="p" className={bemTxtInput.e('message')} aria-hidden={!!message}>
					{message ? message : ''}
				</IntlFormatter>
			</div>
		);
	}

	private renderLabel(required, id, label) {
		if (required) {
			return (
				<IntlFormatter elementType="label" htmlFor={id} className={bemTxtInput.e('label')} aria-hidden={true}>
					{label}
				</IntlFormatter>
			);
		}
		return (
			<label htmlFor={id} className={bemTxtInput.e('label')} aria-hidden={true}>
				<IntlFormatter>{label}</IntlFormatter>
				<IntlFormatter className={bemTxtInput.e('optional')}>
					{` (@{form_common_input_optional_label|Optional})`}
				</IntlFormatter>
			</label>
		);
	}

	private renderSuccessState() {
		return <TickIcon className={bemTxtInput.e('icon', 'success')} width={22} height={22} />;
	}

	private renderErrorState() {
		return (
			<span className={bemTxtInput.e('icon', 'error')} aria-hidden="true">
				!
			</span>
		);
	}
}

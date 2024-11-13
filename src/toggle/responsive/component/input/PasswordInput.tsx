import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { default as TextInput, TextInputProps } from './TextInput';
import { Bem } from 'shared/util/styles';
import { formDisplayState } from '../../pageEntry/account/ssoValidationUtil';
import PasswordIcon from '../icons/PasswordIcon';

import './PasswordInput.scss';
import './MePassPwdInput.scss';

const bemPassword = new Bem('pwd-input');
const bemMePassInput = new Bem('me-pass-pwd-input');

interface Props extends TextInputProps {
	mePass?: boolean;
	showPasswordIcon?: boolean;
	advisoryText?: boolean;
}
interface PasswordState {
	togglePosition?: boolean;
	inputType?: string;
	active?: boolean;
	value?: boolean;
}

export default class PasswordInput extends React.Component<Props, PasswordState> {
	constructor(props) {
		super(props);
		this.state = {
			togglePosition: props.displayState !== 'default',
			inputType: 'password',
			active: false,
			value: false
		};
	}

	componentWillReceiveProps(nextProps) {
		const { displayState } = nextProps;
		if (displayState !== this.props.displayState) this.adjustButtonPosition('blur', displayState);
	}

	componentDidMount() {
		this.adjustButtonPosition('blur', this.props.displayState);
	}

	adjustButtonPosition(eventType, displayState?) {
		const nextState: { togglePosition? } = {};
		if (eventType === 'blur') nextState.togglePosition = displayState === 'error' || displayState === 'success';
		else if (eventType === 'focus') nextState.togglePosition = false;
		this.setState({ togglePosition: nextState.togglePosition });
	}

	onFocus = e => this.adjustButtonPosition('focus');
	onBlur = e => {
		this.adjustButtonPosition('blur', this.props.displayState);
		if (this.props.onBlur) this.props.onBlur(e);
	};
	onActive = active => this.setState({ active });
	onChange = e => {
		this.setState({ value: e.target.value });
		if (this.props.onChange) this.props.onChange(e);
	};

	onClick = e => {
		e.preventDefault();
		const { inputType } = this.state;
		const newState: PasswordState = {};
		if (inputType === 'text') newState.inputType = 'password';
		else newState.inputType = 'text';
		this.setState(newState);
	};

	getBem = (): Bem => (this.props.mePass ? bemMePassInput : bemPassword);

	getTogglePassElement() {
		const { inputType } = this.state;
		const isText = inputType === 'text';

		return isText ? '@{form_common_input_hide_label|Hide}' : '@{form_common_input_show_label|Show}';
	}

	shouldShowPwdIcon(): boolean {
		const { mePass, showPasswordIcon, displayState } = this.props;
		return mePass && showPasswordIcon && displayState === formDisplayState.DEFAULT;
	}

	render() {
		// tslint:disable:no-unused-variable
		const {
			id,
			name,
			label,
			message,
			displayState,
			placeholder,
			onFocus,
			onBlur,
			onChange,
			required,
			type,
			ref,
			showPasswordIcon,
			...rest
		} = this.props;
		// tslint:enable
		const disabled = displayState === 'disabled';
		const { inputType, togglePosition, active, value } = this.state;

		const labelToggle = this.getTogglePassElement();
		const bem = this.getBem();

		const classes = {
			feedback: togglePosition,
			value: !!value,
			active,
			disabled,
			'pwd-icon': this.shouldShowPwdIcon()
		};
		return (
			<div className={bem.b(classes)}>
				<TextInput
					id={id}
					name={name}
					required={true}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					onActive={this.onActive}
					onChange={this.onChange}
					label={label}
					type={inputType}
					message={message}
					autoCapitalize={'none'}
					displayState={displayState}
					advisoryText={this.props.advisoryText}
					{...rest}
				/>
				<IntlFormatter
					elementType="button"
					tabIndex={-1}
					className={bem.e('view-pwd')}
					type={'button'}
					onClick={this.onClick}
					disabled={disabled}
					aria-hidden={true}
				>
					{labelToggle}
				</IntlFormatter>
				{this.shouldShowPwdIcon() && <PasswordIcon className="pwd-icon" />}
			</div>
		);
	}
}

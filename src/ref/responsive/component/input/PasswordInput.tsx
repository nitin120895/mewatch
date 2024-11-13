import * as React from 'react';
import { TextInputProps } from './TextInput';
import TextInput from './TextInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';

import './PasswordInput.scss';

const bem = new Bem('pwd-input');

interface PasswordProps extends TextInputProps {
	// this property means visibility of input component as part of some containers or accordion items
	isVisible?: boolean;
}

interface PasswordState {
	togglePosition?: boolean;
	inputType?: string;
	active?: boolean;
	value?: string | number | string[];
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
}

export default class PasswordInput extends React.Component<PasswordProps, PasswordState> {
	static defaultProps = {
		isVisible: true,
		showStateIcon: true
	};

	constructor(props: PasswordProps) {
		super(props);
		this.state = {
			togglePosition: props.displayState !== 'default',
			inputType: 'password',
			active: false,
			value: props.value || ''
		};
	}

	componentWillReceiveProps(nextProps: PasswordProps) {
		const { displayState, value } = nextProps;
		if (displayState !== this.props.displayState) this.adjustButtonPosition('blur', displayState);
		if (value !== this.props.value) this.setState({ value });
	}

	public componentDidUpdate(prevProps: PasswordProps) {
		if (prevProps.isVisible && !this.props.isVisible) {
			this.setState({ inputType: 'password' });
		}
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

	onFocus = e => {
		if (this.props.onFocus) this.props.onFocus(e);
		this.adjustButtonPosition('focus');
	};
	onBlur = e => this.adjustButtonPosition('blur', this.props.displayState);
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
			isVisible,
			showStateIcon,
			...rest
		} = this.props;
		// tslint:enable
		const disabled = displayState === 'disabled';
		const { inputType, togglePosition, active, value } = this.state;
		const labelToggle =
			inputType === 'text' ? '@{form_common_input_hide_label|hide}' : '@{form_common_input_show_label|show}';
		return (
			<div className={bem.b({ feedback: showStateIcon && togglePosition }, { active }, { disabled: disabled })}>
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
					showStateIcon={showStateIcon}
					{...rest}
				/>
				{value && (
					<IntlFormatter
						elementType="button"
						className={bem.e('view-pwd')}
						type={'button'}
						onClick={this.onClick}
						disabled={disabled}
						tabIndex={-1}
					>
						{labelToggle}
					</IntlFormatter>
				)}
			</div>
		);
	}
}

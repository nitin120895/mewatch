import * as React from 'react';
import TextInput from 'ref/responsive/component/input/TextInput';
import NumberInput from 'ref/responsive/component/input/NumberInput';

import './FormElements.scss';

export default class TextInputComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			state: 'default',
			required: true,
			message: ''
		};
	}

	private onChange = e => {
		this.setState({ state: e.target.value });
	};

	private onRequiredChange = e => {
		this.setState({ required: e.target.checked });
	};

	private onMessageChange = e => {
		this.setState({ message: e.target.checked ? 'This is a message' : '' });
	};

	private onEvent() {}

	render() {
		return (
			<div>
				<form className="input-toggler">
					<label>
						<input
							type="radio"
							name="input-state"
							value="success"
							checked={this.state.state === 'success'}
							onChange={this.onChange}
						/>
						<span>Success</span>
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="error"
							checked={this.state.state === 'error'}
							onChange={this.onChange}
						/>
						<span>Error</span>
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="default"
							checked={this.state.state === 'default'}
							onChange={this.onChange}
						/>
						<span>Default</span>
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="disabled"
							checked={this.state.state === 'disabled'}
							onChange={this.onChange}
						/>
						<span>Disabled</span>
					</label>
					<label>
						<input type="checkbox" name="required" checked={this.state.required} onChange={this.onRequiredChange} />
						<span>Required</span>
					</label>
					<label>
						<input type="checkbox" name="required" checked={this.state.message} onChange={this.onMessageChange} />
						<span>Message</span>
					</label>
				</form>
				<form className="form form-white" autoCapitalize="words">
					{this.renderTypedInput('white', 'text', 'name', 'Text Field')}
					{this.renderTypedInput('white-2', 'email', 'email', 'Email Field', 'email')}
					{this.renderTypedInput('white-3', 'number', 'numpad', 'Numpad Field', 'numpad')}
					{this.renderTypedInput('white-4', 'tel', 'phone', 'Phone Field', 'phone')}
					{this.renderTypedInput('white-5', 'number', 'number', 'Number Field', 'numeric')}
				</form>

				<form className="form form-blue">
					{this.renderTypedInput('blue', 'text', 'name', 'Text Field')}
					{this.renderTypedInput('blue-2', 'email', 'email', 'Email Field', 'email')}
					{this.renderTypedInput('blue-3', 'number', 'numpad', 'Numpad Field', 'numpad')}
					{this.renderTypedInput('blue-4', 'tel', 'phone', 'Phone Field', 'phone')}
					{this.renderTypedInput('blue-5', 'number', 'number', 'Number Field', 'numeric')}
				</form>
				<div className="clearfix" />
			</div>
		);
	}

	private renderTypedInput = (color, type, name, label, osk?) => {
		if (type === 'number') {
			return (
				<NumberInput
					type={type}
					displayState={this.state.state}
					required={this.state.required}
					onBlur={this.onEvent}
					onFocus={this.onEvent}
					message={this.state.state === 'error' ? 'This is an example error message' : this.state.message}
					name={name}
					label={label}
					oskType={osk}
					id={`text-input-${color}`}
				/>
			);
		}
		return (
			<TextInput
				type={type}
				displayState={this.state.state}
				required={this.state.required}
				onBlur={this.onEvent}
				onFocus={this.onEvent}
				message={this.state.state === 'error' ? 'This is an example error message' : this.state.message}
				name={name}
				label={label}
				oskType={osk}
				id={`text-input-${color}`}
			/>
		);
	};
}

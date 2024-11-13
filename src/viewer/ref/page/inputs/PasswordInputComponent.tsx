import * as React from 'react';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';

import './FormElements.scss';

export default class FormElements extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			state: 'default',
			required: true,
			message: ''
		};
	}

	onChange = e => {
		this.setState({ state: e.target.value });
	};

	onRequiredChange = e => {
		this.setState({ required: e.target.checked });
	};

	onMessageChange = e => {
		this.setState({ message: e.target.checked ? 'This is a message' : '' });
	};

	event = e => {
		console.log('Value', e.target.value);
	};

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
						Success
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="error"
							checked={this.state.state === 'error'}
							onChange={this.onChange}
						/>
						Error
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="default"
							checked={this.state.state === 'default'}
							onChange={this.onChange}
						/>
						Default
					</label>
					<label>
						<input
							type="radio"
							name="input-state"
							value="disabled"
							checked={this.state.state === 'disabled'}
							onChange={this.onChange}
						/>
						Disabled
					</label>
					<label>
						<input type="checkbox" name="required" checked={this.state.message} onChange={this.onMessageChange} />
						Message
					</label>
				</form>
				<form className="form form-white">{this.renderTypedInput('white', 'text', 'Password Input Field')}</form>
				<form className="form form-blue">{this.renderTypedInput('blue', 'text', 'Password Input Field')}</form>
			</div>
		);
	}

	renderTypedInput = (color, type, label) => (
		<PasswordInput
			type={type}
			displayState={this.state.state}
			onBlur={this.event}
			onFocus={this.event}
			message={this.state.state === 'error' ? 'This is an error message, no no no no no' : this.state.message}
			name={`text-input-${color}`}
			label={label}
			id={`text-input-${color}`}
		/>
	);
}

import * as React from 'react';
import PinInput from 'ref/responsive/component/input/PinInput';

import './FormElements.scss';

interface FormPinState {
	digits: Array<number>;
	pinLength: number;
	error: string;
	disabled: boolean;
}

export default class FormPin extends React.Component<any, FormPinState> {
	state = {
		digits: [],
		pinLength: 4,
		error: undefined,
		disabled: false
	};

	private onPinChange = (digits: number[]) => {
		this.setState({ digits });
	};

	private onPinLengthChange = e => {
		this.setState({ pinLength: e.target.value });
	};

	private onErrorChange = e => {
		this.setState({ error: e.target.value });
	};

	private onDisableChange = () => {
		this.setState({ disabled: !this.state.disabled });
	};

	render() {
		const { pinLength, digits, error, disabled } = this.state;

		return (
			<div>
				<form>
					<fieldset className="fs">
						<legend>Pin Length</legend>
						<input
							name="pinLength"
							value={pinLength}
							type="number"
							placeholder="PIN Length"
							onChange={this.onPinLengthChange}
							min="3"
							max="6"
						/>
					</fieldset>
					<fieldset className="fs">
						<legend>Error Message</legend>
						<input
							name="error-text"
							type="text"
							value={error}
							onChange={this.onErrorChange}
							placeholder="Error Message"
							className="txt-input"
						/>
					</fieldset>
					<fieldset className="fs">
						<legend>Disable</legend>
						<input type="checkbox" checked={disabled} onChange={this.onDisableChange} className="txt-input" />
					</fieldset>
				</form>
				<div className="form form-white">
					<h4>Light Background</h4>
					<PinInput
						pinLength={pinLength}
						disabled={disabled}
						digits={digits}
						onChange={this.onPinChange}
						label="Set a PIN"
						error={error}
					/>
				</div>
				<div className="form">
					<h4>Dark Background</h4>
					<PinInput
						pinLength={pinLength}
						disabled={disabled}
						digits={digits}
						onChange={this.onPinChange}
						label="Set a PIN"
						error={error}
						dark
					/>
				</div>
			</div>
		);
	}
}

import * as React from 'react';
import { SwitchInput } from 'ref/responsive/component/input/SwitchInput';
import * as cx from 'classnames';

import './SwitchInputComponent.scss';

const mock = {
	checked: false,
	labelEnabled: 'On',
	labelDisabled: 'Off'
};

const mockLong = {
	labelEnabled: 'Hot dog',
	labelDisabled: 'Not hot dog'
};

const mockDisabled = Object.assign({}, mock, { disabled: true });
const mockDisabledChecked = Object.assign({}, mock, { disabled: true, checked: true });

export default class SwitchInputComponent extends React.Component<PageProps, any> {
	constructor() {
		super();
		this.state = {
			checked: false,
			one: false,
			two: true,
			three: false,
			four: false,
			five: true,
			six: false
		};
	}

	onChange = () => this.setState({ checked: !this.state.checked });

	private onCheck = e => {
		const name = e.target.name;
		this.setState({ [name]: !this.state[name] });
	};

	render() {
		const { checked, one, two, three, four, five, six } = this.state;
		return (
			<div className="switchInputForm form-white">
				<p>Note: When clicking label or switch, focus is assigned.</p>
				<h4>Left Label - Enabled</h4>
				<div>
					<SwitchInput {...mock} id="one" name="one" onChange={this.onCheck} checked={one} />
				</div>
				<h4>Left Label - Disabled</h4>
				<div>
					<SwitchInput {...mockDisabled} id="two" name="two" onChange={this.onCheck} checked={two} />
				</div>
				<div>
					<SwitchInput {...mockDisabledChecked} id="three" name="three" onChange={this.onCheck} checked={three} />
				</div>
				<h4>Right Label - Enabled</h4>
				<div>
					<SwitchInput {...mock} labelPosition={'right'} id="four" name="four" onChange={this.onCheck} checked={four} />
				</div>
				<h4>Right Label - Disabled</h4>
				<div>
					<SwitchInput
						{...mockDisabled}
						labelPosition={'right'}
						id="five"
						name="five"
						onChange={this.onCheck}
						checked={five}
					/>
				</div>
				<div>
					<SwitchInput
						{...mockDisabledChecked}
						labelPosition={'right'}
						id="six"
						name="six"
						onChange={this.onCheck}
						checked={six}
					/>
				</div>
				<h4>Long Left Label - Enabled</h4>
				<div>
					<p>
						Sometimes labels can have varying width. The bounding box is to demonstrate the maximum space the switch
						component takes.
					</p>
					<p>
						<label>
							<input type="checkbox" checked={checked} onChange={this.onChange} />
							Show Bounding Box
						</label>
					</p>
					<SwitchInput {...mockLong} id="two" className={cx({ 'bounding-box': checked })} />
				</div>
			</div>
		);
	}
}

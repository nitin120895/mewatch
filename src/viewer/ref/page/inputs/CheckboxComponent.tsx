import * as React from 'react';
import Checkbox from 'ref/responsive/component/input/Checkbox';

import './FormElements.scss';

export default class CheckboxComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			disabled: false,
			one: false,
			two: true,
			three: false,
			four: true
		};
	}

	private onChange = () => this.setState({ disabled: !this.state.disabled });

	private onCheck = e => {
		const name = e.target.name;
		this.setState({ [name]: !this.state[name] });
	};

	render() {
		const { one, two, three, four, disabled } = this.state;
		return (
			<div>
				<form>
					<label>
						<input type="checkbox" onChange={this.onChange} checked={this.state.disabled} />
						Disabled
					</label>
				</form>
				<form className="form form-white">
					<Checkbox label={'Checkbox'} name={'one'} disabled={disabled} onChange={this.onCheck} checked={one} />
					<Checkbox label={'Checkbox'} name={'two'} onChange={this.onCheck} disabled={disabled} checked={two} />
				</form>
				<form className="form form-blue">
					<Checkbox label={'Checkbox'} name={'three'} onChange={this.onCheck} disabled={disabled} checked={three} />
					<Checkbox label={'Checkbox'} name={'four'} onChange={this.onCheck} disabled={disabled} checked={four} />
				</form>
			</div>
		);
	}
}

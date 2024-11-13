import * as React from 'react';
import TitledMarkupGroup from '../../../ui/TitledMarkupGroup';

interface FormElementsState {
	values?: { [key: string]: any };
	commonProps?: React.HTMLProps<any>;
}

export default class FormElements extends React.Component<PageProps, FormElementsState> {
	constructor(props) {
		super(props);
		this.state = {
			values: {},
			commonProps: {
				onChange: this.onChange,
				disabled: false,
				required: false
			}
		};
	}

	private toArray(collection: HTMLCollection): any[] {
		const values = [];
		for (let i = 0; i < collection.length; i++) {
			values.push(collection.item(i));
		}
		return values;
	}

	private getValue(target: any): any {
		const { type, tagName, value, checked, selectedOptions } = target;
		const elementType = (type || tagName).toLowerCase();
		switch (elementType) {
			case 'checkbox':
				return checked;
			case 'select-multiple':
				return this.toArray(selectedOptions).map(o => o.value);
			default:
				return value;
		}
	}

	private onToggleCommonProp = (e: React.ChangeEvent<HTMLInputElement>) => {
		const commonProps = this.state.commonProps;
		commonProps[e.target.name] = !commonProps[e.target.name];
		this.setState({ commonProps });
	};

	private onChange = (e: React.ChangeEvent<any>) => {
		const values = this.state.values;
		values[e.target.name] = this.getValue(e.target);
		this.setState({ values });
	};

	render() {
		return (
			<main className="component">
				{this.renderCommonPropertyOptions()}
				<hr />
				{this.renderTextInput()}
				<hr />
				{this.renderTextArea()}
				<hr />
				{this.renderSelect()}
				<hr />
				{this.renderCheckbox()}
				<hr />
				{this.renderRadioButton()}
			</main>
		);
	}

	private renderCommonPropertyOptions() {
		const { disabled, required } = this.state.commonProps;
		return (
			<section>
				<h3>Common Input Properties</h3>
				<p>
					Change these common properties to see how they affect the appearance and behaviour of all input types on this
					page:
				</p>
				<form>
					<input type="checkbox" id="disabled" name="disabled" checked={disabled} onChange={this.onToggleCommonProp} />
					<label htmlFor="disabled">Disabled</label>
					<br />
					<input type="checkbox" id="required" name="required" checked={required} onChange={this.onToggleCommonProp} />
					<label htmlFor="required">Required</label>
				</form>
			</section>
		);
	}

	private renderTextInput() {
		const { values, commonProps } = this.state;
		return (
			<section>
				<h3>Text Input</h3>
				<form>
					<TitledMarkupGroup title="Explicit labelling (Label adjacent)">
						<div>
							<label htmlFor="text1">Enter text:</label>
							<input
								id="text1"
								type="text"
								name="text1"
								className="default-input"
								value={values['text1'] || ''}
								{...commonProps}
							/>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit labelling (Label wrapping)">
						<label>
							<span>Enter text:</span>
							<input
								type="text"
								name="text2"
								className="default-input"
								value={values['text2'] || ''}
								{...commonProps}
							/>
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="With placeholder">
						<input
							type="text"
							className="default-input"
							name="text3"
							value={values['text3'] || ''}
							{...commonProps}
							placeholder="Placeholder"
						/>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Email">
						<input type="email" className="default-input" name="text4" value={values['text4'] || ''} {...commonProps} />
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Password">
						<input
							type="password"
							className="default-input"
							name="text5"
							value={values['text5'] || ''}
							{...commonProps}
						/>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Number">
						<input
							type="number"
							className="default-input"
							name="text6"
							value={values['text6'] || ''}
							{...commonProps}
						/>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Search">
						<input
							type="search"
							className="default-input"
							name="text7"
							value={values['text7'] || ''}
							{...commonProps}
						/>
					</TitledMarkupGroup>
				</form>
			</section>
		);
	}

	private renderTextArea() {
		const { values, commonProps } = this.state;
		return (
			<section>
				<h3>Text Area</h3>
				<form>
					<TitledMarkupGroup title="Explicit labelling">
						<div>
							<label htmlFor="textarea1">Enter text:</label>
							<textarea id="textarea1" name="textarea1" value={values['textarea1']} {...commonProps} />
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit labelling">
						<label>
							<span>Enter text:</span>
							<textarea name="textarea2" value={values['textarea2']} {...commonProps} />
						</label>
					</TitledMarkupGroup>
				</form>
			</section>
		);
	}

	private renderSelect() {
		const { values, commonProps } = this.state;
		const values1 = values['select1'];
		const values2 = values['select2'];
		const values3 = values['select3'] || [];
		const values4 = values['select4'];
		return (
			<section>
				<h3>Select</h3>
				<form>
					<TitledMarkupGroup title="Explicit labelling">
						<div>
							<label htmlFor="select1">Select a value:</label>
							<select id="select1" name="select1" {...commonProps} value={values1} onChange={this.onChange}>
								<option value="1">Label 1</option>
								<option value="2">Label 2</option>
								<option value="3">Label 3</option>
							</select>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit labelling">
						<label>
							<span>Select a value:</span>
							<select name="select2" {...commonProps} value={values2} onChange={this.onChange}>
								<option value="1">Label 1</option>
								<option value="2">Label 2</option>
								<option value="3">Label 3</option>
							</select>
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Multiple">
						<select name="select3" multiple {...commonProps} value={values3} onChange={this.onChange}>
							<option value="1">Label 1</option>
							<option value="2">Label 2</option>
							<option value="3">Label 3</option>
						</select>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Option grouping">
						<select name="select4" {...commonProps} value={values4} onChange={this.onChange}>
							<optgroup label="Asia">
								<option value="1">Delhi</option>
								<option value="2">Hong Kong</option>
								<option value="3">Mumbai</option>
								<option value="4">Tokyo</option>
							</optgroup>
							<optgroup label="Europe">
								<option value="5">Amsterdam</option>
								<option value="6">London</option>
								<option value="7">Moscow</option>
							</optgroup>
							<optgroup label="North America">
								<option value="8">New York</option>
								<option value="9">Los Angeles</option>
							</optgroup>
						</select>
					</TitledMarkupGroup>
				</form>
			</section>
		);
	}

	private renderCheckbox() {
		const { values, commonProps } = this.state;
		return (
			<section>
				<h3>Checkbox</h3>
				<form>
					<TitledMarkupGroup title="Explicit with input first">
						<div>
							<input
								id="checkbox3"
								type="checkbox"
								name="checkbox3"
								checked={values['checkbox3'] || false}
								{...commonProps}
							/>
							<label htmlFor="checkbox3">Stay signed in</label>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Explicit with label first">
						<div>
							<label htmlFor="checkbox4">Stay signed in</label>
							<input
								id="checkbox4"
								type="checkbox"
								name="checkbox4"
								checked={values['checkbox4'] || false}
								{...commonProps}
							/>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit with input first">
						<label>
							<input type="checkbox" name="checkbox1" checked={values['checkbox1'] || false} {...commonProps} />
							<span>Stay signed in</span>
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit with label first">
						<label>
							<span>Stay signed in</span>
							<input type="checkbox" name="checkbox2" checked={values['checkbox2'] || false} {...commonProps} />
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Horizontal grouping">
						<fieldset className="fs">
							<legend>Select one:</legend>
							<input
								id="checkbox5"
								type="checkbox"
								name="checkbox5"
								checked={values['checkbox5'] || false}
								{...commonProps}
							/>
							<label htmlFor="checkbox5" className="label-inline">
								Option 1
							</label>
							<input
								id="checkbox6"
								type="checkbox"
								name="checkbox6"
								checked={values['checkbox6'] || false}
								{...commonProps}
							/>
							<label htmlFor="checkbox6" className="label-inline">
								Option 2
							</label>
							<input
								id="checkbox7"
								type="checkbox"
								name="checkbox7"
								checked={values['checkbox7'] || false}
								{...commonProps}
							/>
							<label htmlFor="checkbox7" className="label-inline">
								Option 3
							</label>
						</fieldset>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Vertical grouping">
						<fieldset className="fs">
							<legend>Select one:</legend>
							<div>
								<input
									id="checkbox8"
									type="checkbox"
									name="checkbox8"
									checked={values['checkbox8'] || false}
									{...commonProps}
								/>
								<label htmlFor="checkbox8" className="label-inline">
									Option 1
								</label>
							</div>
							<div>
								<input
									id="checkbox9"
									type="checkbox"
									name="checkbox9"
									checked={values['checkbox9'] || false}
									{...commonProps}
								/>
								<label htmlFor="checkbox9" className="label-inline">
									Option 2
								</label>
							</div>
							<div>
								<input
									id="checkbox10"
									type="checkbox"
									name="checkbox10"
									checked={values['checkbox10'] || false}
									{...commonProps}
								/>
								<label htmlFor="checkbox10" className="label-inline">
									Option 3
								</label>
							</div>
						</fieldset>
					</TitledMarkupGroup>
				</form>
			</section>
		);
	}

	private renderRadioButton() {
		const { values, commonProps } = this.state;
		return (
			<section>
				<h3>Radio Button</h3>
				<form>
					<TitledMarkupGroup title="Explicit with input first">
						<div>
							<input
								id="radio1"
								type="radio"
								name="radio1"
								value="option1"
								checked={values['radio1'] === 'option1'}
								{...commonProps}
							/>
							<label htmlFor="radio1">Option 1</label>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Explicit with label first">
						<div>
							<label htmlFor="radio2">Option 1</label>
							<input
								id="radio2"
								type="radio"
								name="radio2"
								value="option1"
								checked={values['radio2'] === 'option1'}
								{...commonProps}
							/>
						</div>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit with input first">
						<label>
							<input
								type="radio"
								name="radio3"
								value="option1"
								checked={values['radio3'] === 'option1'}
								{...commonProps}
							/>
							<span>Option 1</span>
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Implicit with label first">
						<label>
							<span>Option 1</span>
							<input
								type="radio"
								name="radio4"
								value="option1"
								checked={values['radio4'] === 'option1'}
								{...commonProps}
							/>
						</label>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Horizontal grouping">
						<fieldset className="fs">
							<legend>Select one:</legend>
							<input
								id="radio5option1"
								type="radio"
								name="radio5"
								value="option1"
								checked={values['radio5'] === 'option1'}
								{...commonProps}
							/>
							<label htmlFor="radio5option1" className="label-inline">
								Option 1
							</label>
							<input
								id="radio5option2"
								type="radio"
								name="radio5"
								value="option2"
								checked={values['radio5'] === 'option2'}
								{...commonProps}
							/>
							<label htmlFor="radio5option2" className="label-inline">
								Option 2
							</label>
							<input
								id="radio5option3"
								type="radio"
								name="radio5"
								value="option3"
								checked={values['radio5'] === 'option3'}
								{...commonProps}
							/>
							<label htmlFor="radio5option3" className="label-inline">
								Option 3
							</label>
						</fieldset>
					</TitledMarkupGroup>
					<TitledMarkupGroup title="Vertical grouping">
						<fieldset className="fs">
							<legend>Select one:</legend>
							<div>
								<input
									id="radio6option1"
									type="radio"
									name="radio6"
									value="option1"
									checked={values['radio6'] === 'option1'}
									{...commonProps}
								/>
								<label htmlFor="radio6option1" className="label-inline">
									Option 1
								</label>
							</div>
							<div>
								<input
									id="radio6option2"
									type="radio"
									name="radio6"
									value="option2"
									checked={values['radio6'] === 'option2'}
									{...commonProps}
								/>
								<label htmlFor="radio6option2" className="label-inline">
									Option 2
								</label>
							</div>
							<div>
								<input
									id="radio6option3"
									type="radio"
									name="radio6"
									value="option3"
									checked={values['radio6'] === 'option3'}
									{...commonProps}
								/>
								<label htmlFor="radio6option3" className="label-inline">
									Option 3
								</label>
							</div>
						</fieldset>
					</TitledMarkupGroup>
				</form>
			</section>
		);
	}
}

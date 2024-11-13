import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/tv/component/CtaButton';
import SVGPathIcon from 'shared/component/SVGPathIcon';

import './SvgEditor.scss';

export interface FieldInfo {
	name: string;
	label: string;
	min?: number;
	max?: number;
	text?: boolean;
	defaultValue: string | number;
}

export interface SvgEditorProps {
	title: string;
	fields: FieldInfo[];
	drawPath: (values: {}) => string;
	displayPath?: boolean;
	style?: any;
}

interface SvgEditorState {
	values?: {};
	path?: string;
}

const bem = new Bem('svg-editor');

export default class SvgEditor extends React.Component<SvgEditorProps, SvgEditorState> {
	static defaultProps = {
		displayPath: true
	};

	constructor(props: SvgEditorProps) {
		super(props);
		const values = props.fields.reduce((values, field) => {
			values[field.name] = field.defaultValue;
			return values;
		}, {});
		this.state = {
			values,
			path: props.drawPath(values)
		};
	}

	private getFieldInfo(name: string): FieldInfo {
		return this.props.fields.find(f => f.name === name);
	}

	private onInputChange = (e: React.ChangeEvent<any>) => {
		const { name, value } = e.target;
		const field = this.getFieldInfo(name);
		const values = this.state.values;
		values[name] = value;
		if (!field.text) {
			const floatValue = parseFloat(value);
			if (isNaN(floatValue)) {
				values[name] = '';
			} else if (field.min !== undefined && floatValue < field.min) {
				values[name] = field.min;
			} else if (field.max && floatValue > field.max) {
				values[name] = field.max;
			}
		}
		this.setState({ values });
	};

	private onSubmit = () => {
		const values = this.props.fields.reduce((values, field) => {
			const value = this.state.values[field.name];
			values[field.name] = field.text ? value : parseFloat(value) || 0;
			return values;
		}, {});
		this.setState({
			path: this.props.drawPath(values)
		});
	};

	render() {
		return (
			<fieldset className={bem.b()}>
				<legend>{this.props.title}</legend>
				<div className={bem.e('svg-group')}>
					<span style={this.props.style}>
						<SVGPathIcon data={this.state.path} className={bem.e('svg')} />
					</span>
					{this.renderForm()}
				</div>
				{this.renderPath()}
			</fieldset>
		);
	}

	private renderForm() {
		return (
			<form className={bem.e('form')}>
				{this.props.fields.map(this.renderInput)}
				<CtaButton className={bem.e('submit')} type="submit" label="Update" ordinal="primary" onClick={this.onSubmit} />
			</form>
		);
	}

	private renderInput = (field: FieldInfo) => {
		const inputProps = {
			id: this.props.title + '.' + field.name,
			className: bem.e('input'),
			name: field.name,
			value: this.state.values[field.name],
			onChange: this.onInputChange
		};

		if (!field || !field.label) return;

		return (
			<div key={field.name} className={bem.e('input-group', { text: field.text })}>
				<label className={bem.e('label')} htmlFor={inputProps.id}>
					{field.label}:
				</label>
				{field.text ? (
					<textarea {...inputProps} />
				) : (
					<input type="number" {...inputProps} min={field.min} max={field.max} />
				)}
			</div>
		);
	};

	private renderPath() {
		if (!this.props.displayPath) return;
		return (
			<div>
				<label>Path:</label>
				<textarea className={bem.e('path')} value={this.state.path} readOnly />
			</div>
		);
	}
}

import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { drawRect, drawCircle, drawPoly } from 'shared/util/svgs';
import SvgEditor, { SvgEditorProps } from './SvgEditor';

import './SvgPathDrawing.scss';

const EDITORS: SvgEditorProps[] = [
	{
		title: 'Rectangle',
		fields: [
			{
				name: 'x',
				label: 'X / left position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'y',
				label: 'Y / top position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'w',
				label: 'Width',
				defaultValue: 100,
				min: 0,
				max: 300
			},
			{
				name: 'h',
				label: 'Height',
				defaultValue: 40,
				min: 0,
				max: 300
			}
		],
		drawPath: (v: any): string => drawRect(v.x, v.y, v.w, v.h)
	},
	{
		title: 'Circle',
		fields: [
			{
				name: 'cx',
				label: 'Center x position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'cy',
				label: 'Center y position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'r',
				label: 'Radius',
				defaultValue: 25,
				min: 0,
				max: 300
			}
		],
		drawPath: (v: any): string => drawCircle(v.cx, v.cy, v.r)
	},
	{
		title: 'Polygon',
		fields: [
			{
				name: 'cx',
				label: 'Center x position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'cy',
				label: 'Center y position',
				defaultValue: 50,
				min: 0,
				max: 300
			},
			{
				name: 'n',
				label: 'Number of points',
				defaultValue: 5,
				min: 1,
				max: 99
			},
			{
				name: 'oRad',
				label: 'Outer radius',
				defaultValue: 24,
				min: 0,
				max: 300
			},
			{
				name: 'iRad',
				label: 'Inner radius',
				defaultValue: 12,
				min: 0,
				max: 300
			},
			{
				name: 'rot',
				label: 'Rotation',
				defaultValue: 0,
				min: 0,
				max: 360
			}
		],
		drawPath: (v: any): string => drawPoly(v.cx, v.cy, v.n, v.oRad, v.iRad, v.rot)
	},
	{
		title: 'Custom',
		fields: [
			{
				name: 'path',
				label: 'Path',
				text: true,
				defaultValue: drawRect(1, 1, 22, 22) + 'm8.5,7v7l5,-3.5l-5,-3.5zl2,4'
			}
		],
		drawPath: (v: any): string => v.path,
		displayPath: false
	}
];

const bem = new Bem('svg-color-form');

interface SvgPathDrawingState {
	fillColor?: string;
	strokeColor?: string;
	strokeWidth?: number;
}

export default class SvgPathDrawing extends React.Component<PageProps, SvgPathDrawingState> {
	constructor(props) {
		super(props);

		// The state stores the user inputted text. These may be invalid through user error.
		this.state = {
			fillColor: '#444',
			strokeColor: '#fff',
			strokeWidth: 3
		};
	}

	// Validates a hexidecimal colour - both short and long form.
	private hexRegex = /#[0-9a-f]{6}|#[0-9a-f]{3}/i;

	// Validated hex values using the state values as a basis.
	private fillHex: string;
	private strokeHex: string;
	private strokeWidth: string;

	private isValidHexColor(color: string): string {
		const matches = this.hexRegex.exec(color);
		return !matches ? undefined : matches[0];
	}

	private onFillColorChange = e => {
		e.preventDefault();
		const fillColor = e.target.value;
		this.setState({ fillColor });
	};

	private onStrokeColorChange = e => {
		e.preventDefault();
		const strokeColor = e.target.value;
		this.setState({ strokeColor });
	};

	private onStrokeWidthChange = e => {
		e.preventDefault();
		const strokeWidth = Number.parseInt(e.target.value) || 0;
		this.setState({ strokeWidth });
	};

	render() {
		const { fillColor, strokeColor, strokeWidth } = this.state;
		this.fillHex = this.isValidHexColor(fillColor);
		this.strokeHex = this.isValidHexColor(strokeColor);
		this.strokeWidth = Number.isNaN(strokeWidth) ? '0px' : `${strokeWidth}px`;
		return (
			<main className="svg-path-drawing component">
				<p>
					Use this tool for generating <strong>SVG Path</strong> values. It's recommended to then store the generated
					values as constants which you can pass into instances of <span className="pre">SVGPathIcon</span>, or use
					directly within an
					<em>svg</em> <span className="pre">path</span> element.
				</p>
				<form className={bem.b()}>
					<fieldset>
						<legend>Styling</legend>
						<div className={bem.e('input-group')}>
							<label className={bem.e('label')}>Fill: </label>
							<input type="text" value={fillColor} onChange={this.onFillColorChange} />
						</div>
						<div className={bem.e('input-group')}>
							<label className={bem.e('label')}>Stroke: </label>
							<input type="text" value={strokeColor} onChange={this.onStrokeColorChange} />
						</div>
						<div className={bem.e('input-group')}>
							<label className={bem.e('label')}>Stroke Width: </label>
							<input type="text" value={strokeWidth} onChange={this.onStrokeWidthChange} />
						</div>
					</fieldset>
				</form>
				{EDITORS.map(this.renderEditor)}
			</main>
		);
	}

	private renderEditor = (props: SvgEditorProps) => {
		const styles: any = {};
		if (this.fillHex) styles.color = this.fillHex;
		if (this.strokeHex) styles.stroke = this.strokeHex;
		if (this.strokeWidth) styles.strokeWidth = this.strokeWidth;
		return (
			<section key={props.title}>
				<SvgEditor {...props} style={styles} />
			</section>
		);
	};
}

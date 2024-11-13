import * as React from 'react';
import { Bem } from 'shared/util/styles';

import './Colours.scss';

const bem = new Bem('colours-view');

export default class Colours extends React.Component<any, any> {
	colourSquares: Array<any> = [];

	setColourSquareRef = element => {
		this.colourSquares.push(element);
	};

	render() {
		return (
			<main className="component">
				<h3 className={bem.e('h3')}>Brand colours</h3>
				<div className={bem.e('colourGroup')}>
					<h4>Primary colours</h4>
					{this.renderColourEntry('primary', 'Primary', ['Header background', 'Button background', 'Link hover'])}
					{this.renderColourEntry('primaryHover', 'Primary Hover', ['Button background - hover'])}
					{this.renderColourEntry('primaryDisabled', 'Primary disabled')}
				</div>
				<div className={bem.e('colourGroup')}>
					<h4>Secondary colours</h4>
					{this.renderColourEntry('secondary', 'Secondary')}
					{this.renderColourEntry('secondaryHover', 'Secondary Hover')}
					{this.renderColourEntry('secondaryDisabled', 'Secondary Disabled')}
				</div>
				<div className={bem.e('colourGroup')}>
					<h4>Complementary colour</h4>
					{this.renderColourEntry('complimentary', 'Complementary')}
				</div>
				<div className={bem.e('colourGroup')}>
					<h4>Background colours</h4>
					{this.renderColourEntry('appBGcolour', 'App background colour')}
				</div>
			</main>
		);
	}

	renderColourEntry(cssClass: string, displayName: string, usage: Array<string> = []) {
		return (
			<div className={bem.e('colourEntry')}>
				<div ref={this.setColourSquareRef} className={bem.e('colourSquare', cssClass)} />
				<p className={bem.e('p')}>{displayName} </p>
				<h5>Typical Usage</h5>
				<p>{usage.join(', ')}</p>
			</div>
		);
	}
}

import * as React from 'react';

import './TypestyleEntry.scss';

interface TypestyleEntryState {
	fontSize: string;
	fontFamily: string;
	lineHeight: string;
	color: string;
	textShadow: string;
}

interface TypestyleEntryProps {
	typeElement: any;
}

export default class TypestyleEntry extends React.Component<TypestyleEntryProps, TypestyleEntryState> {
	private componentRef;
	private myTimer = undefined;

	constructor(props) {
		super(props);

		this.state = {
			fontFamily: 'calculating...',
			fontSize: 'calculating...',
			lineHeight: 'calculating...',
			color: 'calculating...',
			textShadow: 'calculating...'
		};
	}

	private setTextInputRef = element => {
		this.componentRef = element;
	};

	calculateTypeSpecs() {
		const typeElement = this.componentRef.getElementsByClassName('text-node');
		const computedStyle = getComputedStyle(typeElement[0]);
		this.setState({
			fontFamily: computedStyle.fontFamily,
			fontSize: parseInt(computedStyle.fontSize).toString() + 'px',
			lineHeight: parseInt(computedStyle.lineHeight).toString() + 'px',
			color: computedStyle.color,
			textShadow: computedStyle.textShadow
		});
	}

	componentDidMount() {
		this.calculateTypeSpecs();
		const typestyleEntryComponent = this;

		window.addEventListener('resize', () => {
			clearTimeout(typestyleEntryComponent.myTimer);
			typestyleEntryComponent.myTimer = setTimeout(() => {
				this.calculateTypeSpecs();
			}, 250);
		});
	}
	render() {
		return (
			<div ref={this.setTextInputRef} className="type-style-entry">
				<div className="type-node">{this.props.typeElement}</div>
				<div className="type-spec">
					<p>Font-family: {this.state.fontFamily}</p>
					<p>Font-size: {this.state.fontSize}</p>
					<p>Line-height: {this.state.lineHeight}</p>
					<p>Color: {this.state.color}</p>
					<p>Text-shadow: {this.state.textShadow}</p>
				</div>
			</div>
		);
	}
}

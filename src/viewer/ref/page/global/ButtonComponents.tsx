import * as React from 'react';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountButton from 'ref/responsive/component/input/AccountButton';

import './ButtonComponents.scss';

const reallyLongText =
	"This is a really long label, and by really long I mean REALLY Long. I'm now going to recite The Hobbit. In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with ends of worms and a oozy smell, nor yet a dry, bare sandy hole with nothing in it to sit down on or eat : it was a hobbit-hole, and that means comfort.";
const reallyShortText = 'a';
const reallyLongTitle = 'Really Long';

interface ButtonComponentState {
	loadingButtons: Set<string>;
	loaderRightSide: Set<string>;
}

export default class ButtonComponents extends React.Component<PageProps, ButtonComponentState> {
	state: ButtonComponentState = {
		loadingButtons: new Set(),
		loaderRightSide: new Set()
	};

	swapLoadingStates = (key: string) => {
		const { loadingButtons } = this.state;
		if (loadingButtons.has(key)) {
			loadingButtons.delete(key);
		} else {
			loadingButtons.add(key);
		}
		this.setState({ loadingButtons });
	};

	swapLoaderSides = (key: string) => {
		const { loaderRightSide } = this.state;
		if (loaderRightSide.has(key)) {
			loaderRightSide.delete(key);
		} else {
			loaderRightSide.add(key);
		}
		this.setState({ loaderRightSide });
	};

	onClick = () => {
		console.log('Clicked button!');
	};

	renderCTAButtonGroup(
		heading: string,
		text: string,
		options: { large?: boolean; small?: boolean; theme?: 'light' | 'dark' | 'blue' }
	) {
		return (
			<div className="cta-btns">
				<h4>{heading}</h4>
				{heading !== reallyLongTitle && (
					<CtaButton ordinal="primary" onClick={this.onClick} {...options}>
						{reallyShortText}
					</CtaButton>
				)}
				<CtaButton ordinal="primary" onClick={this.onClick} {...options}>
					Primary {text}
				</CtaButton>
				<CtaButton ordinal="primary" onClick={this.onClick} disabled {...options}>
					Primary {text} disabled
				</CtaButton>
				<CtaButton ordinal="secondary" onClick={this.onClick} {...options}>
					Secondary {text}
				</CtaButton>
				<CtaButton ordinal="secondary" onClick={this.onClick} disabled {...options}>
					Secondary {text} disabled
				</CtaButton>
				<CtaButton ordinal="naked" onClick={this.onClick} {...options}>
					Naked {text}
				</CtaButton>
				<CtaButton ordinal="naked" onClick={this.onClick} disabled {...options}>
					Naked {text} disabled
				</CtaButton>
			</div>
		);
	}

	renderAccountButtonGroup(
		heading: string,
		text: string,
		options: { large?: boolean; small?: boolean; theme?: 'light' | 'dark' | 'blue' }
	) {
		return (
			<div className="cta-btns">
				<h4>{heading}</h4>
				{heading !== reallyLongTitle &&
					this.renderAccountButton(`${heading}-0`, reallyShortText, { ordinal: 'primary', ...options })}
				{this.renderAccountButton(`${heading}-1`, `Primary ${text}`, { ordinal: 'primary', ...options })}
				{this.renderAccountButton(`${heading}-3`, `Primary Disabled ${text}`, {
					ordinal: 'primary',
					disabled: true,
					...options
				})}
				{this.renderAccountButton(`${heading}-4`, `Secondary ${text}`, { ordinal: 'secondary', ...options })}
				{this.renderAccountButton(`${heading}-5`, `Secondary Disabled ${text}`, {
					ordinal: 'secondary',
					disabled: true,
					...options
				})}
				{this.renderAccountButton(`${heading}-6`, `Naked ${text}`, {
					ordinal: 'naked',
					...options
				})}
				{this.renderAccountButton(`${heading}-7`, `Naked Disabled ${text}`, {
					ordinal: 'naked',
					disabled: true,
					...options
				})}
			</div>
		);
	}

	renderAccountButton(key, text, options = {}) {
		return (
			<div className="account-button">
				<label>
					<input type="checkbox" onChange={() => this.swapLoadingStates(key)} />
					Disable Loading State
				</label>
				<label>
					<input type="checkbox" onChange={() => this.swapLoaderSides(key)} />
					Loader Right Side
				</label>
				<AccountButton
					ordinal="primary"
					loading={!this.state.loadingButtons.has(key)}
					spinnerLocation={this.state.loaderRightSide.has(key) ? 'right' : 'left'}
					onClick={this.onClick}
					{...options}
				>
					{text}
				</AccountButton>
			</div>
		);
	}

	renderLoadingAccountButtonGroup(
		heading: string,
		options: { large?: boolean; small?: boolean; theme?: 'light' | 'dark' | 'blue' } = {}
	) {
		return (
			<div className="cta-btns">
				<h4>{heading}</h4>
				{this.renderAccountButton(`${heading}-1`, 'Primary Spinner', { ordinal: 'primary', ...options })}
				{this.renderAccountButton(`${heading}-2`, 'Primary Spinner Disabled', {
					ordinal: 'primary',
					disabled: true,
					...options
				})}
				{this.renderAccountButton(`${heading}-3`, 'Secondary Spinner', { ordinal: 'secondary', ...options })}
				{this.renderAccountButton(`${heading}-4`, 'Secondary Spinner Disabled', {
					ordinal: 'secondary',
					disabled: true,
					...options
				})}
				{this.renderAccountButton(`${heading}-5`, 'Naked Spinner', { ordinal: 'naked', ...options })}
				{this.renderAccountButton(`${heading}-6`, 'Naked Spinner Disabled', {
					ordinal: 'naked',
					disabled: true,
					...options
				})}
			</div>
		);
	}

	render() {
		return (
			<main className="component">
				<h3>Call to Action Button Component</h3>
				<section>
					<p>The CTA Button supports multiple visual states and sizes:</p>
					<h4>Dark Background</h4>
					<div>
						<div className="button-group">
							{this.renderCTAButtonGroup('Small', 'small', { small: true, theme: 'dark' })}
							{this.renderCTAButtonGroup('Regular', 'regular', { theme: 'dark' })}
							{this.renderCTAButtonGroup('Large', 'large', { large: true, theme: 'dark' })}
							{this.renderCTAButtonGroup(reallyLongTitle, reallyLongText, { theme: 'dark' })}
						</div>
					</div>
					<h4>White background</h4>
					<div className="dark-theme">
						<div className="button-group">
							{this.renderCTAButtonGroup('Small', 'small', { small: true, theme: 'light' })}
							{this.renderCTAButtonGroup('Regular', 'regular', { theme: 'light' })}
							{this.renderCTAButtonGroup('Large', 'large', { large: true, theme: 'light' })}
							{this.renderCTAButtonGroup(reallyLongTitle, reallyLongText, { theme: 'light' })}
						</div>
					</div>
					<h4>Blue background</h4>
					<div className="light-theme">
						<div className="button-group">
							{this.renderCTAButtonGroup('Small', 'small', { small: true, theme: 'blue' })}
							{this.renderCTAButtonGroup('Regular', 'regular', { theme: 'blue' })}
							{this.renderCTAButtonGroup('Large', 'large', { large: true, theme: 'blue' })}
							{this.renderCTAButtonGroup(reallyLongTitle, reallyLongText, { theme: 'blue' })}
						</div>
					</div>
				</section>
				<hr />
				<h3>Account Button Component</h3>
				<p>Account buttons are mostly CTA buttons as above but with a loader</p>
				<section>
					<h4>Sizes</h4>
					<div className="button-group">
						{this.renderAccountButtonGroup('Small', 'small', { small: true, theme: 'dark' })}
						{this.renderAccountButtonGroup('Regular', 'regular', { theme: 'dark' })}
						{this.renderAccountButtonGroup('Large', 'large', { large: true, theme: 'dark' })}
						{this.renderAccountButtonGroup(reallyLongTitle, reallyLongText, { theme: 'dark' })}
					</div>
					<h4>Loader Themes</h4>

					<div className="button-group">
						<div>{this.renderLoadingAccountButtonGroup('Dark Theme', { theme: 'dark' })}</div>
						<div className="dark-theme">{this.renderLoadingAccountButtonGroup('Light Theme', { theme: 'light' })}</div>
						<div className="light-theme">{this.renderLoadingAccountButtonGroup('Blue Theme', { theme: 'blue' })}</div>
					</div>
				</section>
			</main>
		);
	}
}

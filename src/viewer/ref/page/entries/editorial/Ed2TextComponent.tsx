import * as React from 'react';
import Ed2Text from 'ref/responsive/pageEntry/editorial/Ed2Text';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

const text = {
	text: `<h1 id=\"in-the-north\">In the North</h1><h2 id=\"in-the-north-2\">In the North</h2><h3 id=\"in-the-north-3\">
	In the North</h3><h4 id=\"in-the-north-4\">In the North</h4><p>In <strong>Winterfell</strong>,
	<a href=\"http://gameofthrones.wikia.com/wiki/Bran_Stark\">Bran Stark</a> has a nightmare in which he sees a three-eyed raven,
	sitting on one of the stone direwolves outside the doorway to the Stark crypts. He wakes up to find his direwolf Summer by his side.
	Theon Greyjoy summons Hodor, the castle's dim-witted stableboy, who can only say the word <strong>&quot;Hodor&quot;</strong>,
	to help carry Bran down to the great hall.</p><ul><li>Winter Is Coming</li><li>The Kingsroad</li><li>Lord Snow</li></ul><ol>
	<li>Winter Is Coming</li><li>The Kingsroad</li><li>Lord Snow</li></ol><blockquote><p>Never forget what you are, for surely the world will not. Make it your strength.
	Then it can never be your weakness. Armour yourself in it, and it will never be used to hurt you.</p></blockquote>`
};

const ed2MockEntry = createMockPageEntry('ED2', 'CRIPPLES, BASTARDS, AND BROKEN THINGS', 'ED2');

export default class Ed2TextComponent extends React.Component<PageEntryTextProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			titleColor: '',
			tagline: '',
			hAlign: 'left',
			theme: 'default'
		};
	}

	private onChange = e => {
		let { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onChangeTheme = e => {
		this.setState({ theme: e.target.value }, this.appendThemeClass);
	};

	private appendThemeClass() {
		document.getElementById('ed2-wrap').classList.toggle('app--account');
	}

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderEd2()}
			</div>
		);
	}

	private renderForm() {
		const { color, tagline, hAlign, theme } = this.state;
		return (
			<form>
				<fieldset className="fs">
					<legend>Page Theme:</legend>
					<input
						id="theme1"
						type="radio"
						name="theme"
						value="default"
						checked={theme === 'default'}
						onChange={this.onChangeTheme}
					/>
					<label htmlFor="theme1" className="label-inline">
						Default App
					</label>
					<input
						id="theme2"
						type="radio"
						name="theme"
						value="account"
						checked={theme === 'account'}
						onChange={this.onChangeTheme}
					/>
					<label htmlFor="theme2" className="label-inline">
						Account Page
					</label>
				</fieldset>
				<fieldset className="fs">
					<legend>Custom Fields (optional):</legend>
					<input
						name="tagline"
						type="text"
						value={tagline}
						placeholder="Enter Tagline"
						className="default-input"
						onChange={this.onChange}
					/>
					<div>
						<label>
							<strong>Colour:</strong>
							<input
								name="titleColor"
								type="text"
								className="default-input"
								value={color}
								placeholder="Hexadecimal Color (#FFF)"
								onChange={this.onChange}
							/>
						</label>
					</div>
					<br />
					<strong>Horizontal Alignment:</strong>
					<div>
						<input
							id="hAlign1"
							type="radio"
							name="hAlign"
							value="left"
							checked={hAlign === 'left'}
							onChange={this.onChange}
						/>
						<label htmlFor="hAlign1" className="label-inline">
							Left
						</label>
						<input
							id="hAlign2"
							type="radio"
							name="hAlign"
							value="center"
							checked={hAlign === 'center'}
							onChange={this.onChange}
						/>
						<label htmlFor="hAlign2" className="label-inline">
							Center
						</label>
						<input
							id="hAlign3"
							type="radio"
							name="hAlign"
							value="right"
							checked={hAlign === 'right'}
							onChange={this.onChange}
						/>
						<label htmlFor="hAlign3" className="label-inline">
							Right
						</label>
					</div>
				</fieldset>
			</form>
		);
	}

	private renderEd2() {
		const { titleColor, tagline, hAlign } = this.state;
		const mockData = Object.assign({}, text, ed2MockEntry, {
			customFields: {
				textColor: {
					color: titleColor
				},
				textHorizontalAlignment: hAlign,
				customTagline: tagline
			}
		});
		return (
			<div id="ed2-wrap">
				<div className="page-entry clearfix">
					<Ed2Text {...mockData} />
				</div>
			</div>
		);
	}
}

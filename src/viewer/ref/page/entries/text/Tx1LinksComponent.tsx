import * as React from 'react';
import * as cx from 'classnames';
import { Tx1Links as TemplateKey } from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Tx1Links from 'ref/responsive/pageEntry/text/Tx1Links';

const mock: any = {
	id: 'tx1',
	template: TemplateKey,
	title: 'TX1 - Links',
	list: {
		items: []
	},
	savedState: {},
	customFields: {
		title: 'Label',
		moreLinkUrl: 'http://massive.co/',
		textColor: {
			color: '',
			opacity: 100
		},
		backgroundColor: {
			color: '',
			opacity: 100
		}
	},
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	}
};

export default class Tx1LinksComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			mock: {
				...mock,
				list: props.list
			},
			title: 'Label',
			moreLinkUrl: 'http://massive.co/',
			textColor: '',
			backgroundColor: ''
		};
	}

	private onChange = e => {
		let { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onListChange = list => {
		const mock = { ...this.state.mock, list };
		this.setState({ mock });
	};

	private renderForm() {
		const { textColor, backgroundColor } = this.state;
		return (
			<form>
				<fieldset className="fs">
					<legend>Custom Fields</legend>
					<div className="ed5-demo__settings-col">
						<label htmlFor="btnTextColor">Text Colour</label>
						<div>
							<input
								id="btnTextColor"
								className={cx('default-input', 'ed5-demo__color-hex', { 'is-default-color': !textColor })}
								type="text"
								name="textColor"
								value={textColor}
								onChange={this.onChange}
							/>
							<input
								id="btnTextColorPicker"
								type="color"
								className={cx('ed5-demo__color-picker', { 'is-default-color': !textColor })}
								name="textColor"
								value={textColor}
								onChange={this.onChange}
							/>
						</div>
						<br />
					</div>
					<div className="ed5-demo__settings-col">
						<label htmlFor="btnBackgroundColor">Background Colour</label>
						<div>
							<input
								id="btnBackgroundColor"
								className={cx('default-input', 'ed5-demo__color-hex', { 'is-default-color': !backgroundColor })}
								type="text"
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
							/>
							<input
								id="btnBackgroundColorPicker"
								type="color"
								className={cx('ed5-demo__color-picker', { 'is-default-color': !backgroundColor })}
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
							/>
						</div>
						<br />
					</div>
					<div className="col col-24">
						<p>If no custom colour is specified, the default colourscheme for the button is applied.</p>
					</div>
				</fieldset>

				<ListSearch onListChange={this.onListChange} />
			</form>
		);
	}

	private getAugmentedMock() {
		const { mock, textColor, backgroundColor } = this.state;
		return {
			...mock,
			customFields: {
				...mock.customFields,
				textColor: {
					color: textColor,
					opacity: 100
				},
				backgroundColor: {
					color: backgroundColor,
					opacity: 100
				}
			}
		};
	}

	private renderTx1() {
		return (
			<div className="page-entry">
				<Tx1Links {...this.getAugmentedMock()} />
			</div>
		);
	}

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderTx1()}
			</div>
		);
	}
}

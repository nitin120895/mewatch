import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import AutoplayDelay from 'viewer/ref/component/AutoplayDelay';
import Header from 'ref/responsive/app/header/Header';

import './H1StandardComponent.scss';

const images = {
	hero3x1: `http://lorempixel.com/1920/640/technics/`,
	hero4x3: `http://lorempixel.com/1200/900/technics/`,
	badge: `http://lorempixel.com/200/200/technics/`,
	brand: 'http://lorempixel.com/414/136/technics/'
};

const mock: PageEntryListProps = {
	list: undefined,
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	},
	savedState: '',
	template: 'Carousel Component',
	title: '',
	customFields: {
		autoCycle: 0,
		textHorizontalAlignment: 'left',
		textVerticalAlignment: 'bottom'
	},
	id: 'CC'
};

interface CarouselComponentProps {
	positionToggles?: boolean;
}

export default class CarouselComponent extends React.Component<CarouselComponentProps, any> {
	static defaultProps = {
		positionToggles: true
	};

	private storedList = undefined;

	constructor(props) {
		super(props);
		this.state = {
			badge: true,
			brand: true,
			hero3x1: true,
			hero4x3: true,
			textHorizontalAlignment: 'left',
			textVerticalAlignment: 'bottom',
			list: {
				items: []
			},
			autoCycle: 8,
			autoPlayToggle: true,
			autoPlayIsEnabled: true
		};
	}

	private onCheckBoxChange = e => {
		const imgType = e.target.name;
		const checkBoxChecked = e.target.checked;
		this.refreshList(imgType, checkBoxChecked);
	};

	private onRadioChange = e => {
		this.setState({ [e.target.name]: e.target.value });
	};

	private onListChange = list => {
		// Deep clone to store old images
		this.storedList = JSON.parse(JSON.stringify(list));

		const imageTypes = Object.keys(images);

		list.items = list.items.map(item => {
			if (item.images) {
				imageTypes.forEach(type => {
					item.images[type] = item.images[type] || images[type];
				});
			} else item.images = images;

			return item;
		});

		this.setState({ list: list }, () => {
			imageTypes.forEach(type => {
				this.refreshList(type, this.state[type]);
			});
		});
	};

	private refreshList(imgType, enabled) {
		const { list } = this.state;

		list.items = list.items.map((item, i) => {
			if (enabled) {
				item.images[imgType] = this.storedList.items[i].images[imgType] || images[imgType];
			} else delete item.images[imgType];
			return item;
		});

		this.setState({
			[imgType]: enabled,
			list: Object.assign({}, list)
		});
	}

	private seconds = val => {
		this.setState({ autoCycle: val });
	};

	// if auto play state changes via tick box
	private toggleAutoPlay = e => {
		this.setState({
			autoPlayToggle: !this.state.autoPlayToggle
		});
	};

	// if auto play state changes internally
	private onAutoPlayingChange = state => {
		this.setState({
			autoPlayRunning: state
		});
	};

	// if auto play state changes internally
	private onAutoPlayEnabledChange = state => {
		this.setState({
			autoPlayIsEnabled: state,
			autoPlayToggle: state
		});
	};

	render() {
		const {
			textHorizontalAlignment,
			textVerticalAlignment,
			badge,
			list,
			brand,
			autoPlayToggle,
			autoPlayRunning
		} = this.state;

		const propsMock = Object.assign(mock, {
			list,
			customFields: {
				autoCycle: Number(this.state.autoCycle) || 0,
				textHorizontalAlignment: textHorizontalAlignment,
				textVerticalAlignment: textVerticalAlignment
			},
			autoPlayToggle: autoPlayToggle,
			onAutoPlayingChange: this.onAutoPlayingChange,
			onAutoPlayEnabledChange: this.onAutoPlayEnabledChange
		});

		const childrenWithProps = React.Children.map(this.props.children, child =>
			React.cloneElement(child as React.CElement<any, any>, propsMock)
		);

		return (
			<main className="component">
				<ListSearch onListChange={this.onListChange} />
				<AutoplayDelay
					seconds={this.seconds}
					autoPlayIsEnabled={autoPlayToggle}
					toggleAutoPlay={this.toggleAutoPlay}
					autoPlayIsRunning={autoPlayRunning}
				/>
				<p>
					<b>Image Types</b>
					<br />
					Toggling the below inputs while the carousel is in transition will cancel the current animation.
					<br />
					<label htmlFor="badge">Badge</label>
					<input type="checkbox" checked={badge} onChange={this.onCheckBoxChange} name="badge" id="badge" />
					<label htmlFor="badge">Brand</label>
					<input type="checkbox" checked={brand} onChange={this.onCheckBoxChange} name="brand" id="brand" />
				</p>
				{this.props.positionToggles && this.renderPositionToggles()}
				<section className="h1-header-wrapper">
					<Header className="header-full-bleed h1-header" forceHeroMode />
					{childrenWithProps}
				</section>
			</main>
		);
	}

	renderPositionToggles() {
		const { textHorizontalAlignment, textVerticalAlignment } = this.state;
		return (
			<div>
				<p>
					<b>Vertical Text Position</b>
					<br />
					<input
						id="top"
						type="radio"
						name="textVerticalAlignment"
						value="top"
						checked={textVerticalAlignment === 'top'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="top">Top</label>
					<input
						type="radio"
						name="textVerticalAlignment"
						value="middle"
						id="middle"
						checked={textVerticalAlignment === 'middle'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="middle">Middle</label>
					<input
						type="radio"
						name="textVerticalAlignment"
						value="bottom"
						id="bottom"
						checked={textVerticalAlignment === 'bottom'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="bottom">Bottom</label>
				</p>
				<p>
					<b>Horizontal Text Position</b>
					<br />
					<input
						id="left"
						type="radio"
						name="textHorizontalAlignment"
						value="left"
						checked={textHorizontalAlignment === 'left'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="left">Left</label>
					<input
						type="radio"
						name="textHorizontalAlignment"
						value="center"
						id="center"
						checked={textHorizontalAlignment === 'center'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="center">Center</label>
					<input
						type="radio"
						name="textHorizontalAlignment"
						value="right"
						id="right"
						checked={textHorizontalAlignment === 'right'}
						onChange={this.onRadioChange}
					/>
					<label htmlFor="right">Right</label>
				</p>
			</div>
		);
	}
}

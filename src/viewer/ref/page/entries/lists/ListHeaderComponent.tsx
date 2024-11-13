import * as React from 'react';
import { connect } from 'react-redux';
import Header from 'ref/responsive/app/header/Header';
import LH1Standard from 'ref/responsive/pageEntry/lists/ListHeader';
import Picture from 'shared/component/Picture';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import CollapsibleFieldSet from 'viewer/ui/CollapsibleFieldSet';

import './ListHeaderComponent.scss';

const images = {
	wallpaper: `http://lorempixel.com/1920/1080/transport/`,
	badge: `http://lorempixel.com/200/200/transport/`,
	brand: `http://lorempixel.com/1579/715/transport/`
};

const longTitle = 'Fantastic Beasts and Where to Find Them';
const shortTitle = 'Fantastic Beasts';

const mockList = {
	images: {},
	description:
		'This the the list description. Discover strange new worlds in this curated collection of out of this world sci fi & fantasy movies that will take you on a journey into the unknown This the the list description. Discover strange new worlds in this curated collection of out of this world sci fi & fantasy movies that will take you on a journey into the unknown',
	title: shortTitle,
	tagline: 'This is a list tagline'
};

const mock: PageEntryListProps = {
	list: undefined,
	loadNextListPage: undefined,
	loadListPage: undefined,
	id: 'lh',
	title: 'LH Page',
	template: 'LH',
	savedState: {}
};

class Lh1StandardComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			wallpaper: false,
			brand: false,
			badge: false,
			list: mockList,
			titleCheck: false,
			title: shortTitle,
			showDescription: true,
			showTagline: true,
			images: images
		};
	}

	private onChange = e => {
		const imgType = e.target.name;
		const checkBoxChecked = e.target.checked;
		this.refreshList(imgType, checkBoxChecked);
	};

	private onTitleChange = e => {
		const list = Object.assign({}, this.state.list);
		list.title = e.target.checked ? longTitle : shortTitle;
		this.setState({
			titleCheck: e.target.checked,
			list
		});
	};

	private onDescChange = e => {
		const showDescription = e.target.checked;
		const list = Object.assign({}, this.state.list);
		list.description = showDescription ? mockList.description : undefined;
		this.setState({
			showDescription,
			list
		});
	};

	private onTaglineChange = e => {
		const showTagline = e.target.checked;
		const list = Object.assign({}, this.state.list);
		list.tagline = showTagline ? mockList.tagline : undefined;
		this.setState({
			showTagline,
			list
		});
	};

	private onListChange = list => {
		const imageTypes = Object.keys(images);
		if (list.images) {
			imageTypes.forEach(type => {
				list.images[type] = list.images[type] || images[type];
			});
		} else list.images = images;

		this.setState({ images: list.images }, () => {
			imageTypes.forEach(type => {
				this.refreshList(type, this.state[type]);
			});
		});
	};

	private refreshList(imgType, enabled) {
		const list = Object.assign({}, this.state.list);
		if (enabled && this.state.images) {
			list.images[imgType] = this.state.images[imgType];
		} else delete list.images[imgType];
		this.setState({
			[imgType]: enabled,
			list
		});
	}

	render() {
		const { backgroundImage } = this.props;
		const entry = Object.assign({}, mock, { list: this.state.list });
		return (
			<div>
				<p>This component is both LH1 and LFH1, has been named as ListHeader so it can be agnostic.</p>
				<ListSearch onListChange={this.onListChange} />
				{this.renderForm()}
				<div className={'hero-demo'}>
					<Header className="header-full-bleed" forceHeroMode />
					{this.renderBackground(backgroundImage)}
					<div className="content">
						<div className="page-entry page-entry--hero">
							<LH1Standard {...entry} />
						</div>
						<div className="page-entry">
							<span>This is example content indicative of where the next content row sits.</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private renderForm = () => {
		const { wallpaper, brand, badge, titleCheck, showDescription, showTagline } = this.state;
		return (
			<form className="input-toggler">
				<CollapsibleFieldSet label="Layout">
					<label>
						<input type="checkbox" name="wallpaper" checked={wallpaper} onChange={this.onChange} />
						Background Image
					</label>
					<label>
						<input type="checkbox" name="brand" checked={brand} disabled={titleCheck} onChange={this.onChange} />
						Brand Image
					</label>
					<label>
						<input type="checkbox" name="badge" checked={badge} onChange={this.onChange} />
						Badge Image
					</label>
					<label>
						<input type="checkbox" name="title" checked={titleCheck} disabled={brand} onChange={this.onTitleChange} />
						Long Title
					</label>
					<label>
						<input type="checkbox" name="tagline" checked={showTagline} onChange={this.onTaglineChange} />
						Show Tagline
					</label>
					<label>
						<input type="checkbox" name="description" checked={showDescription} onChange={this.onDescChange} />
						Show Description
					</label>
				</CollapsibleFieldSet>
			</form>
		);
	};

	private renderBackground(backgroundImage) {
		if (!backgroundImage || !backgroundImage.sources || !backgroundImage.sources.length) return false;
		return (
			<Picture
				src={backgroundImage.sources[0].src}
				sources={backgroundImage.sources}
				className="app-background header-full-bleed app-background--lh1"
				imageClassName={'app__image'}
			/>
		);
	}
}

function mapStateToProps({ app }) {
	return {
		backgroundImage: app.backgroundImage
	};
}

export default connect<any, any, any>(mapStateToProps)(Lh1StandardComponent);

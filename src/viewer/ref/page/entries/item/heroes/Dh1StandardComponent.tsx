import * as React from 'react';
import { connect } from 'react-redux';
import Picture from 'shared/component/Picture';
import Dh1Standard from 'ref/responsive/pageEntry/itemDetail/dh1/Dh1Standard';
import ItemSearch from 'viewer/ref/component/itemSearch/ItemSearch';
import Header from 'ref/responsive/app/header/Header';

const mockEntry: PageEntryItemDetailProps = {
	title: 'DH1 Example',
	item: undefined,
	itemDetailCache: {},
	template: 'DH1',
	savedState: {},
	id: 'dh1'
};

class Dh1StandardComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			item: undefined
		};
	}

	resetItem(item) {
		this.setState({ item });
	}

	render() {
		const { backgroundImage } = this.props;
		const { item } = this.state;
		return (
			<div>
				<ItemSearch resetParent={item => this.resetItem(item)} includeDetail={true} />
				<div className={'hero-demo'}>
					<Header className="header-full-bleed" forceHeroMode />
					{this.renderBackground(backgroundImage)}
					<main className="component app-bg">{this.renderHero(item)}</main>
				</div>
			</div>
		);
	}

	private renderHero(item: api.ItemDetail) {
		// Wait for the loaded item from ItemSearch before rendering the hero component.
		if (!item) return false;
		const props: PageEntryItemDetailProps = Object.assign({}, mockEntry, {
			item
		});
		return <Dh1Standard {...props} />;
	}

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

export default connect<any, any, any>(mapStateToProps)(Dh1StandardComponent);

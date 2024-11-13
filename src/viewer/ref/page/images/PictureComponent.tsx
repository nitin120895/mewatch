import * as React from 'react';
import Picture from 'shared/component/Picture';
import TitledComponent from '../../component/TitledComponent';
import ItemSearch from '../../component/itemSearch/ItemSearch';
import { resolveImages } from 'shared/util/images';

export default class PictureComponent extends React.Component<PageProps, any> {
	item: api.ItemDetail;

	constructor(props) {
		super(props);
		this.state = { item: undefined };
	}

	resetItem(item) {
		this.setState({ item });
	}

	render() {
		const { item } = this.state;
		return (
			<section className="component">
				<ItemSearch resetParent={item => this.resetItem(item)} />
				{item ? this.renderComponents(item) : <h3>Loading...</h3>}
			</section>
		);
	}

	renderComponents(item) {
		const poster = resolveImages(item.images, 'poster', { width: 200 })[0].src;
		const tile = resolveImages(item.images, 'tile', { width: 300 })[0].src;
		const wallpaper = resolveImages(item.images, 'wallpaper', { width: 680 })[0].src;
		const sources = [
			{ src: tile, mediaQuery: '(min-width: 321px) and (max-width: 729px)' },
			{ src: wallpaper, mediaQuery: '(min-width: 730px)' }
		];
		return (
			<TitledComponent
				title="Picture based on media query with size change"
				subtitle="Image source changes depending on media query. Includes change in image size. Breakpoint at 730px."
			>
				<pre>
					<span>{`<Picture src={poster} sources={ { src: tile, mediaQuery: '(min-width: 321px) and (max-width: 729px)' }, { src: wallpaper, mediaQuery: '(min-width: 730px)' } } description="description" />`}</span>
					<span>{`\n\nOutputs to:`}</span>
					<span>{`\n\n<picture>`}</span>
					<span>{`\n\t<source src="tile.jpg" media="(min-width: 320px) and (max-width: 729px)">`}</span>
					<span>{`\n\t<source src="wallpaper.jpg" media="(min-width: 730px)">`}</span>
					<span>{`\n\t<img src="poster.jpg" alt="description">`}</span>
					<span>{`\n</picture>`}</span>
				</pre>
				<Picture src={poster} sources={sources} description="description" />
			</TitledComponent>
		);
	}
}

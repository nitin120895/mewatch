import * as React from 'react';
import Image from 'shared/component/Image';
import ItemSearch from '../../component/itemSearch/ItemSearch';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import TitledComponent from '../../component/TitledComponent';

export default class ImageComponent extends React.Component<PageProps, any> {
	item: api.ItemDetail;
	itemSearch: HTMLElement;

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
		const images = resolveImages(item.images, 'poster', { width: 200 });
		// srcSet based on pixel ratio.
		const srcSetPR = images.map(source => convertResourceToSrcSet(source, true));
		// srcSet based on relative width.
		const srcSetWidth = images.map(source => convertResourceToSrcSet(source, false));
		return (
			<div>
				<TitledComponent title="Single source image">
					<pre>
						<span>{`<img src="the-imitation-game.jpg" alt="description" width="200" height="300">`}</span>
					</pre>
					<Image src={images[0].src} description="description" width={200} height={300} />
				</TitledComponent>
				<TitledComponent
					title="Multiple source image for different pixel ratios"
					subtitle="Browser will choose the src image that corresponds with the display pixel ratio."
				>
					<pre>
						<span>{`<img src="the-imitation-game.jpg" srcSet="the-imitation-game-1.jpg 1x, the-imitation-game-1.5.jpg 1.5x, the-imitation-game-2.jpg 2x, the-imitation-game-3.jpg 3x" width="200" height="300">`}</span>
					</pre>
					<Image srcSet={srcSetPR} width={200} height={300} />
				</TitledComponent>
				<TitledComponent
					title="Multiple source image for different relative widths"
					subtitle="Browser will calculate and choose the src image that corresponds with the image width and display pixel ratio."
				>
					<pre>
						<span>{`<img src="the-imitation-game.jpg" srcSet="the-imitation-game-200.jpg 200w, the-imitation-game-300.jpg 300w, the-imitation-game-400.jpg 400w, the-imitation-game-600.jpg 600w" sizes="50vw">`}</span>
					</pre>
					<Image srcSet={srcSetWidth} sizes={[{ length: '50vw' }]} />
				</TitledComponent>
			</div>
		);
	}
}

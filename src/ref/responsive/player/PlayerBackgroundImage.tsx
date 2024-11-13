import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { BREAKPOINT_RANGES } from '../util/grid';
import { resolveImages } from 'shared/util/images';
import Picture from 'shared/component/Picture';

import './PlayerBackgroundImage.scss';

const tabletBreakpoint = BREAKPOINT_RANGES['phablet'];
const desktopBreakpoint = BREAKPOINT_RANGES['desktop'];

const mobileBp = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const tabletBp = `(min-width: ${tabletBreakpoint.min}px) and (max-width: ${desktopBreakpoint.min - 1}px)`;
const desktopBp = `(min-width: ${desktopBreakpoint.min}px)`;

const bem = new Bem('background-image');

interface PlayerBackgroundImageProps {
	item: api.ItemDetail;
}

interface PlayerBackgroundImageState {
	imageSources: image.Source[];
}

export default class PlayerBackgroundImage extends React.Component<
	PlayerBackgroundImageProps,
	PlayerBackgroundImageState
> {
	state = {
		imageSources: []
	};

	componentDidMount() {
		this.getImageSources();
	}

	componentDidUpdate(prevProps: PlayerBackgroundImageProps, prevState: PlayerBackgroundImageState) {
		if (prevProps.item !== this.props.item) {
			this.getImageSources();
		}
	}

	private getImageSources() {
		const { item } = this.props;
		if (!item || !item.images) this.setState({ imageSources: [] });

		const images = item.images;
		const mobile = resolveImages(images, 'wallpaper', { width: 480 })[0].src;
		const tablet = resolveImages(images, 'wallpaper', { width: 1440 })[0].src;
		const desktopWide = resolveImages(images, 'wallpaper', { width: 1920 })[0].src;
		this.setState({
			imageSources: [
				{ src: mobile, mediaQuery: mobileBp },
				{ src: tablet, mediaQuery: tabletBp },
				{ src: desktopWide, mediaQuery: desktopBp }
			]
		});
	}

	render() {
		const { imageSources } = this.state;
		if (!imageSources.length) return <div />;
		return (
			<div className={bem.b()}>
				<Picture
					src={imageSources[0].src}
					sources={imageSources}
					className={bem.e('wallpaper')}
					imageClassName={bem.e('image')}
				/>
			</div>
		);
	}
}

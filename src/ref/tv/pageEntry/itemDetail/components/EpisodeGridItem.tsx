import * as React from 'react';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import { getWatchedInfo } from 'shared/account/profileUtil';
import Image from 'shared/component/Image';
import { Bem } from 'shared/util/styles';
import sass from 'ref/tv/util/sass';
import EllipsisLabel from 'ref/tv/component/EllipsisLabel';
import './EpisodeGridItem.scss';

interface EpisodeGridItemProps {
	episode: api.ItemSummary;
	index?: number;
	isSignedIn?: boolean;
	focused?: boolean;
	onMouseEnter?: (index) => void;
	onClick?: (index) => void;
}

const bem = new Bem('episode-grid-item');

export default class EpisodeGridItem extends React.Component<EpisodeGridItemProps, any> {
	constructor(props) {
		super(props);
	}

	private focused = false;

	componentWillReceiveProps(nextProps: EpisodeGridItemProps) {
		if (nextProps.focused !== this.focused) {
			this.focused = nextProps.focused;
		}
	}

	private renderProgressBar(position, duration, width) {
		const progressWidth = Math.round((width * position) / duration);
		return (
			<div className={bem.e('progress-bar')}>
				<div className={bem.e('progress')} style={{ width: progressWidth + 'px' }} />
			</div>
		);
	}

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		const { onClick, index } = this.props;
		onClick && onClick(index);
	};

	render() {
		const { index, focused } = this.props;
		const episode = this.props.episode as api.ItemDetail;
		const imageOptions: image.Options = {
			width: sass.episodeGridItemWidth
		};

		const images = resolveImages(episode.images, ['tile', 'wallpaper'], imageOptions);
		const sources = images.map(source => convertResourceToSrcSet(source, true));
		const defaultImage = images[0];
		const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
		const displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;
		const { isSignedIn } = this.props;
		const watched = isSignedIn && getWatchedInfo(episode.id);

		if (watched && watched.value && watched.value.isFullyWatched && episode.customFields) {
			episode.customFields.position = episode.duration;
		}

		const position = episode.customFields && episode.customFields.position;

		return (
			<div className={bem.b()}>
				<div
					className={bem.e('container', { focused })}
					style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
					onMouseEnter={this.handleMouseEnter}
					onClick={this.handleMouseClick}
				>
					<Image srcSet={sources} width={displayWidth} height={displayHeight} />
					<div className={bem.e('overlay')}>
						<div className={bem.e('title-box')}>
							<div className={bem.e('index')}>{`${index + 1}`}</div>
							<EllipsisLabel className={bem.e('title')} text={episode.episodeName || episode.title} />
						</div>
						{position !== undefined && this.renderProgressBar(position, episode.duration, imageOptions.width)}
					</div>
				</div>
			</div>
		);
	}
}

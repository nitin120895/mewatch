import * as React from 'react';
import { getWatchedInfo, WatchedState } from 'shared/account/profileUtil';
import Asset from 'ref/tv/component/Asset';
import { Bem } from 'shared/util/styles';
import EpisodeDescription from './EpisodeDescription';
import sass from 'ref/tv/util/sass';
import './EpisodeListItem.scss';

interface EpisodeListItemProps {
	episode: api.ItemSummary;
	index?: number;
	focused: boolean;
	seasonNumber?: number;
	displayThumbnail?: boolean;
	isSignedIn?: boolean;
	onMouseEnter?: (index: number) => void;
	onClick?: (index: number) => void;
}

const bem = new Bem('d2-item');

export default class EpisodeListItem extends React.Component<EpisodeListItemProps, any> {
	private focused = false;

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		const { onClick, index } = this.props;
		onClick && onClick(index);
	};

	render() {
		const { displayThumbnail } = this.props;

		return (
			<div className={bem.b()} onMouseEnter={this.handleMouseEnter}>
				{this.renderThumbnail()}
				<div className={bem.e('right')}>
					<div className={bem.e('titleLine')}>
						{this.renderTitle()}
						{this.renderDuration()}
					</div>
					{!displayThumbnail && this.renderProgress(false)}
					{this.renderDescription()}
				</div>
			</div>
		);
	}

	componentWillReceiveProps(nextProps: EpisodeListItemProps) {
		if (nextProps.focused !== this.focused) {
			this.focused = nextProps.focused;
		}
	}

	private renderThumbnail(fakeShow = false) {
		const { episode, displayThumbnail, focused } = this.props;

		if (displayThumbnail) {
			return (
				<div className={bem.e('thumbnail')} onClick={this.handleMouseClick}>
					<Asset
						item={episode}
						imageType={'tile'}
						imageOptions={{ width: sass.tileImageWidth }}
						itemMargin={0}
						focused={focused}
					/>
					{this.renderPlayIcon(focused, true)}
					{this.renderProgress(true)}
				</div>
			);
		} else {
			return this.renderPlayIcon(focused);
		}
	}

	private renderPlayIcon(focused, isThumbnail = false) {
		return (
			<div className={bem.e('playIcon', { focused, isThumbnail })} onClick={!isThumbnail && this.handleMouseClick} />
		);
	}

	private renderTitle(resumePoint?: number) {
		const { episode } = this.props;
		const { episodeName, episodeNumber, title } = episode as api.ItemDetail;

		return <div className={bem.e('title')}>{`${episodeNumber}. ${episodeName || title}`}</div>;
	}

	private renderDuration() {
		const { episode } = this.props;
		const duration = episode.duration;
		const hour = Math.floor(duration / 3600);
		const min = Math.ceil((duration % 3600) / 60);
		const durationText = hour > 0 ? hour + 'h ' : '' + min + 'min';

		return <div className={bem.e('duration')}>{durationText}</div>;
	}

	private renderDescription() {
		const { episode, displayThumbnail } = this.props;
		return <EpisodeDescription className={bem.e('description')} item={episode} displayThumbnail={displayThumbnail} />;
	}

	private renderProgress(displayThumbnail) {
		const { isSignedIn, episode } = this.props;
		const watched = isSignedIn && getWatchedInfo(episode.id);

		if (!watched || !watched.value || watched.state !== WatchedState.Watched) return undefined;

		const position = watched.value.isFullyWatched ? episode.duration : watched.value.position;
		const percentWatched = Math.round((position / episode.duration) * 100);

		return (
			<div className={bem.e('progress-group', { thumbnail: displayThumbnail })}>
				<div className={bem.e('progress-bar')} style={{ width: percentWatched + '%' }} />
			</div>
		);
	}
}

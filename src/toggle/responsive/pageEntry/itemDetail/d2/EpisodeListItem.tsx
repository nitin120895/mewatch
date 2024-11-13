import * as cx from 'classnames';
import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Packshot from 'ref/responsive/component/Packshot';
import { calculateMedianWidth, getColumnClasses } from 'ref/responsive/util/grid';
import { getWatchedInfo, WatchedState } from 'shared/account/profileUtil';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import Link from 'shared/component/Link';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';
import { Bem } from 'shared/util/styles';
import EpisodeDescription from 'toggle/responsive/pageEntry/itemDetail/d1/EpisodeDescription';
import MediaDuration from 'ref/responsive/pageEntry/itemDetail/d1/MediaDuration';
import { getEpisodeDetailImageTypes } from 'ref/responsive/pageEntry/itemDetail/util/episodeImages';
import { renderPrice } from 'ref/responsive/pageEntry/itemDetail/util/episodePrice';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { wrapItemPlayButton } from 'shared/analytics/components/ItemWrapper';
import PlayIcon from 'ref/responsive/component/icons/PlayIcon';
import { isRestrictedForAnonymous } from 'toggle/responsive/util/playerUtil';

import './EpisodeListItem.scss';

interface EpisodeListItemProps {
	episode: api.ItemSummary;
	showTitle: string;
	index?: number;
	isSelected: boolean;
	seasonNumber?: number;
	displayPackshot?: boolean;
	isSignedIn?: boolean;
	allowEpisodeLinks?: boolean;
	ignoreLink?: boolean;
	getRestrictedContentModal?: () => void;
	onClick?: (episode: api.ItemDetail) => void;
}

const columns = [{ phone: 9 }, { phablet: 8 }, { tablet: 7 }, { laptop: 6 }, { desktopWide: 4 }];

const PACKSHOT_MEDIAN_COLUMN_WIDTH = calculateMedianWidth(columns);

const bem = new Bem('d2-item');

export default class EpisodeListItem extends React.Component<EpisodeListItemProps, any> {
	private onPurchase = () => {
		// stub
	};

	private PlayIcon = wrapItemPlayButton<EpisodeListItemProps>(props => {
		const { episode, allowEpisodeLinks } = props;
		const { path, watchPath } = episode as api.ItemDetail;
		const to: string = canPlay(episode) ? watchPath : allowEpisodeLinks ? path : undefined;
		return (
			<div className={bem.e('play-icon', { noPackshot: true })}>
				<CTAWrapper type={CTATypes.Watch} data={{ item: episode, entryPoint: VideoEntryPoint.IDPEpisode }}>
					{to ? (
						<Link to={to}>
							<PlayIcon active={true} width={39} height={39} />
						</Link>
					) : (
						<PlayIcon active={false} width={39} height={39} />
					)}
				</CTAWrapper>
			</div>
		);
	});

	private onLinkClick = (e: React.MouseEvent<any>) => {
		e.preventDefault();
		const { onClick, episode } = this.props;
		getUpdatedItem(episode.id).then(updatedItem => onClick(updatedItem));
	};

	render() {
		const PlayIcon = this.PlayIcon;
		return (
			<div className={bem.b()}>
				{!this.props.displayPackshot && <PlayIcon {...this.props} />}
				{this.renderTitle()}
				{this.renderPackshot()}
				<div className={bem.e('description-group')}>{this.renderDescription()}</div>
			</div>
		);
	}

	private renderTitle(resumePoint?: number) {
		const { episode, displayPackshot } = this.props;
		const { watchPath, episodeName } = episode as api.ItemDetail;
		const renderLink = watchPath && !isRestrictedForAnonymous(episode);

		return (
			<div className={bem.e('title-group', displayPackshot ? 'pad' : '')}>
				<div className={bem.e('title-text')}>
					{renderLink ? (
						<CTAWrapper type={CTATypes.Watch} data={{ item: episode }}>
							<Link to={watchPath} onClick={this.onLinkClick} className={cx(bem.e('title'), 'truncate')}>
								{episodeName}
							</Link>
						</CTAWrapper>
					) : (
						<span className={cx(bem.e('title'), 'truncate')}>{episodeName}</span>
					)}
					{this.renderDuration()}
					{this.renderDescription('desktop')}
				</div>
				{this.renderPrice(episode)}
			</div>
		);
	}

	private renderPackshot(resumePoint?: number) {
		const { episode, index, isSelected, displayPackshot, ignoreLink, onClick } = this.props;
		if (!displayPackshot) return undefined;
		const isPlayable = canPlay(episode);
		const isRestricted = isRestrictedForAnonymous(episode);

		return (
			<div className={cx(bem.e('packshot-group'), ...getColumnClasses(columns))}>
				<CTAWrapper type={CTATypes.Watch} data={{ item: episode, entryPoint: VideoEntryPoint.IDPEpisode }}>
					<Packshot
						className={bem.e('packshot', { active: isPlayable })}
						item={episode}
						index={index}
						selected={isSelected}
						imageType={getEpisodeDetailImageTypes(episode)}
						imageOptions={{ width: PACKSHOT_MEDIAN_COLUMN_WIDTH }}
						titlePosition="none"
						ignoreLink={ignoreLink}
						allowProgressBar
						hasOverlay
						allowWatch
						isEpisodeItem
						isRestricted={isRestricted}
						onClicked={onClick}
						requiresUpdatedItem={true}
						showPartnerLogo
					/>
				</CTAWrapper>
			</div>
		);
	}

	private renderDescription(cssModifier?: string) {
		const { episode, showTitle, seasonNumber, displayPackshot } = this.props;
		const fit = displayPackshot;
		return (
			<EpisodeDescription
				className={bem.e('description', cssModifier, { fit })}
				episode={episode}
				showTitle={showTitle}
				seasonNumber={seasonNumber}
				maxLines={fit ? undefined : 3}
			/>
		);
	}

	private getWatchProgress() {
		const { isSignedIn, episode } = this.props;
		const watchedInfo = getWatchedInfo(episode.id);

		return (isSignedIn && watchedInfo && watchedInfo.state === WatchedState.Watched && watchedInfo.value.position) || 0;
	}

	private renderTimeValue(watchedProgress) {
		const { episode } = this.props;
		const timeLeft = watchedProgress === 0 ? episode.duration : Math.round(episode.duration - watchedProgress);
		return <MediaDuration duration={timeLeft} />;
	}

	private renderTimeLabel(watchedProgress) {
		if (watchedProgress === 0) return false;

		return (
			<IntlFormatter elementType="span" className={bem.e('left-label')}>
				{`@{itemDetail_media_duration_remaining|left}`}
			</IntlFormatter>
		);
	}

	private renderDuration() {
		const watchedProgress = this.getWatchProgress();

		return (
			<div className={bem.e('duration')}>
				{this.renderTimeValue(watchedProgress)}
				{this.renderTimeLabel(watchedProgress)}
			</div>
		);
	}

	// Shared between GridItem / ListItem
	private renderPrice(episode) {
		return renderPrice(episode, this.onPurchase);
	}
}

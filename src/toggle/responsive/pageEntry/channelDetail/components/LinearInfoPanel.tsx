import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { get } from 'shared/util/objects';
import { browserHistory } from 'shared/util/browserHistory';
import { getChannelLogoForThumbnailOverlay } from 'shared/util/images';
import Spinner from 'ref/responsive/component/Spinner';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { FormattedTime } from 'react-intl';
import EpisodeListIcon from '../../../player/controls/icons/EpisodeListIcon';
import CtaButton from 'ref/responsive/component/CtaButton';
import { ChannelScheduleEntityProps, ChannelScheduleProps } from '../../../component/ChannelSchedule';
import { noCurrentProgram, noSchedule } from 'toggle/responsive/util/epg';
import './LinearInfoPanel.scss';
import { resolveChannelLogo } from '../../../util/epg';
import EpisodeInfo from '../../../component/EpisodeInfo';

const bem = new Bem('linear-info-panel');

interface OwnProps {
	hasError: boolean;
	useAmPmTimeFormat: boolean;
}

type Props = ChannelScheduleEntityProps & ChannelScheduleProps & OwnProps;

export default class LinearInfoPanel extends React.PureComponent<Props> {
	private onDemandClick = () => {
		const { item } = this.props.currentProgram;
		browserHistory.push(item.path);
	};

	render() {
		const { className, loading, item, hasError, currentProgram } = this.props;
		const cl = cx(bem.b(), className);
		const assetImage = get(currentProgram, 'item.images.tile');

		if (loading) {
			return (
				<div className={cl}>
					<Spinner className={bem.e('spinner')} />
				</div>
			);
		}

		let picStyle;
		if (!assetImage)
			picStyle = {
				backgroundImage: `url("${resolveChannelLogo(item)}")`
			};

		return (
			<div className={cl}>
				<div className={bem.e('channel-name')}>{item.title}</div>
				<div className={bem.e('scrollable-area')}>
					<div className={bem.e('image-container')}>
						<div style={picStyle} className={bem.e('image', { 'no-image': !assetImage })}>
							{this.renderAssetImage()}
							{this.renderChannelLogo()}
						</div>
					</div>
					{!hasError ? this.renderDetails() : this.renderError()}
				</div>
				{!hasError && this.renderOnDemand()}
			</div>
		);
	}

	private renderAssetImage() {
		const { item, currentProgram, hasError } = this.props;
		const url = hasError ? get(item, 'images.tile') : get(currentProgram, 'item.images.tile');
		if (url) {
			return <img className={bem.e('asset-image')} src={url} />;
		}
	}

	private renderChannelLogo() {
		const { item } = this.props;

		return (
			<div className={bem.e('channel-logo')}>
				<img src={getChannelLogoForThumbnailOverlay(item)} />
			</div>
		);
	}

	private renderDetails() {
		const { currentProgram, item } = this.props;
		const description = get(currentProgram, 'item.description') || '';
		const title = get(currentProgram, 'item.title') || item.title;
		const secondaryLanguageTitle = get(currentProgram, 'item.secondaryLanguageTitle') || '';

		return (
			<div className={bem.e('metadata')}>
				<div className={bem.e('head')}>
					<div className={bem.e('title')}>{title}</div>
					{secondaryLanguageTitle && <div className={bem.e('secondary-title')}>{secondaryLanguageTitle}</div>}
					{this.renderDate()}
					{this.renderSeasonInfo(currentProgram.item)}
				</div>
				<div className={bem.e('description')}>
					<IntlFormatter elementType="p">{description}</IntlFormatter>
				</div>
			</div>
		);
	}

	private renderOnDemand = () => {
		const { currentProgram } = this.props;
		const episodeNumber = get(currentProgram, 'item.episodeNumber') || 0;
		const enableCatchUp = get(currentProgram, 'item.enableCatchUp');
		const path = get(currentProgram, 'item.path');
		const shouldShowOnDemand = path !== undefined && path.length > 0 && enableCatchUp;
		const shouldShowMoreEpisodes = path !== undefined && path.length > 0 && episodeNumber > 1 && enableCatchUp;

		return (
			<div className={bem.e('on-demand-container')}>
				{shouldShowOnDemand && this.renderOnDemandButton()}
				{shouldShowMoreEpisodes && (
					<IntlFormatter elementType="p">
						{'@{epg_schedule_detail_overlay_more_episodes|More episodes available}'}
					</IntlFormatter>
				)}
			</div>
		);
	};

	private renderDate() {
		const { currentProgram, useAmPmTimeFormat } = this.props;
		const classification = get(currentProgram, 'item.classification.name');
		const startDate = get(currentProgram, 'startDate') || '';
		const endDate = get(currentProgram, 'endDate') || '';
		return (
			<p className={bem.e('time')}>
				<FormattedTime value={startDate} hour12={useAmPmTimeFormat} />
				{' - '}
				<FormattedTime value={endDate} hour12={useAmPmTimeFormat} />
				{classification && (
					<span>
						<IntlFormatter className={bem.e('classification')}>{classification}</IntlFormatter>
					</span>
				)}
			</p>
		);
	}

	private renderOnDemandButton() {
		return (
			<CtaButton className={bem.e('button')} theme="light" ordinal="secondary" onClick={this.onDemandClick}>
				<EpisodeListIcon />
				<IntlFormatter elementType="span">{'@{epg_schedule_detail_overlay_on_demand|On Demand}'}</IntlFormatter>
			</CtaButton>
		);
	}

	private renderSeasonInfo(item) {
		const { seasonNumber, episodeNumber, episodeTitle } = item;
		return (
			<div className={bem.e('season-info')}>
				<EpisodeInfo seasonNumber={seasonNumber} episodeNumber={episodeNumber} />
				{episodeTitle && <span> | {episodeTitle}</span>}
			</div>
		);
	}

	private renderError() {
		const { currentProgram, schedules } = this.props;
		const errorMessage = noSchedule(schedules)
			? '@{xchd1_no_metadata_error|We are currently experiencing a network issue. Please try again later}'
			: noCurrentProgram(currentProgram, schedules)
			? '@{epg_noSchedule_description|There is currently no programme showing on this channel.}'
			: undefined;
		return (
			<IntlFormatter className={bem.e('error-message')} elementType="div">
				{errorMessage}
			</IntlFormatter>
		);
	}
}

import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import PlayerMetadata from 'ref/responsive/player/PlayerMetadata';
import { isEpisode, isSeriesEpisode, openDeepLink } from 'toggle/responsive/util/item';
import { Link } from 'react-router';
import { isMobile } from 'shared/util/browser';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './RestrictionError.scss';

const HELP_CENTRE_PATH = process.env.CLIENT_MC_HELP_CENTRE;

const bem = new Bem('restriction-error');

interface RestrictionErrorProps {
	title?: string;
	item?: api.ItemDetail;
	onBack?: () => void;
}

class RestrictionError extends React.Component<RestrictionErrorProps> {
	renderTitle() {
		const { item, title } = this.props;
		if (isEpisode(item)) {
			if (isSeriesEpisode(item)) {
				return (
					<IntlFormatter
						values={{
							seasonNumber: (item.season && item.season.seasonNumber) || item.seasonNumber,
							seasonName: item.season.show.title,
							episodeNumber: item.episodeNumber,
							episodeName: item.episodeName
						}}
					>
						{`@{epg_drmRestriction_episode_title}`}
					</IntlFormatter>
				);
			}
			return `${item.season.show.title} ${item.episodeName}`;
		}

		return title || item.title;
	}

	renderEpisodeMetadata() {
		const { item } = this.props;
		if (!isEpisode(item)) return false;
		return isSeriesEpisode(item) ? (
			<IntlFormatter
				elementType="p"
				values={{
					seasonNumber: (item.season && item.season.seasonNumber) || item.seasonNumber,
					episodeNumber: item.episodeNumber,
					episodeName: item.episodeName
				}}
			>
				{`@{endOfPlayback_metadata_title}`}
			</IntlFormatter>
		) : (
			<p>{item.episodeName}</p>
		);
	}

	renderMetadata() {
		const { item, onBack } = this.props;
		if (!item) return false;

		const title = (item.season && item.season.show && item.season.show.title) || item.title;
		const description = item.shortDescription || item.description;

		return (
			<PlayerMetadata title={title} onBack={onBack}>
				{this.renderEpisodeMetadata()}
				<p>{description}</p>
			</PlayerMetadata>
		);
	}

	renderMobileAppCTA() {
		const { item } = this.props;
		return (
			<div>
				<IntlFormatter elementType="p">
					{'@{epg_drmRestriction_description_app|Please catch it on the mewatch app.}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					componentProps={{
						ordinal: 'primary',
						theme: 'light'
					}}
					onClick={() => openDeepLink(item)}
				>
					{'@{epg_drmRestriction_app_cta|Catch on mewatch app}'}
				</IntlFormatter>
			</div>
		);
	}

	renderGeneralCTA() {
		return (
			<div>
				<IntlFormatter elementType="p">
					{
						'@{epg_drmRestriction_description_general|To continue watching this programme, please refer to the Help Centre for the supported browsers.}'
					}
				</IntlFormatter>
				<Link target="_blank" to={HELP_CENTRE_PATH}>
					<IntlFormatter
						elementType={CtaButton}
						componentProps={{
							ordinal: 'primary',
							theme: 'light'
						}}
					>
						{'@{help_centre_link_label|Go to Help Centre}'}
					</IntlFormatter>
				</Link>
			</div>
		);
	}

	render() {
		const { item } = this.props;

		return (
			<div className={bem.e('wrapper')}>
				<div className={cx(bem.e('main'), { isFullScreenPlayer: item })}>
					<div className={bem.e('inner')}>
						<IntlFormatter elementType="h3">
							{'@{epg_drmRestriction_description_title|You are almost ready to watch:}'}
							<br />
							{this.renderTitle()}
						</IntlFormatter>
						<IntlFormatter elementType="p">
							{
								'@{epg_drmRestriction_description|The content protection requirements for this programme is not supported on this browser}'
							}
						</IntlFormatter>

						{isMobile() ? this.renderMobileAppCTA() : this.renderGeneralCTA()}
					</div>
				</div>
				{this.renderMetadata()}
			</div>
		);
	}
}

export default RestrictionError;

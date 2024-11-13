import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import MediaDuration from './MediaDuration';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './EpisodeInfo.scss';

interface EpisodeInfoProps {
	className?: string;
	episode: api.ItemSummary;
	showTitle: string;
	seasonNumber?: number;
}

const bem = new Bem('d1-ep-info');

export default ({ className, showTitle, episode, seasonNumber }: EpisodeInfoProps) => {
	const { shortDescription, episodeNumber, description, episodeName } = episode as api.ItemDetail;
	return (
		<div className={cx(bem.b(), className)}>
			<h2 className={bem.e('show-title')}>{showTitle}</h2>
			<IntlFormatter
				elementType="h2"
				className={bem.e('season-title')}
				values={{ season: seasonNumber, episode: episodeNumber }}
			>
				{`@{itemDetail_episodeDescription_episodeTitle|Season {season} Episode {episode}}`}
			</IntlFormatter>
			<div className={bem.e('name-group')}>
				<h3 className={cx(bem.e('name'), 'truncate')}>{episodeName}</h3>
				<MediaDuration className={bem.e('duration')} duration={episode.duration} />
			</div>
			<p className={bem.e('description')}>{description || shortDescription}</p>
		</div>
	);
};

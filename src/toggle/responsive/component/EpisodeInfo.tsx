import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface EpisodeInfo {
	seasonNumber?: string;
	episodeNumber?: string;
}

export default function EpisodeInfo({ seasonNumber, episodeNumber }: EpisodeInfo) {
	const components = [];
	if (seasonNumber)
		components.push(
			<IntlFormatter key="season-number" values={{ seasonNumber }}>
				{'@{season_number}'}
			</IntlFormatter>
		);

	if (seasonNumber && episodeNumber) components.push(<span key="divider">, </span>);

	if (episodeNumber)
		components.push(
			<IntlFormatter key="episode-number" values={{ episodeNumber }}>
				{'@{episode_number}'}
			</IntlFormatter>
		);

	return <span>{components}</span>;
}

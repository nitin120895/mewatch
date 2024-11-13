import * as React from 'react';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import SeasonSelector from './SeasonSelector';
import EpisodeGridItem from './EpisodeGridItem';
import SeasonDescription from './SeasonDescription';
import { getShowSeasonAndEpisode, EpisodeListData } from '../../util/episodeList';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './D1EpisodeGrid.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeDescription?: boolean;
}

export type D1EpisodeGridProps = TPageEntryItemDetailProps<CustomFields>;

const bem = new Bem('d1');

export default class D1EpisodeGrid extends React.Component<D1EpisodeGridProps, any> {
	render() {
		const { item, itemDetailCache, customFields } = this.props;
		const { seasonOrder, seasonDescription } = customFields || ({} as CustomFields);
		const data = getShowSeasonAndEpisode(item, itemDetailCache);
		const seasons = data.show.seasons;
		return (
			<section className={cx(bem.b(), 'clearfix')}>
				<div className={bem.e('title_container')}>
					<EntryTitle {...this.props} headingClassName={bem.e('title')} />
					<SeasonSelector
						seasons={seasons ? seasons.items : undefined}
						selectedSeasonId={data.season.id}
						reverse={seasonOrder === 'descending'}
					/>
				</div>
				{seasonDescription && <SeasonDescription item={data.season || item} />}
				{this.renderEpisodes(data)}
			</section>
		);
	}

	private renderEpisodes({ show, season, episode: currentEpisode }: EpisodeListData): any {
		const episodes = season.episodes && season.episodes.items;
		if (!episodes || !episodes.length) return false;
		const { customFields } = this.props;
		const { episodeDescription } = customFields || ({} as CustomFields);
		return (
			<div className="row">
				{episodes.map((episode, index) => (
					<EpisodeGridItem
						key={`episode-${episode.id}`}
						episode={episode}
						showTitle={show.title}
						index={index}
						seasonNumber={season.seasonNumber}
						isSelected={currentEpisode && episode.id === currentEpisode.id}
						displayDescription={episodeDescription}
					/>
				))}
			</div>
		);
	}
}

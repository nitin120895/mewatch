import * as React from 'react';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import SeasonSelector from '../d1/SeasonSelector';
import EpisodeListItem from './EpisodeListItem';
import SeasonDescription from '../d1/SeasonDescription';
import { getShowSeasonAndEpisode, EpisodeListData } from '../../util/episodeList';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './D2EpisodeList.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeThumbnail?: boolean;
}

export type D2EpisodeListProps = TPageEntryItemDetailProps<CustomFields>;

const bem = new Bem('d2');

export default class D2EpisodeList extends React.Component<D2EpisodeListProps, any> {
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
						autoExpand={false}
						reverse={seasonOrder === 'descending'}
					/>
				</div>
				{seasonDescription && <SeasonDescription className={bem.e('description')} item={data.season || item} />}
				{this.renderEpisodes(data)}
			</section>
		);
	}

	private renderEpisodes({ show, season, episode: currentEpisode }: EpisodeListData): any {
		const episodes = season.episodes && season.episodes.items;
		if (!episodes || !episodes.length) return undefined;
		const { activeProfile, clientSide, customFields } = this.props;
		const { episodeThumbnail } = customFields || ({} as CustomFields);
		return (
			<div>
				{episodes.map(episode => (
					<EpisodeListItem
						key={`episode-${episode.id}`}
						episode={episode}
						showTitle={show.title}
						seasonNumber={season.seasonNumber}
						isSelected={currentEpisode && episode.id === currentEpisode.id}
						displayPackshot={episodeThumbnail}
						isSignedIn={activeProfile && clientSide}
					/>
				))}
			</div>
		);
	}
}

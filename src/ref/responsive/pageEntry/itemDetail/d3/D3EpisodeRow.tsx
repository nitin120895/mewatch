import * as React from 'react';
import { connect } from 'react-redux';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Scrollable from 'ref/responsive/component/Scrollable';
import EpisodeInfo from '../d1/EpisodeInfo';
import SeasonSelector from '../d1/SeasonSelector';
import EpisodeGridItem from '../d1/EpisodeGridItem';
import SeasonDescription from '../d1/SeasonDescription';
import { getShowSeasonAndEpisode, EpisodeListData } from '../../util/episodeList';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { D3EpisodeRow as template } from 'shared/page/pageEntryTemplate';

import './D3EpisodeRow.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeDescription?: boolean;
}

export interface D3EpisodeRowProps extends TPageEntryItemDetailProps<CustomFields> {
	onShowModal?: (config: ModalConfig) => void;
}

const columns = [{ phone: 15 }, { tablet: 8 }, { desktop: 6 }, { desktopWide: 4 }];

const bem = new Bem('d3');

class D3EpisodeRow extends React.Component<D3EpisodeRowProps, any> {
	private onExpandEpisode = (expandedEpisode: api.ItemSummary) => {
		this.props.onShowModal({
			id: 'episode',
			type: ModalTypes.STANDARD_DIALOG,
			componentProps: {
				children: this.renderExpandedEpisode(expandedEpisode),
				className: bem.e('modal')
			}
		});
		this.setState({ expandedEpisode });
	};

	render() {
		if (!this.props.item || !this.props.itemDetailCache) return false;

		const { item, itemDetailCache, customFields } = this.props;
		const { seasonOrder, seasonDescription } = customFields || ({} as CustomFields);
		const data = getShowSeasonAndEpisode(item, itemDetailCache);
		const seasons = data.show.seasons;
		return (
			<div className={cx(bem.b(), 'clearfix')}>
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
			</div>
		);
	}

	private renderEpisodes({ show, season, episode: currentEpisode }: EpisodeListData): any {
		const episodes = season.episodes && season.episodes.items;
		if (!episodes || !episodes.length) return undefined;

		const { customFields } = this.props;
		const { episodeDescription } = customFields || ({} as CustomFields);
		return (
			<Scrollable
				className={cx(bem.e('list', { description: episodeDescription }), 'row-peek')}
				length={episodes.length}
			>
				{episodes.map((episode, index) => (
					<EpisodeGridItem
						className={bem.e('item')}
						key={`episode-${episode.id}`}
						episode={episode}
						showTitle={show.title}
						index={index}
						seasonNumber={season.seasonNumber}
						isSelected={currentEpisode && episode.id === currentEpisode.id}
						displayDescription={episodeDescription}
						columns={columns}
						onExpand={this.onExpandEpisode}
					/>
				))}
			</Scrollable>
		);
	}

	private renderExpandedEpisode(episode: api.ItemSummary) {
		const { item, itemDetailCache } = this.props;
		const { show, season } = getShowSeasonAndEpisode(item, itemDetailCache);
		return <EpisodeInfo episode={episode} showTitle={show.title} seasonNumber={season.seasonNumber} />;
	}
}

const actions = {
	onShowModal: OpenModal
};

const Component: any = connect<any, any, D3EpisodeRowProps>(
	undefined,
	actions
)(D3EpisodeRow);
Component.template = template;
export default Component;

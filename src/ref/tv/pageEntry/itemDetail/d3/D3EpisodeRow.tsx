import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InjectedIntl } from 'react-intl';
import SeasonSelector from '../components/SeasonSelector';
import Description from 'ref/tv/component/Description';
import ScrollableList from 'ref/tv/component/ScrollableList';
import EpisodeGridItem from '../components/EpisodeGridItem';
import EpisodeInfo from '../components/EpisodeInfo';
import { getShowSeasonAndEpisode, EpisodeListData } from '../util/episodeList';
import { checkShouldCollapse } from '../util/itemProps';
import { addWatchPosition } from 'ref/tv/util/itemUtils';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import { getSeasonDetail } from 'shared/cache/cacheWorkflow';
import { D3EpisodeRow as template } from 'shared/page/pageEntryTemplate';
import sass from 'ref/tv/util/sass';
import './D3EpisodeRow.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeDescription?: boolean;
}

interface ProfileProps {
	profile?: state.Profile;
}

type D3EpisodeRowProps = TPageEntryItemDetailProps<CustomFields>;

type D3EpisodeRowState = Partial<{
	focused: boolean;
	focusState: 'season' | 'desc' | 'episode';
	canFocusOnDesc: boolean;
	curSeasonIndex: number;
	curEpisodeIndex: number;
	itemDetailData: EpisodeListData;
}>;

interface D3EpisodeRowDispatchProps {
	getSeasonDetail: (itemId: string) => any;
}

const bem = new Bem('d3');
const bemEpisode = new Bem('d3-episode');

class D3EpisodeRow extends React.Component<
	D3EpisodeRowProps & ProfileProps & D3EpisodeRowDispatchProps,
	D3EpisodeRowState
> {
	context: {
		router: ReactRouter.InjectedRouter;
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
	};

	static contextTypes: any = {
		router: React.PropTypes.object.isRequired,
		intl: React.PropTypes.object.isRequired,
		focusNav: React.PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired
	};

	private baseIndex: number;

	constructor(props) {
		super(props);

		const { item, itemDetailCache, customFields } = props;
		const { seasonOrder } = customFields || ({} as CustomFields);
		const itemDetailData = getShowSeasonAndEpisode(item, itemDetailCache, seasonOrder);
		const seasons = itemDetailData.show.seasons;
		const curSeasonIndex = itemDetailData.season ? seasons.items.findIndex(e => e.id === itemDetailData.season.id) : 0;
		const curEpisodeIndex = itemDetailData.episode
			? itemDetailData.season.episodes.items.findIndex(e => e.id === itemDetailData.episode.id)
			: 0;

		this.state = {
			focused: false,
			canFocusOnDesc: false,
			curSeasonIndex,
			curEpisodeIndex,
			focusState: 'season',
			itemDetailData
		};

		// Multiply by 10 to allow this entry has more than 1 focusable rows
		this.baseIndex = (props.index + 1) * 10;
	}

	componentDidMount() {
		if (checkShouldCollapse(this.props.pageKey)) {
			// shouldCollapse means current page is of season or episode,
			// so move focus to selector component.
			switch (this.props.pageKey) {
				case 'SeasonDetail':
					this.context.focusNav.moveToRow(this.baseIndex + 1);
					break;
				case 'EpisodeDetail':
					this.context.focusNav.moveToRow(this.baseIndex + 3);
					break;
				default:
					break;
			}
		}
	}

	componentWillReceiveProps(nextProps: D3EpisodeRowProps & ProfileProps & D3EpisodeRowDispatchProps) {
		if (nextProps.item.id !== this.props.item.id) {
			if (this.context.focusNav.pageGoBackHandle) return;

			const { item, itemDetailCache, customFields } = nextProps;
			const { seasonOrder } = customFields || ({} as CustomFields);
			const itemDetailData = getShowSeasonAndEpisode(item, itemDetailCache, seasonOrder);
			const seasons = itemDetailData.show.seasons;
			const curSeasonIndex = itemDetailData.season
				? seasons.items.findIndex(e => e.id === itemDetailData.season.id)
				: 0;
			const curEpisodeIndex = itemDetailData.episode
				? itemDetailData.season.episodes.items.findIndex(e => e.id === itemDetailData.episode.id)
				: 0;
			this.setState({ itemDetailData, curEpisodeIndex, curSeasonIndex, focusState: 'season' });
		} else {
			if (nextProps.itemDetailCache !== this.props.itemDetailCache) {
				const { itemDetailData, curSeasonIndex } = this.state;
				const curSeason = nextProps.itemDetailCache[itemDetailData.show.seasons.items[curSeasonIndex].id];

				if (!curSeason) return;

				itemDetailData.season = curSeason.item;
				this.setState({ itemDetailData });
			}
		}
	}

	private restoreSavedState = state => {
		this.setState({ ...state });
	};

	private onAfterEllipsis = isEllipsis => {
		this.setState({ canFocusOnDesc: isEllipsis });
	};

	private onSeasonChanged = index => {
		const { itemDetailData, curSeasonIndex } = this.state;

		if (index >= 0 && curSeasonIndex !== index) {
			const curSeason = itemDetailData.show.seasons.items[index];

			if (!curSeason) return;

			const { id } = curSeason;
			const curSeasonCache = this.props.itemDetailCache[id];

			if (curSeasonCache) {
				itemDetailData.season = curSeasonCache.item;
				this.setState({ curSeasonIndex: index, curEpisodeIndex: 0, itemDetailData });
			} else {
				this.setState({ curSeasonIndex: index, curEpisodeIndex: 0 });
				this.props.getSeasonDetail(id);
			}
		}
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { curEpisodeIndex, itemDetailData } = this.state;
		const episode = itemDetailData.season.episodes.items[curEpisodeIndex];
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			episode,
			this.props as any,
			curEpisodeIndex,
			['tile', 'wallpaper']
		);
	};

	private onEpisodeChanged = index => {
		if (index !== this.state.curEpisodeIndex) {
			this.setState({ curEpisodeIndex: index }, this.trackedItemFocused);
		}
	};

	render() {
		const { customFields } = this.props;
		const { itemDetailData, curSeasonIndex, curEpisodeIndex } = this.state;
		const { seasonDescription, episodeDescription } = customFields || ({} as CustomFields);

		if (!itemDetailData) return undefined;

		const seasons = itemDetailData.show.seasons;
		const curSeasonDetail = itemDetailData.season;
		const episodes = curSeasonDetail.episodes && curSeasonDetail.episodes.items;
		const curEpisodeDetail = episodes && episodes[curEpisodeIndex];

		return (
			<section className={cx(bem.b(), 'clearfix')}>
				<SeasonSelector
					index={this.baseIndex + 1}
					seasons={seasons.items}
					focusChanged={this.onSeasonChanged}
					selectedIndex={curSeasonIndex}
				/>
				{seasonDescription && (
					<Description
						index={this.baseIndex + 2}
						focusable={true}
						className={bem.e('description')}
						description={curSeasonDetail.description}
						title={curSeasonDetail.title}
						afterEllipsis={this.onAfterEllipsis}
					/>
				)}
				{this.renderEpisodes(episodes)}
				{episodeDescription && this.renderEpisodeInfo(curEpisodeDetail)}
			</section>
		);
	}

	private renderEpisodes(episodes: api.ItemSummary[]): any {
		if (!episodes || !episodes.length) return undefined;

		const { activeProfile, clientSide, profile, template } = this.props;
		const { curEpisodeIndex } = this.state;

		addWatchPosition(profile, episodes);

		const items = episodes.map((episode, index) => {
			const focused = index === curEpisodeIndex;

			return (
				<div className={bem.e('episode')} key={`episode-${episode.id}`}>
					<EpisodeGridItem
						episode={episode}
						index={index}
						focused={focused}
						isSignedIn={activeProfile && clientSide}
						onMouseEnter={this.onEpisodeChanged}
						onClick={this.onEpisodeClick}
					/>
				</div>
			);
		});

		return (
			<div className={bem.e('episodes')}>
				<ScrollableList
					{...this.props}
					items={items}
					index={this.baseIndex + 3}
					itemWidth={sass.episodeGridItemWidth + sass.itemMargin}
					itemSpace={sass.itemMargin}
					focusChanged={this.onEpisodeChanged}
					selectedIndex={curEpisodeIndex}
					invokeItem={this.onEpisodeClick}
					refRowType={'detail'}
					entryProps={this.props}
					rowHeight={sass.d3EpisodeListHeight}
					scrollableListHeight={sass.d3EpisodeListHeight - sass.d3EpisodeListPaddingTop}
					template={template}
					d3SavedState={this.state}
					restoreSavedState={this.restoreSavedState}
					trackedItemFocused={this.trackedItemFocused}
				/>
			</div>
		);
	}

	private renderEpisodeInfo(episode: api.ItemSummary): any {
		// Refer to curSeasonIndex only to let this component be updated after change season
		const { curSeasonIndex } = this.state;

		return (
			<div className={bemEpisode.b()}>
				<div className={bemEpisode.e('seasonNo')}>{curSeasonIndex}</div>
				<EpisodeInfo item={episode} index={this.baseIndex + 5} />
			</div>
		);
	}

	private onEpisodeClick = (index: number) => {
		if (this.context.detailHelper) {
			let curIndex = this.state.curEpisodeIndex;

			if (index !== undefined) {
				this.setState({ curEpisodeIndex: index });
				curIndex = index;
			}

			const episode = this.state.itemDetailData.season.episodes.items[curIndex];
			this.context.focusNav.analytics.triggerItemEvents('CLICK', episode, this.props as any, curIndex, [
				'tile',
				'wallpaper'
			]);
			this.context.detailHelper.onClickWatch(episode, ret => {
				if (ret) {
					this.context.focusNav.analytics.triggerItemWatched(true, episode);
					this.context.router.push(episode.watchPath);
				} else {
					this.context.focusNav.analytics.triggerItemWatched(
						false,
						episode,
						this.context.intl.formatMessage({ id: 'dh1_subscriber' })
					);
				}
			});
		}
	};
}

function mapDispatchToProps(dispatch: any): D3EpisodeRowDispatchProps {
	return {
		getSeasonDetail: (itemId: string) => dispatch(getSeasonDetail(itemId))
	};
}

const D3 = connect<undefined, D3EpisodeRowDispatchProps, D3EpisodeRowProps & ProfileProps>(
	undefined,
	mapDispatchToProps
)(D3EpisodeRow);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(D3 as any).template = template;
export default D3;

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InjectedIntl } from 'react-intl';
import SeasonSelector from '../components/SeasonSelector';
import EpisodeGridItem from '../components/EpisodeGridItem';
import Description from 'ref/tv/component/Description';
import { getShowSeasonAndEpisode, EpisodeListData } from '../util/episodeList';
import { checkShouldCollapse } from '../util/itemProps';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { addWatchPosition } from 'ref/tv/util/itemUtils';
import { Bem } from 'shared/util/styles';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import { getSeasonDetail } from 'shared/cache/cacheWorkflow';
import { D1EpisodeGrid as template } from 'shared/page/pageEntryTemplate';
import sass from 'ref/tv/util/sass';
import './D1EpisodeGrid.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeDescription?: boolean;
}

interface ProfileProps {
	profile?: state.Profile;
}

type D1EpisodeGridProps = TPageEntryItemDetailProps<CustomFields>;

type D1EpisodeGridState = Partial<{
	isFocused: boolean;
	curSeasonIndex: number;
	curEpisodeIndex: number;
	maxEpisodeIndex: number;
	itemDetailData: EpisodeListData;
}>;

interface D1EpisodeGridDispatchProps {
	getSeasonDetail: (itemId: string) => any;
}

const bem = new Bem('d1');
const itemsPerRow = 3;

class D1EpisodeGrid extends React.Component<
	D1EpisodeGridProps & ProfileProps & D1EpisodeGridDispatchProps,
	D1EpisodeGridState
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

	private ref: HTMLElement;
	private episodesRef: HTMLElement;
	private focusableRow: Focusable;
	private baseIndex = 30;

	constructor(props) {
		super(props);

		const { item, itemDetailCache, customFields } = props;
		const { seasonOrder } = customFields || ({} as CustomFields);
		const itemDetailData = getShowSeasonAndEpisode(item, itemDetailCache, seasonOrder);
		const seasons = itemDetailData.show.seasons;
		const episodes = itemDetailData.season.episodes;
		const curSeasonIndex =
			itemDetailData.season && seasons ? seasons.items.findIndex(e => e.id === itemDetailData.season.id) : 0;
		const curEpisodeIndex =
			itemDetailData.episode && episodes ? episodes.items.findIndex(e => e.id === itemDetailData.episode.id) : 0;

		this.state = {
			isFocused: false,
			curEpisodeIndex,
			curSeasonIndex,
			maxEpisodeIndex: episodes ? episodes.items.length - 1 : 0,
			itemDetailData
		};

		// Multiply by 10 to allow this entry has more than 1 focusable rows
		this.baseIndex = (props.index + 1) * 10;

		this.focusableRow = {
			internalNavi: true,
			focusable: true,
			index: this.baseIndex + 1,
			height: 0,
			maxHeight: 0,
			innerTop: 0,
			template: props.template,
			refRowType: 'detail',
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.focusableRow.ref = this.ref;
		this.updateInnerTop();
		this.context.focusNav.registerRow(this.focusableRow);

		if (checkShouldCollapse(this.props.pageKey)) {
			// shouldCollapse means current page is of season or episode,
			// so move focus to selector component and make sure the row height has been calculated correctly.
			setImmediate(() => {
				switch (this.props.pageKey) {
					case 'SeasonDetail':
						this.context.focusNav.moveToRow(this.baseIndex - 1);
						break;
					case 'EpisodeDetail':
						this.context.focusNav.moveToRow(this.baseIndex + 1);
						break;
					default:
						break;
				}
			});
		}

		this.context.focusNav.addEventHandler(GlobalEvent.BACK_TO_TOP, 'row' + this.props.index, () => {
			this.setState({ curEpisodeIndex: 0 });
		});
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.removeEventHandler(GlobalEvent.BACK_TO_TOP, 'row' + this.props.index);
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
		this.updateInnerTop();
	}

	componentWillReceiveProps(nextProps: D1EpisodeGridProps & ProfileProps & D1EpisodeGridDispatchProps) {
		if (nextProps.item.id !== this.props.item.id) {
			if (this.context.focusNav.pageGoBackHandle) return;

			const { item, itemDetailCache, customFields } = nextProps;
			const { seasonOrder } = customFields || ({} as CustomFields);
			const itemDetailData = getShowSeasonAndEpisode(item, itemDetailCache, seasonOrder);
			const seasons = itemDetailData.show.seasons;
			const episodes = itemDetailData.season.episodes;
			const maxEpisodeIndex = episodes ? episodes.items.length - 1 : 0;
			const curSeasonIndex =
				itemDetailData.season && seasons ? seasons.items.findIndex(e => e.id === itemDetailData.season.id) : 0;
			const curEpisodeIndex =
				itemDetailData.episode && episodes ? episodes.items.findIndex(e => e.id === itemDetailData.episode.id) : 0;
			this.setState({ maxEpisodeIndex, itemDetailData, curSeasonIndex, curEpisodeIndex });
		} else {
			if (nextProps.itemDetailCache !== this.props.itemDetailCache) {
				const { itemDetailData, curSeasonIndex } = this.state;
				const curSeason = nextProps.itemDetailCache[itemDetailData.show.seasons.items[curSeasonIndex].id];

				if (!curSeason) return;

				itemDetailData.season = curSeason.item;
				this.setState({
					itemDetailData,
					maxEpisodeIndex: itemDetailData.season.episodes && itemDetailData.season.episodes.items.length - 1
				});
			}
		}

		this.focusableRow.entryProps = nextProps;
	}

	private updateInnerTop = () => {
		const { isFocused, curEpisodeIndex, maxEpisodeIndex } = this.state;
		const maxHeight = Math.ceil((maxEpisodeIndex + 1) / itemsPerRow) * sass.episodeGridItemHeight;
		this.focusableRow.maxHeight = maxHeight;
		this.episodesRef.style.height = maxHeight + 'px';

		if (isFocused) {
			this.focusableRow.height = sass.episodeGridItemHeight;
			this.focusableRow.innerTop = Math.floor(curEpisodeIndex / itemsPerRow) * sass.episodeGridItemHeight;
			this.context.focusNav.scrollY();
		} else {
			this.focusableRow.height = maxHeight;
			this.focusableRow.innerTop = 0;
		}
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as D1EpisodeGridState;

		if (state) {
			this.setState(
				{
					isFocused: state.isFocused,
					curSeasonIndex: state.curSeasonIndex,
					curEpisodeIndex: state.curEpisodeIndex,
					maxEpisodeIndex: state.maxEpisodeIndex,
					itemDetailData: state.itemDetailData
				},
				this.trackedItemFocused
			);
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		const { isFocused } = this.state;

		if (isFocused !== isFocus) {
			this.setState({ isFocused: isFocus });

			if (isFocus) {
				this.trackedItemFocused();
			} else {
				this.trackedItemFocused(true);
			}
		}

		return true;
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

	private moveLeft = (): boolean => {
		let curEpisodeIndex = this.state.curEpisodeIndex;

		if (curEpisodeIndex % itemsPerRow > 0) {
			curEpisodeIndex--;
			this.setState({ curEpisodeIndex }, this.trackedItemFocused);
		}

		return true;
	};

	private moveRight = (): boolean => {
		let curEpisodeIndex = this.state.curEpisodeIndex;

		if (curEpisodeIndex % itemsPerRow < itemsPerRow - 1) {
			if (curEpisodeIndex < this.state.maxEpisodeIndex) {
				curEpisodeIndex++;
				this.setState({ curEpisodeIndex }, this.trackedItemFocused);
			}
		}

		return true;
	};

	private moveUp = (): boolean => {
		let curEpisodeIndex = this.state.curEpisodeIndex;
		curEpisodeIndex -= itemsPerRow;

		if (curEpisodeIndex < 0) {
			curEpisodeIndex = this.state.curEpisodeIndex;
		}

		if (curEpisodeIndex !== this.state.curEpisodeIndex) {
			this.setState({ curEpisodeIndex }, this.trackedItemFocused);
			this.context.focusNav.scrollY('up');
			return true;
		}

		return false;
	};

	private moveDown = (): boolean => {
		let curEpisodeIndex = this.state.curEpisodeIndex;
		const maxEpisodeIndex = this.state.maxEpisodeIndex;
		const maxLineIndex = Math.ceil((maxEpisodeIndex + 1) / itemsPerRow) - 1;
		const curLineIndex = Math.floor(curEpisodeIndex / itemsPerRow);

		if (curLineIndex < maxLineIndex) {
			curEpisodeIndex += itemsPerRow;

			if (curEpisodeIndex > this.state.maxEpisodeIndex) {
				curEpisodeIndex = this.state.maxEpisodeIndex;
			}

			if (curEpisodeIndex !== this.state.curEpisodeIndex) {
				this.setState({ curEpisodeIndex }, this.trackedItemFocused);
				this.context.focusNav.scrollY('down');
				return true;
			}
		}

		return false;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
			default:
				break;
		}

		return false;
	};

	private invokeItem = (index?: number) => {
		if (this.context.detailHelper) {
			let curIndex = this.state.curEpisodeIndex;

			if (index !== undefined) {
				this.setState({ curEpisodeIndex: index, isFocused: true });
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

	private onSeasonChanged = index => {
		const { itemDetailData, curSeasonIndex } = this.state;

		if (index >= 0 && curSeasonIndex !== index) {
			const curSeason = itemDetailData.show.seasons.items[index];

			if (!curSeason) return;

			const { id } = curSeason;
			const curSeasonCache = this.props.itemDetailCache[id];

			if (curSeasonCache) {
				itemDetailData.season = curSeasonCache.item;
				this.setState({
					curSeasonIndex: index,
					curEpisodeIndex: 0,
					itemDetailData,
					maxEpisodeIndex: itemDetailData.season.episodes && itemDetailData.season.episodes.items.length - 1
				});
			} else {
				this.setState({ curSeasonIndex: index, curEpisodeIndex: 0 });
				this.props.getSeasonDetail(id);
			}
		}
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private onEpisodesRef = ref => {
		this.episodesRef = ref;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private mouseEnterItem = index => {
		this.setState({ curEpisodeIndex: index }, this.trackedItemFocused);
	};

	render() {
		const { customFields } = this.props;
		const { itemDetailData, curSeasonIndex } = this.state;
		const { seasonDescription } = customFields || ({} as CustomFields);

		if (!itemDetailData) return undefined;

		const seasons = itemDetailData.show.seasons;
		const curSeasonDetail = itemDetailData.season;
		const episodes = curSeasonDetail.episodes && curSeasonDetail.episodes.items;

		return (
			<section className={bem.b()} ref={this.onRef}>
				<SeasonSelector
					index={this.baseIndex - 1}
					seasons={seasons.items}
					focusChanged={this.onSeasonChanged}
					selectedIndex={curSeasonIndex}
				/>
				{seasonDescription && (
					<Description
						index={this.baseIndex}
						focusable={true}
						description={curSeasonDetail.description}
						title={curSeasonDetail.title}
					/>
				)}
				{this.renderEpisodes(episodes)}
			</section>
		);
	}

	private renderEpisodes(episodes: api.ItemSummary[]): any {
		if (!episodes || !episodes.length) return undefined;

		const { activeProfile, clientSide, profile } = this.props;
		const { itemDetailData, curEpisodeIndex, isFocused } = this.state;
		const seasonId = itemDetailData.season.id;

		addWatchPosition(profile, episodes);

		return (
			<div className={bem.e('episodes')} ref={this.onEpisodesRef} onMouseEnter={this.handleMouseEnter}>
				{episodes.map((episode, index) => (
					<EpisodeGridItem
						key={`episode-${episode.id}-${seasonId}`}
						episode={episode}
						index={index}
						focused={curEpisodeIndex === index && isFocused}
						isSignedIn={activeProfile && clientSide}
						onMouseEnter={this.mouseEnterItem}
						onClick={this.invokeItem}
					/>
				))}
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: any): D1EpisodeGridDispatchProps {
	return {
		getSeasonDetail: (itemId: string) => dispatch(getSeasonDetail(itemId))
	};
}

const D1 = connect<undefined, D1EpisodeGridDispatchProps, D1EpisodeGridProps & ProfileProps>(
	undefined,
	mapDispatchToProps
)(D1EpisodeGrid);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(D1 as any).template = template;
export default D1;

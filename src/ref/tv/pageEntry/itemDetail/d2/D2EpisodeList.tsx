import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InjectedIntl, FormattedMessage } from 'react-intl';
import { DropButtonOption } from 'ref/tv/component/DropButton';
import SeasonSelectorModal from 'ref/tv/component/modal/SeasonSelectorModal';
import EpisodeListItem from '../components/EpisodeListItem';
import Description from 'ref/tv/component/Description';
import { getShowSeasonAndEpisode, EpisodeListData } from '../util/episodeList';
import { checkShouldCollapse } from '../util/itemProps';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { stopMove, focusedClass } from 'ref/tv/util/focusUtil';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import ScrollableTextModal from 'ref/tv/component/modal/ScrollableTextModal';
import { getSeasonDetail } from 'shared/cache/cacheWorkflow';
import { D2EpisodeList as template } from 'shared/page/pageEntryTemplate';
import sass from 'ref/tv/util/sass';
import './D2EpisodeList.scss';

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeThumbnail?: boolean;
}

type D2EpisodeListProps = TPageEntryItemDetailProps<CustomFields>;

type D2EpisodeListState = Partial<{
	focused: boolean;
	focusState: 'season' | 'desc' | 'episode';
	canFocusOnDesc: boolean;
	curSeasonIndex: number;
	curEpisodeIndex: number;
	itemDetailData: EpisodeListData;
}>;

interface D2EpisodeListDispatchProps {
	getSeasonDetail: (itemId: string) => any;
}

const bem = new Bem('d2');

class D2EpisodeList extends React.PureComponent<D2EpisodeListProps & D2EpisodeListDispatchProps, D2EpisodeListState> {
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

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private listDescHeight: number;
	private listItemHeight: number;

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

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: 0,
			maxHeight: 0,
			innerTop: 0,
			template: props.template,
			refRowType: 'detail',
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};

		const { episodeThumbnail } = props.customFields || ({} as CustomFields);
		this.listItemHeight = episodeThumbnail ? sass.d2ListThumbnailHeight : sass.d2ListItemHeight;
	}

	componentDidMount() {
		const pageKey = this.props.pageKey;
		this.context.focusNav.registerRow(this.focusableRow);
		this.focusableRow.ref = this.ref;
		this.updateInnerTop();

		if (checkShouldCollapse(pageKey)) {
			// shouldCollapse means current page is of season or episode,
			// so move focus to selector component and make sure the row height has been calculated correctly.
			setImmediate(() => {
				this.context.focusNav.moveToRow(this.focusableRow.index);
			});

			if (pageKey === 'EpisodeDetail') {
				this.setState({ focusState: 'episode' });
			}
		}

		this.context.focusNav.addEventHandler(GlobalEvent.BACK_TO_TOP, 'row' + this.props.index, () => {
			this.setState({ curEpisodeIndex: 0, focusState: 'season' });
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

	componentWillReceiveProps(nextProps: D2EpisodeListProps & D2EpisodeListDispatchProps) {
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

		if (nextProps.customFields !== this.props.customFields) {
			const { episodeThumbnail } = nextProps.customFields || ({} as CustomFields);
			this.listItemHeight = episodeThumbnail ? sass.d2ListThumbnailHeight : sass.d2ListItemHeight;
		}

		this.focusableRow.entryProps = nextProps;
	}

	private updateInnerTop = () => {
		const { seasonDescription } = this.props.customFields || ({} as CustomFields);
		const { focused, focusState, canFocusOnDesc, curEpisodeIndex, itemDetailData } = this.state;
		const descHeight = seasonDescription ? (canFocusOnDesc ? sass.d2SeasonDescMaxHeight : this.listDescHeight) : 0;
		const episodesLength =
			(itemDetailData &&
				itemDetailData.season &&
				itemDetailData.season.episodes &&
				itemDetailData.season.episodes.items.length) ||
			0;
		const maxHeight =
			sass.d2SeasonDropBtnHeight + descHeight + sass.d2ListMarginTop + episodesLength * this.listItemHeight;
		this.focusableRow.maxHeight = maxHeight;
		this.ref.style.height = maxHeight + 'px';

		if (focused) {
			switch (focusState) {
				case 'season':
					this.focusableRow.height = sass.d2SeasonDropBtnHeight;
					this.focusableRow.innerTop = 0;
					break;

				case 'desc':
					this.focusableRow.height = descHeight;
					this.focusableRow.innerTop = sass.d2SeasonDropBtnHeight;
					break;

				case 'episode':
					this.focusableRow.height = this.listItemHeight;
					this.focusableRow.innerTop =
						sass.d2SeasonDropBtnHeight + descHeight + sass.d2ListMarginTop + curEpisodeIndex * this.listItemHeight;
					break;

				default:
					break;
			}

			this.context.focusNav.scrollY();
		} else {
			this.focusableRow.height = maxHeight;
			this.focusableRow.innerTop = 0;
		}
	};

	private setDescHeight = (descHeight: number) => {
		this.listDescHeight = descHeight;
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as D2EpisodeListState;

		if (state) {
			this.setState(
				{
					focused: state.focused,
					focusState: state.focusState,
					canFocusOnDesc: state.canFocusOnDesc,
					curSeasonIndex: state.curSeasonIndex,
					curEpisodeIndex: state.curEpisodeIndex,
					itemDetailData: state.itemDetailData
				},
				this.trackedItemFocused
			);
		}
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { curEpisodeIndex, itemDetailData } = this.state;
		const episodeList = itemDetailData.season.episodes.items;
		const episode = episodeList[curEpisodeIndex];
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			episode,
			this.props as any,
			curEpisodeIndex,
			'tile'
		);
	};

	private setFocus = (isFocus?: boolean): boolean => {
		const { focused, focusState } = this.state;

		if (focused !== isFocus) {
			this.setState({ focused: isFocus });

			if (isFocus && focusState === 'episode') {
				this.trackedItemFocused();
			} else {
				this.trackedItemFocused(true);
			}
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { focusState, canFocusOnDesc, curEpisodeIndex } = this.state;

		switch (focusState) {
			case 'season':
				return false;

			case 'desc':
				this.setState({ focusState: 'season' });
				this.context.focusNav.scrollY('up');
				return true;

			case 'episode':
				const minIndex = 0;
				let tarIndex = curEpisodeIndex - 1;

				if (tarIndex < minIndex) {
					this.trackedItemFocused(true);

					if (canFocusOnDesc) {
						this.setState({ focusState: 'desc' });
					} else {
						this.setState({ focusState: 'season' });
					}
				} else {
					this.setState({ curEpisodeIndex: tarIndex }, this.trackedItemFocused);
				}

				this.context.focusNav.scrollY('up');

				return true;

			default:
				break;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { focusState, canFocusOnDesc, curEpisodeIndex, itemDetailData } = this.state;
		const episodeList = itemDetailData.season.episodes.items;

		switch (focusState) {
			case 'season':
				if (canFocusOnDesc) {
					this.setState({ focusState: 'desc' });
				} else {
					this.setState({ focusState: 'episode' }, this.trackedItemFocused);
				}

				this.context.focusNav.scrollY('down');

				return true;

			case 'desc':
				this.setState({ focusState: 'episode' }, this.trackedItemFocused);
				this.context.focusNav.scrollY('down');
				return true;

			case 'episode':
				const maxIndex = episodeList.length - 1;
				let tarIndex = curEpisodeIndex + 1;

				if (tarIndex > maxIndex) {
					this.trackedItemFocused(true);
					return false;
				} else {
					this.setState({ curEpisodeIndex: tarIndex }, this.trackedItemFocused);
					this.context.focusNav.scrollY('down');
					return true;
				}

			default:
				break;
		}

		return false;
	};

	private exec = (act?: string, focusRow?: 'season' | 'desc' | 'episode', curIndex?: number): boolean => {
		switch (act) {
			case 'click':
				let { focusState, curSeasonIndex, curEpisodeIndex, canFocusOnDesc, itemDetailData } = this.state;

				if (focusRow) {
					this.setState({ focusState: focusRow });
					focusState = focusRow;
				}

				if (curIndex !== undefined) {
					this.setState({ curEpisodeIndex: curIndex });
					curEpisodeIndex = curIndex;
				}

				switch (focusState) {
					case 'season':
						this.context.focusNav.showDialog(
							<SeasonSelectorModal
								show={itemDetailData.show}
								curIndex={curSeasonIndex}
								onItemClicked={this.onSelectedSeason}
							/>
						);
						return true;
					case 'episode':
						const episodeList = itemDetailData.season.episodes.items;
						const episode = episodeList[curEpisodeIndex];

						if (this.context.detailHelper) {
							this.context.focusNav.analytics.triggerItemEvents(
								'CLICK',
								episode,
								this.props as any,
								curEpisodeIndex,
								'tile'
							);
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
						return true;
					case 'desc':
						canFocusOnDesc &&
							this.context.focusNav.showDialog(
								<ScrollableTextModal
									text={itemDetailData.season.description}
									title={itemDetailData.season.title}
									textWrap
								/>
							);
						return true;
					default:
						break;
				}
				return true;
			default:
				break;
		}

		return false;
	};

	private onSelectedSeason = (index: number) => {
		this.context.focusNav.hideDialog();

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

	private onAfterEllipsis = isEllipsis => {
		this.setState({ canFocusOnDesc: isEllipsis });
	};

	private mouseEnterD2 = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		this.setState({ focused: true });
	};

	private mouseEnterSeason = () => {
		this.setState({ focusState: 'season' });
	};

	private mouseEnterDesc = () => {
		this.setState({ focusState: 'desc' });
	};

	private mouseEnterEpisode = index => {
		this.setState({ focusState: 'episode', curEpisodeIndex: index }, this.trackedItemFocused);
	};

	private mouseClickSeason = () => {
		this.exec('click', 'season');
	};

	private mouseClickDesc = () => {
		this.exec('click', 'desc');
	};

	private mouseClickEpisode = index => {
		this.exec('click', 'episode', index);
	};

	render() {
		const { customFields } = this.props;
		const { itemDetailData, focusState, focused, canFocusOnDesc } = this.state;
		const { seasonDescription } = customFields || ({} as CustomFields);

		if (!itemDetailData) return undefined;

		const seasons = itemDetailData.show.seasons;
		const curSeasonDetail = itemDetailData.season;
		const episodes = curSeasonDetail.episodes && curSeasonDetail.episodes.items;
		let dropBtnOptions: DropButtonOption[] = [];
		seasons.items.map(e => {
			dropBtnOptions.push({
				key: e.id,
				label: e.title
			});
		});

		return (
			<section className={cx(bem.b(), 'clearfix')} ref={ref => (this.ref = ref)} onMouseEnter={this.mouseEnterD2}>
				<div className={bem.e('season-group')}>
					<div
						className={bem.e('season', { focused: focusState === 'season' && focused })}
						onMouseEnter={this.mouseEnterSeason}
						onClick={this.mouseClickSeason}
					>
						<FormattedMessage id="itemDetail_seasonList_season_label" values={{ season: curSeasonDetail.seasonNumber }}>
							{value => <span>{value}</span>}
						</FormattedMessage>
						<i className={cx(bem.e('drop-icon'), 'icon icon-drop-button')} />
					</div>
				</div>
				{seasonDescription && (
					<Description
						className={cx(bem.e('description'), focused && canFocusOnDesc && focusState === 'desc' ? focusedClass : '')}
						focusable={false}
						description={curSeasonDetail.description}
						title={curSeasonDetail.title}
						afterEllipsis={this.onAfterEllipsis}
						setDescHeight={this.setDescHeight}
						onMouseEnter={this.mouseEnterDesc}
						onClick={this.mouseClickDesc}
					/>
				)}
				{this.renderEpisodes(episodes)}
			</section>
		);
	}

	private renderEpisodes(episodes: api.ItemSummary[]): any {
		if (!episodes || !episodes.length) return undefined;

		const { activeProfile, clientSide, customFields } = this.props;
		const { focused, curSeasonIndex, curEpisodeIndex, focusState, itemDetailData } = this.state;
		const { season } = itemDetailData;
		const { episodeThumbnail } = customFields || ({} as CustomFields);
		const isFocused = focused && focusState === 'episode';
		const { seasonNumber } = season;

		return (
			<div className={bem.e('episodes')}>
				<div className={bem.e('seasonNo')}>{curSeasonIndex}</div>
				{episodes.map((episode, i) => (
					<EpisodeListItem
						key={`episode-${episode.id}`}
						episode={episode}
						seasonNumber={seasonNumber}
						focused={isFocused && i === curEpisodeIndex}
						displayThumbnail={episodeThumbnail}
						isSignedIn={activeProfile && clientSide}
						index={i}
						onMouseEnter={this.mouseEnterEpisode}
						onClick={this.mouseClickEpisode}
					/>
				))}
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: any): D2EpisodeListDispatchProps {
	return {
		getSeasonDetail: (itemId: string) => dispatch(getSeasonDetail(itemId))
	};
}

const D2 = connect<undefined, D2EpisodeListDispatchProps, D2EpisodeListProps>(
	undefined,
	mapDispatchToProps
)(D2EpisodeList);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(D2 as any).template = template;
export default D2;

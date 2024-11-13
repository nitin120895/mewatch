import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { getNextPlaybackItem } from 'shared/service/profile';
import { getAnonymousNextPlaybackItem as getAnonNextPlaybackItem } from 'shared/service/content';
import { IPlayerStateData, VideoPlayerActions, VideoPlayerStates } from 'shared/analytics/types/playerStatus';
import { IVideoProgress } from 'shared/analytics/types/v3/event/videoEvents';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import Asset from 'ref/tv/component/Asset';
import EllipsisLabel from 'ref/tv/component/EllipsisLabel';
import CountDownTimer from 'ref/tv/pageEntry/player/components/CountDownTimer';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { getDefaultImageWidthByImageType } from 'ref/tv/util/itemUtils';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import sass from 'ref/tv/util/sass';
import 'ref/tv/pageEntry/player/components/PlayerAutoPlayPanel.scss';

const bem = new Bem('player-end');
const bemInfo = new Bem('player-end-episode-info');
const bemRL = new Bem('player-end-relatedList');
const deviceType = DeviceModel.deviceInfo().type;

interface PlayerAutoPlayPanelProps extends PageEntryItemProps {
	classNames?: string;
	focused?: boolean;
	show: boolean;
	enableCountDown: boolean;
	relatedList: api.ItemList;
	onPageChange: () => void;
	onMouseEnter: () => void;
	trackEvents: (
		type: string,
		option: VideoPlayerActions | VideoPlayerStates,
		data?: Partial<IPlayerStateData> & IVideoProgress
	) => void;
}

type PlayerAutoPlayPanelStateProps = Partial<{
	itemImageTypes: any;
	playback: api.AppConfigPlayback;
	activeAccount: boolean;
	subscriptionCode: string;
}>;

type PlayerAutoPlayPanelState = {
	nextEpisode: api.ItemDetail;
	curIndex: number;
};

/**
 * For episode, show next episode
 */
class PlayerAutoPlayPanel extends React.Component<
	PlayerAutoPlayPanelProps & PlayerAutoPlayPanelStateProps,
	PlayerAutoPlayPanelState
> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired
	};

	private item: api.ItemSummary;
	private maxIndex: number;
	private relatedMode: boolean;
	private nextEpisodeEntitlement: boolean;
	private remainSeconds: number;

	constructor(props) {
		super(props);
		this.item = props.item;
		this.state = {
			nextEpisode: undefined,
			curIndex: 0
		};

		if (props.activeAccount) {
			getNextPlaybackItem(props.item.id, {
				device: deviceType,
				expand: 'parent',
				sub: this.props.subscriptionCode
			}).then(results => {
				if (results.data.next) this.setState({ nextEpisode: results.data.next, curIndex: 0 });
			});
		} else {
			getAnonNextPlaybackItem(props.item.id, { device: deviceType, expand: 'parent' }).then(results => {
				if (results.data.next) this.setState({ nextEpisode: results.data.next, curIndex: 0 });
			});
		}

		this.relatedMode = this.item.type !== 'episode';
	}

	componentWillReceiveProps(nextProps: PlayerAutoPlayPanelProps & PlayerAutoPlayPanelStateProps) {
		if (nextProps.item && nextProps.item !== this.item) {
			this.item = nextProps.item;
		}

		if (nextProps.focused !== this.props.focused) {
			if (nextProps.focused) {
				this.trackedItemFocused(nextProps);
			} else {
				this.trackedItemFocused(nextProps, true);
			}
		}
	}

	render() {
		return (
			<div className={cx(bem.b(), this.props.classNames)}>
				{this.props.item.type === 'episode' && this.renderNextEpisode(this.state.nextEpisode)}
				{this.props.item.type !== 'episode' && this.renderRecommendItems()}
			</div>
		);
	}

	private renderNextEpisode(nextEpisode: api.ItemDetail) {
		if (!nextEpisode) {
			this.relatedMode = true;
			return this.renderRecommendItems();
		}

		let imageType = this.props.itemImageTypes[nextEpisode.type];

		if (!imageType) {
			imageType = 'poster';
		}

		const itemWidth = getDefaultImageWidthByImageType(imageType);

		this.nextEpisodeEntitlement = canPlay(nextEpisode);

		return (
			<div className={bem.e('episode')}>
				<div className={bem.e('thumbnail')}>
					<Asset
						item={nextEpisode}
						imageType={imageType}
						imageOptions={{ width: itemWidth }}
						itemMargin={sass.assetListItemMargin}
						focused={this.props.focused}
						assetMouseEnter={this.props.onMouseEnter}
						onClick={this.invokeItem}
					/>
				</div>
				<div className={bemInfo.b()}>
					<IntlFormatter tagName="div" className={bemInfo.e('next')}>
						{`@{player_panel_next_episode|NEXT EPISODE}`}
					</IntlFormatter>
					<IntlFormatter
						tagName="div"
						className={bemInfo.e('number')}
						values={{
							seasonNumber: (nextEpisode.season && nextEpisode.season.seasonNumber) || nextEpisode.seasonNumber,
							episodeNumber: nextEpisode.episodeNumber
						}}
					>
						{`@{player_panel_title_metadata|S{seasonNumber} E{episodeNumber}}`}
					</IntlFormatter>
					<EllipsisLabel className={bemInfo.e('title')} text={nextEpisode.episodeName || nextEpisode.title} />
				</div>
				{this.props.playback.chainPlayCountdown !== 0 && this.props.show && this.nextEpisodeEntitlement && (
					<div className={bem.e('count-down', { show: this.props.enableCountDown })}>
						<IntlFormatter tagName="span" className={bem.e('starting-in')}>
							{`@{player_panel_starting|Starting in}`}
						</IntlFormatter>
						<div className={bem.e('timer')}>
							<CountDownTimer
								timeRunout={this.onTimeRunout}
								totalSeconds={this.props.playback.chainPlayCountdown}
								isActive={this.props.enableCountDown}
								setRemainSeconds={this.setRemainSeconds}
							/>
						</div>
					</div>
				)}
			</div>
		);
	}

	private renderRecommendItems() {
		const list = this.props.relatedList ? this.props.relatedList.items.slice(0, 3) : [];
		let imageType = this.props.itemImageTypes[this.props.item.type];

		if (list.length === 0) {
			this.focusable = false;
			return <div />;
		}

		if (!imageType) {
			imageType = 'poster';
		}

		const itemWidth = getDefaultImageWidthByImageType(imageType);
		this.maxIndex = list.length - 1;

		const items = list.map((s, i) => {
			const focused = this.state.curIndex === i && this.props.focused;
			return (
				<div className={bemRL.e('item')} key={`related-${i + 1}`}>
					<Asset
						item={s}
						imageType={imageType}
						imageOptions={{ width: itemWidth }}
						itemMargin={sass.assetListItemMargin}
						focused={focused}
						index={i}
						assetMouseEnter={this.mouseEnterItem}
						onClick={this.invokeItem}
					/>
				</div>
			);
		});

		return (
			<div className={bemRL.b()}>
				<IntlFormatter tagName="div" className={bemRL.e('title')}>
					{`@{player_panel_also_like|YOU MIGHT ALSO LIKE}`}
				</IntlFormatter>
				<div className={bemRL.e('list')} onMouseEnter={this.props.onMouseEnter}>
					{items}
				</div>
			</div>
		);
	}

	private mouseEnterItem = index => {
		this.setState({ curIndex: index }, this.trackedItemFocused);
	};

	private setRemainSeconds = (remainSeconds: number) => {
		this.remainSeconds = remainSeconds;
	};

	private onTimeRunout = () => {
		this.context.detailHelper.isInChainingPlay = true;
		this.props.onPageChange();
		this.context.focusNav.hideDialog();
		this.props.trackEvents('action', VideoPlayerActions.ChainPlay, { countdown: 0, nextItem: this.state.nextEpisode });
		this.context.router.replace(this.state.nextEpisode.watchPath);
	};

	focusable = true;

	private trackedItemFocused = (
		props?: PlayerAutoPlayPanelProps & PlayerAutoPlayPanelStateProps,
		isMouseLeave?: boolean
	) => {
		const { nextEpisode, curIndex } = this.state;
		const curProps = props || this.props;
		const { item, itemImageTypes, relatedList } = curProps;
		const imageType = itemImageTypes[item.type] || 'poster';

		if (nextEpisode) {
			this.context.focusNav.analytics.triggerItemEvents(
				isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
				nextEpisode,
				curProps as any,
				0,
				imageType
			);
		} else {
			relatedList &&
				this.context.focusNav.analytics.triggerItemEvents(
					isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
					relatedList.items[curIndex],
					curProps as any,
					curIndex,
					imageType
				);
		}
	};

	moveLeft() {
		if (this.relatedMode) {
			let curIndex = this.state.curIndex;

			if (curIndex > 0) {
				curIndex--;
				this.setState({ curIndex }, this.trackedItemFocused);
			}
		}

		return true;
	}

	moveRight() {
		if (this.relatedMode) {
			let curIndex = this.state.curIndex;

			if (curIndex < this.maxIndex) {
				curIndex++;
				this.setState({ curIndex }, this.trackedItemFocused);
			}
		}

		return true;
	}

	invokeItem = () => {
		const { nextEpisode, curIndex } = this.state;
		const { onPageChange, itemImageTypes, item, relatedList, trackEvents, playback } = this.props;
		const { focusNav, detailHelper, router } = this.context;
		const imageType = itemImageTypes[item.type] || 'poster';
		onPageChange();

		if (nextEpisode) {
			focusNav.analytics.triggerItemEvents('CLICK', nextEpisode, this.props as any, curIndex, imageType);

			if (this.nextEpisodeEntitlement) {
				const countdown = playback.chainPlayCountdown ? this.remainSeconds : -1;
				detailHelper.isInChainingPlay = true;
				trackEvents('action', VideoPlayerActions.ChainPlay, { countdown, nextItem: nextEpisode });
				focusNav.analytics.triggerItemWatched(true, nextEpisode);
				router.replace(nextEpisode.watchPath);
			} else {
				detailHelper.isInChainingPlay = false;
				router.replace(nextEpisode.path);
			}
		} else {
			const list = relatedList ? relatedList.items : [];
			focusNav.analytics.triggerItemEvents('CLICK', list[curIndex], this.props as any, curIndex, imageType);
			router.replace(list[curIndex].path);
		}
	};
}

function mapStateToProps(state: state.Root): PlayerAutoPlayPanelStateProps {
	return {
		itemImageTypes: state.app.config.general.itemImageTypes,
		playback: state.app.config.playback,
		activeAccount: state.account.active,
		subscriptionCode: state.account.info && state.account.info.subscriptionCode
	};
}

function mapDispatchToProps(dispatch: any): any {
	return {};
}

export default connect<PlayerAutoPlayPanelStateProps, any, PlayerAutoPlayPanelProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(PlayerAutoPlayPanel);

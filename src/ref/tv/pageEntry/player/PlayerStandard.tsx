import * as React from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { VideoError, VideoErrorCode } from 'shared/util/VideoError';
import { openPlayer, closePlayer } from 'shared/app/playerWorkflow';
import { getUserRating, getResumePosition } from 'shared/account/profileUtil';
import { rateItem, saveResumePosition } from 'shared/account/profileWorkflow';
import { promptSignIn } from 'shared/account/sessionWorkflow';
import { startedPlaying } from 'shared/cache/cacheWorkflow';
import { AnalyticsContext } from 'shared/analytics/types/types';
import { IPlayerStateData, VideoPlayerActions, VideoPlayerStates } from 'shared/analytics/types/playerStatus';
import { IVideoProgress } from 'shared/analytics/types/v3/event/videoEvents';
import { PlayerStandard as template } from 'shared/page/pageEntryTemplate';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import PlayerAutoPlayPanel from 'ref/tv/pageEntry/player/components/PlayerAutoPlayPanel';
import ProgressCtrl from './components/ProgressCtrl';
import PlayerControls from './components/PlayerControls';
import PlayerInfo from './components/PlayerInfo';
import PlayerActions from './components/PlayerActions';
import PlayerActionsSub from './components/PlayerActionsSub';
import Video from './playerCore/Player';
import { PlayerCore, PlayerCoreProps } from './playerCore/PlayerCore';
import { PlayerAPI, AudioTrack, TextTrack, PlayState, PlayerProperties } from './playerCore/PlayerAPI';
import { mapServiceErrorCodeToVideoErrorCode } from './playerCore/PlayerUtil';
import CommonMsgModal from 'ref/tv/component/modal/CommonMsgModal';
import RateModal from 'ref/tv/component/modal/RateModal';
import Spinner from 'ref/tv/component/Spinner';
import SwitchProfileModal from 'ref/tv/component/modal/SwitchProfileModal';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import { PageNavigationArrow } from 'ref/tv/util/PageNavigationArrow';
import './PlayerStandard.scss';

const bem = new Bem('player-standard');
const id = 'PlayerStandard';

enum FocusState {
	actions = 'actions',
	controls = 'controls',
	sub = 'sub',
	end = 'end',
	pip = 'pip'
}

const focusStateMap = {
	actions: {
		up: undefined,
		down: FocusState.controls,
		left: undefined,
		right: undefined
	},
	controls: {
		up: FocusState.actions,
		down: FocusState.sub,
		left: undefined,
		right: undefined
	},
	sub: {
		up: FocusState.controls,
		down: undefined,
		left: undefined,
		right: undefined
	},
	end: {
		up: FocusState.actions,
		down: undefined,
		left: undefined,
		right: undefined
	}
};

interface PlayerStandardProps {
	device: string;
	account: state.Account;
	player: state.PlayerItem;
	subscriptionCode?: string;
	prompt?: AuthPrompt;
	rateItem: (item: api.ItemSummary, rating: number, ratingScale: number) => void;
	saveResumePosition: (item: api.ItemSummary, position: number) => void;
	startedPlaying: (item: api.ItemDetail) => void;
	openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) => Promise<any>;
	closePlayer: (playerId: string) => Promise<any>;
	promptSignIn: () => void;
}

interface PlayerStandardState {
	isInteracting: boolean;
	focusState: FocusState;
	isShowCC: boolean;
	isShowSound: boolean;
	subItems?: string[];
	enableCountDown: boolean;
	cc?: { key: string; src: string }[];
	isFullscreen: boolean;
	relatedList: api.ItemList;
	loading?: boolean;
	disposing?: boolean;
}

interface VideoState {
	src: api.MediaFile;
	video: PlayerAPI;
	curPos: number;
	resumePosition: number;
	duration: number;
	playState: PlayState;
	playrate: number;
	audioTracks?: AudioTrack[];
	selectedAudio?: string;
	textTracks?: TextTrack[];
	selectedText?: string;
	isEndMode?: boolean;
	playComplete?: boolean;
}

const hideControlsTime = 3000;

class PlayerStandardClass extends React.Component<
	PageEntryItemProps & PlayerStandardProps,
	PlayerStandardState & VideoState
> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
		emitVideoEvent: AnalyticsContext['emitVideoEvent'];
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired,
		emitVideoEvent: PropTypes.func
	};

	private player: PlayerCore<PlayerCoreProps>;
	private video: PlayerAPI;
	private focusableRow: Focusable;
	private playerActions: PlayerActions;
	private playerControls: PlayerControls;
	private playerActionsSub: PlayerActionsSub;
	private playerAutoPlayPanel: any;
	private interactingTimer;
	private targetItem: api.ItemSummary;
	private pinOpen = false;
	private recentPlayItem: api.ItemSummary;
	private recentPlayerId: string;

	constructor(props) {
		super(props);

		this.focusableRow = {
			focusable: true,
			index: 1,
			height: 1,
			forceScrollTop: true,
			ref: undefined,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};

		this.state = {
			src: undefined,
			isInteracting: false,
			isShowCC: false,
			isShowSound: false,
			curPos: 0,
			resumePosition: 0,
			duration: undefined,
			playState: PlayState.LOADING,
			playrate: 1,
			focusState: FocusState.controls,
			video: undefined,
			enableCountDown: true,
			cc: this.getCC(),
			isEndMode: false,
			isFullscreen: true,
			relatedList: undefined,
			loading: true,
			playComplete: false
		};
	}

	componentDidMount() {
		this.context.focusNav.hideGlobalHeader();
		this.context.focusNav.registerRow(this.focusableRow);
		this.context.focusNav.setFocus(this.focusableRow);

		this.context.focusNav.addEventHandler(GlobalEvent.KEY_DOWN, id, () => {
			this.context.detailHelper.resetTimeoutTimer(this.activeCountDown);
		});

		this.player && this.player.onLoadingTimeout.push({ key: id, value: this.onLoadingTimeout });
		this.player && this.player.onError.push({ key: id, value: this.onError });

		this.recentPlayItem = this.props.item;
		this.recentPlayerId = this.props.id;
		this.setState({ disposing: false });
		this.openVideoPlayer(this.props, this.props.item);
		this.trackPlaybackEvents('state', VideoPlayerStates.INITIAL, { isUserEnacted: false, item: this.recentPlayItem });
		this.context.detailHelper.initTimeoutTimer(this.inactiveCountDown);
	}

	componentWillReceiveProps(nextProps: PageEntryItemProps & PlayerStandardProps) {
		if (this.props.account && this.props.account.active !== nextProps.account.active) {
			if (this.context.focusNav.nextAction && nextProps.account.active) {
				// MASTVR-786: User should be returned to the homepage
				this.context.router.push('/');
				return;
			}
		}

		if (nextProps.item && nextProps.item !== this.recentPlayItem) {
			this.context.focusNav.resetFocus();
			this.context.focusNav.unregisterRow(this.focusableRow);
			this.saveResumePosition();
			this.disposeVideo();
			nextProps.closePlayer(this.recentPlayerId);
			this.recentPlayItem = nextProps.item;
			this.recentPlayerId = undefined;
			this.setState({ disposing: true });
			return;
		}

		if (nextProps.id && nextProps.id !== this.recentPlayerId) {
			this.context.focusNav.registerRow(this.focusableRow);
			this.context.focusNav.setFocus(this.focusableRow);
			this.recentPlayerId = nextProps.id;
			this.setState({
				disposing: false,
				src: undefined,
				curPos: 0,
				resumePosition: 0,
				duration: undefined,
				playState: PlayState.LOADING,
				focusState: FocusState.controls,
				video: undefined,
				isEndMode: false,
				isFullscreen: true,
				relatedList: undefined,
				loading: true,
				playComplete: false
			});
			this.openVideoPlayer(nextProps, this.recentPlayItem);
			this.trackPlaybackEvents('state', VideoPlayerStates.INITIAL, { isUserEnacted: false, item: this.recentPlayItem });
			return;
		}

		if (
			!this.pinOpen &&
			nextProps.prompt &&
			nextProps.prompt.type === 'pin' &&
			this.context.detailHelper.profile.info
		) {
			this.trackPlaybackEvents('state', VideoPlayerStates.DEFAULT);
			this.pinOpen = true;
			this.context.focusNav.showDialog(
				<SwitchProfileModal
					account={this.context.detailHelper.account}
					isParentalLock={true}
					pinInputDone={this.pinInputDone}
				/>
			);
			return;
		}

		if (
			nextProps.item &&
			nextProps.player.data &&
			nextProps.player.data.length > 0 &&
			nextProps.player.data !== this.props.player.data
		) {
			this.loadingVideo(nextProps.item, nextProps.player.data);
			return;
		}

		if (this.props.player && !this.props.player.error && nextProps.player && nextProps.player.error) {
			const videoError = Object.assign({}, nextProps.player.error);
			videoError.code = mapServiceErrorCodeToVideoErrorCode(videoError.code, videoError.status);
			this.trackPlaybackEvents('state', VideoPlayerStates.ERROR, {
				item: nextProps.item,
				error: videoError
			});
			this.onError(nextProps.player.error.message);
		}
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.removeEventHandler(GlobalEvent.KEY_DOWN, id);
		PageNavigationArrow.hide();

		if (this.player) {
			this.player.onLoadingTimeout.splice(this.player.onLoadingTimeout.findIndex(p => p.key === id));
			this.player.onError.splice(this.player.onError.findIndex(p => p.key === id));
		}

		this.saveResumePosition();
		this.disposeVideo();
		this.props.closePlayer(this.recentPlayerId);
		this.context.detailHelper.clearTimeoutCallback();

		this.setState({ disposing: true });
	}

	componentDidUpdate() {
		PageNavigationArrow.hide();
	}

	render() {
		if (this.state.disposing) return <span />;

		const { device, item, activeProfile } = this.props;
		const {
			isInteracting,
			isEndMode,
			playState,
			isFullscreen,
			focusState,
			loading,
			resumePosition,
			disposing,
			playComplete,
			src,
			curPos,
			duration,
			playrate,
			video,
			subItems,
			isShowCC,
			isShowSound,
			selectedText,
			selectedAudio,
			relatedList,
			enableCountDown
		} = this.state;

		const thumbUrl = item.customFields && item.customFields['ThumbsUrl'];
		let backImageStyle;
		if (item.images && item.images['wallpaper'] && !isFullscreen) {
			backImageStyle = {
				backgroundImage: `url("${item.images['wallpaper']}")`
			};
		}

		return (
			<div className={bem.b()} style={backImageStyle}>
				<div
					className={bem.e('video', { isFullscreen, focused: focusState === FocusState.pip, playComplete })}
					onClick={!isFullscreen && this.invokeItem}
					onMouseEnter={() => {
						!isFullscreen && this.handleMouseEnter(FocusState.pip);
					}}
				>
					<Video
						device={device}
						ref={this.onRef}
						videoItem={src}
						playItemType={this.recentPlayItem && this.recentPlayItem.type}
						resumePosition={resumePosition}
						isFullscreen={isFullscreen}
						isLoading={loading}
						playerStateChanged={this.onPlayerStateChanged}
						onPlayerPropertiesChanged={this.onPlayerPropertiesChanged}
						endModeChanged={this.onEndModeChanged}
						onVideoStop={this.context.focusNav.goBack}
					/>
				</div>
				<div className={bem.e('cover', { show: isInteracting || !isFullscreen })} />
				<div
					className={bem.e('controls', { show: isInteracting && isFullscreen })}
					onMouseEnter={() => {
						isFullscreen && this.handleMouseEnter(FocusState.controls);
					}}
				>
					<ProgressCtrl position={curPos} duration={duration} playrate={playrate} thumbUrl={thumbUrl} />
					<PlayerControls
						focused={focusState === 'controls'}
						player={video}
						isPlay={playState === PlayState.PLAYING}
						show={true}
						ref={ref => (this.playerControls = ref)}
						clickCC={this.showCC}
						clickSound={this.showSound}
					/>
					<PlayerActionsSub
						classNames={bem.e('sub', { show: isShowCC || isShowSound })}
						ref={ref => (this.playerActionsSub = ref)}
						focused={focusState === 'sub'}
						actions={subItems}
						selectedItem={isShowCC ? selectedText : selectedAudio}
						click={this.onClickSubItem}
					/>
				</div>
				<div
					className={bem.e('info', { show: !isFullscreen || isInteracting })}
					onMouseEnter={() => {
						isFullscreen && this.handleMouseEnter(FocusState.controls);
					}}
				>
					<PlayerInfo item={item} isPIP={!isFullscreen} setTargetItem={this.setTargetItem} />
					<PlayerActions
						classNames={bem.e('actions')}
						isPIP={!isFullscreen}
						focused={focusState === 'actions'}
						item={item}
						activeProfile={activeProfile}
						ref={ref => (this.playerActions = ref)}
						click={this.onClickPlayerAction}
						mouseEnter={() => this.handleMouseEnter(FocusState.actions)}
					/>
				</div>
				<PlayerAutoPlayPanel
					classNames={bem.e('auto', { show: isEndMode && !isFullscreen })}
					show={isEndMode && !disposing && !isFullscreen}
					enableCountDown={enableCountDown}
					{...this.props}
					focused={focusState === 'end'}
					ref={ref => {
						this.playerAutoPlayPanel = ref && ref.refs.wrappedInstance;
					}}
					relatedList={relatedList}
					onPageChange={this.onPageChange}
					onMouseEnter={() => {
						!isFullscreen && this.handleMouseEnter(FocusState.end);
					}}
					trackEvents={this.trackPlaybackEvents}
				/>
				<div className={bem.e('loading', { loading, isFullscreen })}>
					<Spinner type={'player'} className={bem.e('spinner')} />
				</div>
			</div>
		);
	}

	private trackPlaybackEvents = (
		type: string,
		option: VideoPlayerActions | VideoPlayerStates,
		data: Partial<IPlayerStateData> & IVideoProgress = {}
	) => {
		switch (type) {
			case 'state':
				this.context.emitVideoEvent({ type: 'state', state: option as VideoPlayerStates, data });
				break;

			case 'action':
				this.context.emitVideoEvent({ type: 'action', action: option as VideoPlayerActions, data });
				break;

			default:
				break;
		}
	};

	private trackVideoProgressEvent = (position: number) => {
		const bitRate = this.video.getStreamBandwidth();
		const duration = this.video.getDuration();
		const data = {
			path: this.state.src && this.state.src.url,
			bitRate,
			duration,
			seconds: position,
			minutes: Math.floor(position / 60),
			percent: Math.round((position / duration) * 100)
		};
		this.trackPlaybackEvents('action', VideoPlayerActions.Progress, data);
	};

	private activeCountDown = () => {
		const { isEndMode, enableCountDown } = this.state;

		if (!isEndMode && !enableCountDown) {
			this.setState({ enableCountDown: true });
		}
	};

	private inactiveCountDown = () => {
		if (this.state.enableCountDown) {
			this.setState({ enableCountDown: false });
		}
	};

	private handleMouseEnter = (focusState: FocusState) => {
		const { isFullscreen } = this.state;

		if (isFullscreen) {
			this.setState({ isInteracting: true, focusState: focusState });
			this.resetInteractingTimer();
		} else {
			this.setState({ focusState: focusState });
		}
	};

	private pinInputDone = () => {
		this.pinOpen = false;
		this.trackPlaybackEvents('state', VideoPlayerStates.INITIAL, { item: { path: '' } as any });
	};

	private setTargetItem = item => {
		this.targetItem = item;
	};

	private saveResumePosition = () => {
		if (this.video) {
			const pos = this.video.getPosition();
			this.props.saveResumePosition(this.recentPlayItem, Math.floor(pos));
		}
	};

	private disposeVideo = () => {
		if (!this.video) return;

		this.video.stop();
		this.video.dispose();
	};

	private loadingVideo = (item: api.ItemSummary, videos: api.MediaFile[]) => {
		let videoSource;
		let medias: api.MediaFile;

		for (let i = 0; i < videos.length; i++) {
			medias = videos[i];
			if (medias.drm === 'None' && medias.format === 'video/mpd') {
				videoSource = medias;
				break;
			}
		}

		if (!videoSource) {
			this.trackPlaybackEvents('state', VideoPlayerStates.ERROR, {
				item,
				error: new VideoError('Invalid video', VideoErrorCode.BadVideoDataError)
			});
			this.onError();
			return;
		}

		this.trackPlaybackEvents('state', VideoPlayerStates.LOADING, {
			isUserEnacted: false,
			item,
			path: videoSource.url
		});

		if (!this.context.detailHelper.isInChainingPlay) {
			const resumePosition = getResumePosition(item.id);

			if (resumePosition > 0) {
				this.setState({ src: videoSource, resumePosition });
				return;
			}
		}

		this.setState({ src: videoSource, resumePosition: 0 });
	};

	private openVideoPlayer = (props: PageEntryItemProps & PlayerStandardProps, item: api.ItemDetail) => {
		const { id, openPlayer, startedPlaying, subscriptionCode } = props;
		startedPlaying(item);
		openPlayer(item, id, subscriptionCode);
	};

	private onRef = ref => {
		if (ref) {
			this.player = ref;
			this.video = ref.video;
		}
	};

	private restoreSavedState = (savedState: object) => {
		return true;
	};

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveLeft = (): boolean => {
		this.setState({ isInteracting: true });

		const { focusState, isEndMode } = this.state;

		switch (focusState) {
			case 'controls':
				this.playerControls.moveLeft();
				this.resetInteractingTimer();
				break;

			case 'actions':
				this.playerActions.moveLeft();
				this.resetInteractingTimer();
				break;

			case 'pip':
				this.setState({ focusState: FocusState.actions });
				break;

			case 'sub':
				this.playerActionsSub.moveLeft();
				break;

			case 'end':
				this.playerAutoPlayPanel.moveLeft && this.playerAutoPlayPanel.moveLeft();
				break;

			default:
				break;
		}

		if (isEndMode) {
			this.setState({ enableCountDown: false });
		}

		return true;
	};

	private moveRight = (): boolean => {
		this.setState({ isInteracting: true });

		const { focusState, isFullscreen, isEndMode, playComplete } = this.state;

		switch (focusState) {
			case 'controls':
				this.playerControls.moveRight();
				this.resetInteractingTimer();
				break;

			case 'actions':
				if (this.playerActions && !this.playerActions.moveRight()) {
					if (!isFullscreen && isEndMode && !playComplete) {
						this.setState({ focusState: FocusState.pip });
					}
				}
				this.resetInteractingTimer();
				break;

			case 'sub':
				this.playerActionsSub.moveRight();
				break;

			case 'end':
				this.playerAutoPlayPanel.moveRight && this.playerAutoPlayPanel.moveRight();
				break;

			default:
				break;
		}

		if (isEndMode) {
			this.setState({ enableCountDown: false });
		}

		return true;
	};

	private moveUp = (): boolean => {
		if (this.state.loading && !this.state.isEndMode) {
			return true;
		}

		this.setState({ isInteracting: true });
		this.resetInteractingTimer();

		const { focusState, isEndMode } = this.state;

		if (isEndMode) {
			this.setState({ enableCountDown: false });

			switch (focusState) {
				case FocusState.end:
				case FocusState.controls:
					this.setState({ focusState: FocusState.actions });
					return true;
			}
			return true;
		}

		const direction = 'up';
		const tarFocusState = focusStateMap[focusState] && focusStateMap[focusState][direction];

		if (tarFocusState) {
			if (focusState === 'sub') {
				this.setState({
					isShowCC: false,
					isShowSound: false
				});
			}
			this.setState({ focusState: tarFocusState });
		}

		return true;
	};

	private moveDown = (): boolean => {
		if (this.state.loading && !this.state.isEndMode) {
			return true;
		}

		this.setState({ isInteracting: true });

		const { focusState, isEndMode, isFullscreen } = this.state;

		if (isEndMode) {
			this.setState({ enableCountDown: false });

			switch (focusState) {
				case FocusState.pip:
				case FocusState.actions:
					if (isFullscreen) {
						this.setState({ focusState: FocusState.controls });
					} else {
						this.setState({ focusState: FocusState.end });
					}

					return true;
			}

			return true;
		}

		const direction = 'down';
		const tarFocusState = focusStateMap[focusState] && focusStateMap[focusState][direction];

		if (tarFocusState) {
			if (tarFocusState === 'sub') {
				const { isShowCC, isShowSound } = this.state;

				if (isShowCC && isShowSound) {
					this.setState({ focusState: tarFocusState });
				}
			} else if (tarFocusState === 'end') {
				if (this.playerAutoPlayPanel.focusable) {
					this.setState({ focusState: tarFocusState });
				}
			} else {
				this.setState({ focusState: tarFocusState });
				this.resetInteractingTimer();
			}
		}

		return true;
	};

	private exec = (act?: string) => {
		if (act !== 'esc') {
			this.setState({ isInteracting: true });
		}

		switch (act) {
			case 'click':
				this.invokeItem();
				return true;

			case 'esc':
				const { isShowCC, isShowSound, isEndMode, isFullscreen, playComplete } = this.state;

				if (isShowCC || isShowSound) {
					this.setState({
						isShowCC: false,
						isShowSound: false,
						focusState: FocusState.controls
					});

					this.resetInteractingTimer();

					return true;
				}

				if (isEndMode && isFullscreen) {
					this.setState({
						isFullscreen: false,
						enableCountDown: true,
						focusState: !playComplete ? FocusState.pip : FocusState.end
					});
					return true;
				}
				break;

			default:
				break;
		}

		return false;
	};

	private invokeItem = () => {
		const { focusState } = this.state;

		switch (focusState) {
			case 'controls':
				if (this.state.playState === PlayState.LOADING || this.state.playState === PlayState.BUFFERING) {
					return false;
				} else {
					this.playerControls && this.playerControls.invokeItem();
				}

				break;

			case 'actions':
				this.playerActions && this.playerActions.invokeItem();
				break;

			case 'pip':
				this.setState({ isFullscreen: true, focusState: FocusState.controls });
				break;

			case 'sub':
				this.playerActionsSub && this.playerActionsSub.invokeItem();
				break;

			case 'end':
				this.playerAutoPlayPanel && this.playerAutoPlayPanel.invokeItem();
				break;

			default:
				break;
		}
	};

	private onEndModeChanged = (isEndMode: boolean) => {
		this.setState({ isEndMode });

		if (isEndMode) {
			const { src } = this.state;
			const duration = this.video.getDuration();
			const resumePosition = duration - this.video.endingTime;
			const eventData = { isUserEnacted: false, item: this.recentPlayItem, path: src && src.url };

			this.trackVideoProgressEvent(resumePosition);

			if (this.recentPlayItem.type !== 'trailer') {
				this.trackPlaybackEvents('state', VideoPlayerStates.COMPLETED, eventData);

				if (!this.state.playComplete) {
					this.trackPlaybackEvents('state', VideoPlayerStates.PLAYING, eventData);
				}

				this.setState({
					focusState: this.playerAutoPlayPanel.focusable ? FocusState.end : FocusState.actions,
					isFullscreen: false,
					enableCountDown: true
				});

				this.context.detailHelper.getItemRelatedList(this.props.item, ret => {
					if (ret) {
						this.setState({ relatedList: ret });
					}
				});
			}
		}
	};

	private onClickPlayerAction = (act: 'detail' | 'rate' | 'replay' | 'backHome') => {
		const { activeProfile } = this.props;
		const item = this.props.item as api.ItemDetail;

		switch (act) {
			case 'detail':
				const detailPath = (item.season && item.season.show && item.season.show.path) || item.path;
				this.context.focusNav.goBackFromWatch(detailPath);
				break;

			case 'rate':
				if (this.state.isEndMode) {
					this.setState({ enableCountDown: false });
				}

				if (activeProfile) {
					if (!this.targetItem) return;
					const userRating = getUserRating(this.targetItem.id);
					const rating = (userRating && userRating.value) || undefined;

					this.context.focusNav.showDialog(
						<RateModal
							title={this.targetItem.title}
							defaultValue={rating / 2}
							ref={ref => ref && this.context.focusNav.setFocus(ref.focusableRow)}
							onClose={v => {
								if (v !== -1) {
									this.props.rateItem(this.targetItem, v * 2, 2);
								}
							}}
						/>
					);
				} else {
					this.context.focusNav.nextAction = 'rate';
					// Prompt sign in by active code
					this.props.promptSignIn();
				}
				break;

			case 'replay':
				this.player.replay();
				this.trackPlaybackEvents('action', VideoPlayerActions.Restart);
				this.setState({
					curPos: 0,
					playState: PlayState.LOADING,
					focusState: FocusState.controls,
					isEndMode: false,
					isFullscreen: true,
					playComplete: false
				});
				break;

			case 'backHome':
				this.context.router.push('/');
				break;

			default:
				break;
		}
	};

	private resetInteractingTimer = () => {
		clearTimeout(this.interactingTimer);

		if (!this.player) {
			return;
		}

		const playState = this.state.playState;
		const isInteracting = playState !== PlayState.PLAYING && playState !== PlayState.LOADING;

		if (!isInteracting) {
			this.interactingTimer = setTimeout(() => {
				this.setState({ isInteracting: false });
			}, hideControlsTime);
		}
	};

	private stopInteractingTimer = () => {
		clearTimeout(this.interactingTimer);
	};

	private onPlaybackEvents = (oldState: PlayState, newState: PlayState) => {
		const { isEndMode, src, resumePosition, isFullscreen } = this.state;
		const pausedFlag = this.video.getPausedFlag();
		const eventData = { isUserEnacted: false, item: this.recentPlayItem, path: src && src.url };

		if (oldState === PlayState.UNKNOWN && newState === PlayState.READY && !isEndMode) {
			// First loading
			this.trackVideoProgressEvent(resumePosition);
		} else if (oldState !== PlayState.PLAYING && newState === PlayState.PLAYING) {
			if (oldState === PlayState.FF || oldState === PlayState.REWIND) {
				setImmediate(() => {
					this.trackPlaybackEvents('action', VideoPlayerActions.SeekEnd);
				});
			} else {
				this.trackPlaybackEvents('state', VideoPlayerStates.PLAYING, eventData);
			}
		} else if (oldState === PlayState.PLAYING && newState === PlayState.PAUSED && pausedFlag) {
			this.trackPlaybackEvents('action', VideoPlayerActions.ActuatePause);
			this.trackPlaybackEvents('state', VideoPlayerStates.PAUSED, eventData);
		} else if (newState === PlayState.LOADING || newState === PlayState.BUFFERING) {
			const currentTime = this.video.getPosition();
			this.trackVideoProgressEvent(currentTime);
			this.trackPlaybackEvents('state', VideoPlayerStates.BUFFERING, eventData);
		} else if (oldState === PlayState.PLAYING && newState === PlayState.ENDED && isFullscreen) {
			this.trackPlaybackEvents('state', VideoPlayerStates.COMPLETED, eventData);
		}
	};

	private onPlayerStateChanged = (oldState: PlayState, newState: PlayState) => {
		if (!this.video && this.player) {
			this.video = this.player.video;
		}

		if (!this.video) return;

		this.onPlaybackEvents(oldState, newState);

		const isInteracting = newState !== PlayState.PLAYING && newState !== PlayState.LOADING;
		let { isFullscreen, isEndMode, playComplete, enableCountDown, focusState } = this.state;
		let playrate = 1;

		if (oldState === PlayState.UNKNOWN && newState === PlayState.READY && !isEndMode) {
			// First loading
			let selectedText = this.video.getTextTrack();
			const selectedAudio = this.video.getAudioTrack();
			const audioTracks = this.video.getAvailableAudioTracks();
			const textTracks = this.video.getAvailableTextTracks();
			const duration = this.video.getDuration();

			if (!selectedText && audioTracks && audioTracks.length > 0) {
				selectedText = audioTracks[0];
			}

			this.setState({
				duration,
				video: this.video,
				audioTracks,
				textTracks,
				selectedText: selectedText ? selectedText.language : '',
				selectedAudio: selectedAudio ? selectedAudio.language : ''
			});
		} else if (newState === PlayState.FF || newState === PlayState.REWIND) {
			playrate = this.video.getPlaybackRate();
			this.setState({ playrate });
		} else if (newState === PlayState.ENDED) {
			if (isFullscreen) enableCountDown = true;
			isFullscreen = false;
			isEndMode = true;
			playComplete = true;
			focusState = focusState !== FocusState.actions ? FocusState.end : focusState;
			this.setState({ isFullscreen, isEndMode, playComplete, enableCountDown, focusState }, () => {
				if (this.recentPlayItem.type === 'trailer') {
					this.context.focusNav.goBack();
				}
			});
		}

		if (isInteracting) {
			this.stopInteractingTimer();
		} else {
			this.resetInteractingTimer();
		}

		this.setState({
			playState: newState,
			playrate,
			isInteracting,
			loading: newState === PlayState.LOADING || newState === PlayState.BUFFERING
		});
	};

	private onPlayerPropertiesChanged = (playerProperties: PlayerProperties) => {
		const { currentTime, duration } = playerProperties;
		const { curPos, playState } = this.state;

		if (currentTime !== curPos && playState === PlayState.PLAYING) {
			this.trackVideoProgressEvent(currentTime);
		}

		this.setState({
			curPos: currentTime,
			duration: duration,
			playComplete: currentTime >= duration
		});
	};

	private onClickSubItem = (str: string) => {
		const { isShowCC } = this.state;

		if (isShowCC) {
			this.setState({
				selectedText: str
			});

			this.video.setTextTrack(str);
		} else {
			this.setState({
				selectedAudio: str
			});

			this.video.setAudioTrack(str);
		}

		this.setState({
			focusState: FocusState.controls,
			isShowCC: false,
			isShowSound: false
		});

		this.resetInteractingTimer();
	};

	private showCC = () => {
		const textTracks = this.state.textTracks;

		if (textTracks.length > 1) {
			let subItems = ['Off'];
			textTracks.map(t => subItems.push(t.language));

			this.setState({
				subItems,
				focusState: FocusState.sub,
				isShowCC: true,
				isInteracting: true
			});

			this.stopInteractingTimer();
		}
	};

	private showSound = () => {
		const audioTracks = this.state.audioTracks;

		if (audioTracks.length > 1) {
			this.setState({
				subItems: audioTracks.map(t => t.language),
				focusState: FocusState.sub,
				isShowSound: true,
				isInteracting: true
			});

			this.stopInteractingTimer();
		}
	};

	private getCC = () => {
		let customFields = this.props.item.customFields || {};
		let ccKey: string;
		let lanKey: string;
		let cc: { key: string; src: string }[] = [];

		for (let key in customFields) {
			if (customFields.hasOwnProperty(key)) {
				ccKey = key.toLocaleLowerCase();
				lanKey = ccKey.startsWith('cc') ? ccKey.substr(2) : '';
				cc.push({ key: lanKey, src: customFields[key] });
			}
		}

		return cc;
	};

	private onPageChange = () => {
		this.setState({ disposing: true });
	};

	private onLoadingTimeout = () => {
		this.trackPlaybackEvents('state', VideoPlayerStates.ERROR, {
			item: this.recentPlayItem,
			error: new VideoError('The request timeout', VideoErrorCode.TimeoutError)
		});
		this.setState({ src: undefined });
		this.context.focusNav.showDialog(
			<CommonMsgModal
				captureFocus={true}
				blackBackground={true}
				transparent={true}
				title={'@{video_error_title|Error}'}
				text={
					'@{service_unavailable_msg|Sorry, we are unable to contact the service right now. Please try again later.}'
				}
				buttons={['@{ok|OK}']}
				onClose={() => {
					this.context.focusNav.goBack();
				}}
			/>
		);
	};

	private onError = (message?: string) => {
		this.context.focusNav.showDialog(
			<CommonMsgModal
				captureFocus={true}
				blackBackground={true}
				transparent={true}
				title={'@{video_error_title|Error}'}
				text={message || '@{service_error|Unfortunately, an error has occurred. Please try again later.}'}
				buttons={['@{ok|OK}']}
				onClose={() => {
					this.context.focusNav.goBack();
				}}
			/>
		);
	};
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { app, account, player, session } = state;
	const sub = account.info ? account.info.subscriptionCode : '';
	const players = player.players;
	const prompts = session.authPrompts;

	return {
		device: app.contentFilters.device,
		account,
		player: players && players[ownProps.id],
		subscriptionCode: sub,
		prompt: prompts[prompts.length - 1]
	};
}

function mapDispatchToProps(dispatch: any) {
	return {
		rateItem: (item: api.ItemSummary, rating: number, ratingScale = 1) => dispatch(rateItem(item, rating, ratingScale)),
		saveResumePosition: (item: api.ItemSummary, position: number) => dispatch(saveResumePosition(item, position)),
		startedPlaying: (item: api.ItemDetail) => dispatch(startedPlaying(item)),
		openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) =>
			dispatch(openPlayer(item, playerId, subscriptionCode)),
		closePlayer: (playerId: string) => dispatch(closePlayer(playerId)),
		promptSignIn: () => dispatch(promptSignIn())
	};
}

const PlayerStandard = connect<any, PlayerStandardProps, PageEntryItemProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerStandardClass);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(PlayerStandard as any).template = template;
export default PlayerStandard;

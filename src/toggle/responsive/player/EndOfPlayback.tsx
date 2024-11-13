import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PlayerMetadata from 'ref/responsive/player/PlayerMetadata';
import PlayerBackgroundImage from 'ref/responsive/player/PlayerBackgroundImage';
import SuggestedContent from 'ref/responsive/player/SuggestedContent';
import PlayNextEpisode from 'ref/responsive/player/PlayNextEpisode';
import { noop } from 'shared/util/function';
import { HideAllModals } from 'shared/uiLayer/uiLayerWorkflow';
import BackIcon from 'ref/responsive/player/controls/icons/BackIcon';
import EndCredits from './EndCredits';
import { getNextItem } from 'shared/app/playerWorkflow';
import { isPortrait } from 'ref/responsive/util/grid';
import { get } from 'shared/util/objects';
import { isMobile } from 'shared/util/browser';
import { ITimer, Timer } from 'shared/util/Timer';
import { isSeriesEpisode } from 'toggle/responsive/util/item';
import { isShortVideo } from 'toggle/responsive/util/playerUtil';

import './EndOfPlayback.scss';

interface EndOfPlaybackOwnProps {
	item: api.ItemDetail;
	embed?: boolean;
	playerId: string;
	activeAccount: boolean;
	onReplay: () => void;
	onBack: () => void;
	onPlayNext: PlayNextHandler;
	onOverlayOpen?: (opened: boolean) => void;
	shouldHideBackgroundImage?: boolean;
	shouldRenderEndingCredits?: boolean;
	onWatchEndingCredits?: () => void;
	skipToEndOfPlayback?: () => void;
}

interface EndOfPlaybackStateProps {
	chainPlayCountdown?: number;
	watchCreditsCtaCountdown?: number;
	nextItem?: api.ItemDetail;
	xt1ChainPlayList?: number | string;
	nextItemError?: boolean;
}

interface EndOfPlaybackDispatchProps {
	hideAllModals?: () => void;
}

interface EndOfPlaybackState {
	chainPlayAvailable: boolean;
	chainPlayPaused: boolean;
}

type EndOfPlaybackProps = EndOfPlaybackOwnProps & EndOfPlaybackStateProps & EndOfPlaybackDispatchProps;

const bem = new Bem('end-of-playback');

class EndOfPlayback extends React.Component<EndOfPlaybackProps, EndOfPlaybackState> {
	private endCreditsTimer: ITimer;

	state: EndOfPlaybackState = {
		chainPlayAvailable: this.isChainPlayAvailable(),
		chainPlayPaused: false
	};

	static defaultProps = {
		onOverlayOpen: noop
	};

	componentDidMount() {
		this.props.hideAllModals();
	}

	componentDidUpdate(prevProps: EndOfPlaybackProps, prevState: EndOfPlaybackState) {
		if (this.shouldStartTimer(prevState)) {
			this.createTimer();
		}
		const { chainPlayAvailable } = this.state;
		if (!!this.props.xt1ChainPlayList && (prevState.chainPlayAvailable && !chainPlayAvailable)) {
			this.props.onBack();
		}
	}

	componentWillUnmount(): void {
		if (this.endCreditsTimer) {
			this.endCreditsTimer.stop();
		}
	}

	private createTimer() {
		this.endCreditsTimer = new Timer(this.stopTimer, this.props.watchCreditsCtaCountdown * 1000);
		if (this.endCreditsTimer) {
			this.endCreditsTimer.start();
		}
	}

	private shouldStartTimer(prevState: EndOfPlaybackState) {
		return (
			this.props.shouldRenderEndingCredits &&
			prevState.chainPlayAvailable !== this.state.chainPlayAvailable &&
			!this.canChainPlay()
		);
	}

	private isChainPlayAvailable(): boolean {
		return this.isEpisode() || !!this.props.xt1ChainPlayList;
	}

	private canChainPlay() {
		return this.state.chainPlayAvailable && !this.props.embed;
	}

	private isEpisode() {
		return this.props.item.type === 'episode';
	}

	private onChainPlayFailed = () => {
		this.setState({ chainPlayAvailable: false });
	};

	renderEndCredits() {
		const { onBack, shouldHideBackgroundImage, onWatchEndingCredits, nextItem } = this.props;
		const canChainPlay = this.canChainPlay();
		const shouldHideNextEpisodeBtn = !canChainPlay || !nextItem;

		return (
			<div
				className={bem.b({ 'hide-background-image': !canChainPlay && shouldHideBackgroundImage }, 'end-credits', {
					'chain-play': canChainPlay
				})}
			>
				<span className={bem.e('back')} onClick={onBack}>
					<BackIcon className={bem.e('back-icon')} />
				</span>
				<div className={bem.e('metadata')}>{this.renderMetadata()}</div>
				<div className={bem.e('suggested-content')}>
					<EndCredits
						shouldHideNextEpisodeBtn={shouldHideNextEpisodeBtn}
						onClickWatchCredits={onWatchEndingCredits}
						onClickNextEpisode={this.onPlayNextEpisode}
					/>
					{canChainPlay && this.renderPlayNextEpisode()}
					{!canChainPlay && this.renderSuggestedContent()}
				</div>
			</div>
		);
	}

	renderEndOfPlayback() {
		const { onBack, shouldHideBackgroundImage, embed, item } = this.props;
		const canChainPlay = this.canChainPlay();

		if (isShortVideo(item) && canChainPlay) {
			return <div>{canChainPlay && this.renderPlayNextEpisode()}</div>;
		}
		return (
			<div
				className={bem.b({
					'hide-background-image': !canChainPlay && shouldHideBackgroundImage
				})}
			>
				{this.renderBackgroundImage()}
				{!embed && (
					<span className={bem.e('back')} onClick={onBack}>
						<BackIcon className={bem.e('back-icon')} />
					</span>
				)}

				<div className={bem.e('metadata')}>
					{this.renderMetadata()}
					<div className={bem.e('actions')}>{this.renderReplay()}</div>
				</div>

				{!embed && (
					<div className={bem.e('suggested-content')}>
						{canChainPlay && this.renderPlayNextEpisode()}
						{!canChainPlay && this.renderSuggestedContent()}
					</div>
				)}
			</div>
		);
	}

	private stopTimer = () => {
		const { skipToEndOfPlayback } = this.props;
		if (this.endCreditsTimer) {
			skipToEndOfPlayback();
			this.endCreditsTimer.stop();
		}
	};

	render() {
		const { item, shouldRenderEndingCredits } = this.props;
		if (!item) return false;

		if (shouldRenderEndingCredits) {
			return this.renderEndCredits();
		} else {
			return this.renderEndOfPlayback();
		}
	}

	private renderBackgroundImage() {
		return <PlayerBackgroundImage item={this.props.item} />;
	}

	private onPlayNextEpisode = () => {
		const { nextItem, onPlayNext } = this.props;
		onPlayNext(nextItem, true, 0);
	};

	private shouldHideMetadata() {
		return this.props.shouldRenderEndingCredits && isMobile() && isPortrait();
	}

	private renderMetadata() {
		const { item, onBack } = this.props;

		if (this.shouldHideMetadata()) return false;
		if (!item) return false;

		const title = (item.season && item.season.show && item.season.show.title) || item.title;
		return (
			<PlayerMetadata title={title} secondaryTitle={item.secondaryLanguageTitle} onBack={onBack}>
				{this.renderEpisodeMetadata()}
			</PlayerMetadata>
		);
	}

	private renderEpisodeMetadata() {
		const { item } = this.props;
		if (!this.isEpisode()) return false;

		// use episodeName property for episode title in metadata
		const { season, seasonNumber, episodeNumber, episodeName } = item;

		return isSeriesEpisode(item) ? (
			<IntlFormatter
				elementType="p"
				values={{
					seasonNumber: (season && season.seasonNumber) || seasonNumber,
					episodeNumber: episodeNumber,
					episodeName: episodeName
				}}
			>
				{`@{endOfPlayback_metadata_title}`}
			</IntlFormatter>
		) : (
			<p>{episodeName}</p>
		);
	}

	private renderReplay() {
		return (
			<IntlFormatter
				elementType={CtaButton}
				className={cx(bem.e('replay-btn'), 'player-btn')}
				onClick={this.props.onReplay}
			>
				{`@{endOfPlayback_cta_replay|Replay}`}
			</IntlFormatter>
		);
	}

	private renderPlayNextEpisode() {
		const {
			item,
			chainPlayCountdown,
			onPlayNext,
			playerId,
			activeAccount,
			shouldRenderEndingCredits,
			watchCreditsCtaCountdown,
			xt1ChainPlayList
		} = this.props;
		const { chainPlayPaused } = this.state;
		const countdown = shouldRenderEndingCredits ? watchCreditsCtaCountdown : chainPlayCountdown;
		const isShortClip = isShortVideo(item);

		return (
			<PlayNextEpisode
				itemId={item.id}
				isShortVideo={isShortClip}
				chainPlayCountdown={countdown}
				playerId={playerId}
				onPlayNext={onPlayNext}
				onFailed={this.onChainPlayFailed}
				isPaused={chainPlayPaused}
				isCountdownHidden={countdown === 0}
				activeAccount={activeAccount}
				shouldRenderEndingCredits={shouldRenderEndingCredits}
				onSkipEndingCredits={this.onPlayNextEpisode}
				xt1ChainPlayList={xt1ChainPlayList}
			/>
		);
	}

	private renderSuggestedContent() {
		const { item, playerId } = this.props;
		return <SuggestedContent item={item} playerId={playerId} />;
	}
}

function mapStateToProps(state: state.Root, ownProps): EndOfPlaybackStateProps {
	const { app, player } = state;
	const { playerId } = ownProps;
	const players = player.players;
	const currentPlayer = players && players[playerId] && players[playerId];
	const xt1ChainPlayList = player.xt1ChainPlayList;
	const configCountdown = get(app, 'config.playback.chainPlayCountdown') || 0;

	return {
		chainPlayCountdown: xt1ChainPlayList ? 0 : configCountdown,
		watchCreditsCtaCountdown: get(app, 'config.playback.watchCreditsCtaCountdown') || 0,
		nextItem: get(currentPlayer, 'nextItem'),
		xt1ChainPlayList: player.xt1ChainPlayList,
		nextItemError: get(currentPlayer, 'nextItemError')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		hideAllModals: () => dispatch(HideAllModals()),
		getNextItem: (itemId: string, playerId: string, sub: string, segments?: string[]) => {
			return dispatch(getNextItem(itemId, playerId, sub));
		}
	};
}
export default connect<EndOfPlaybackStateProps, any, EndOfPlaybackProps>(
	mapStateToProps,
	mapDispatchToProps
)(EndOfPlayback);

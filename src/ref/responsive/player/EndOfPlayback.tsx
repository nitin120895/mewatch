import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PlayerMetadata from './PlayerMetadata';
import PlayerBackgroundImage from './PlayerBackgroundImage';
import SuggestedContent from './SuggestedContent';
import RatingWrapper from 'ref/responsive/component/rating/RatingWrapper';
import PlayNextEpisode from './PlayNextEpisode';
import { noop } from 'shared/util/function';

import './EndOfPlayback.scss';

interface EndOfPlaybackProps {
	item: api.ItemDetail;
	playerId: string;
	activeAccount: boolean;
	onReplay: () => void;
	onBack: () => void;
	onPlayNext: PlayNextHandler;
	onOverlayOpen?: (opened: boolean) => void;
}

interface EndOfPlaybackStateProps {
	chainPlayCountdown?: number;
}

interface EndOfPlaybackState {
	chainPlayAvailable: boolean;
	chainPlayPaused: boolean;
}

const bem = new Bem('end-of-playback');

class EndOfPlayback extends React.Component<EndOfPlaybackProps & EndOfPlaybackStateProps, EndOfPlaybackState> {
	state: EndOfPlaybackState = {
		chainPlayAvailable: this.isEpisode(),
		chainPlayPaused: false
	};

	static defaultProps = {
		onOverlayOpen: noop
	};

	private canChainPlay() {
		return this.state.chainPlayAvailable;
	}

	private isEpisode() {
		return this.props.item.type === 'episode';
	}

	private onChainPlayFailed = () => {
		this.setState({ chainPlayAvailable: false });
	};

	private onStateChanged = (opened: boolean) => {
		this.setState({ chainPlayPaused: opened });
		this.props.onOverlayOpen(opened);
	};

	render() {
		if (!this.props.item) return false;
		const canChainPlay = this.canChainPlay();

		return (
			<div className={bem.b()}>
				{this.renderBackgroundImage()}
				<div className={bem.e('metadata')}>
					{this.renderMetadata()}
					<div className={bem.e('actions')}>
						{this.renderReplay()}
						{this.renderRatingButton()}
					</div>
				</div>
				<div className={bem.e('suggested-content')}>
					{canChainPlay && this.renderPlayNextEpisode()}
					{!canChainPlay && this.renderSuggestedContent()}
				</div>
			</div>
		);
	}

	private renderBackgroundImage() {
		return <PlayerBackgroundImage item={this.props.item} />;
	}

	private renderMetadata() {
		const { item, onBack } = this.props;
		if (!item) return false;
		const title = (item.season && item.season.show && item.season.show.title) || item.title;
		return (
			<PlayerMetadata title={title} onBack={onBack}>
				{this.renderEpisodeMetadata()}
			</PlayerMetadata>
		);
	}

	private renderEpisodeMetadata() {
		const { item } = this.props;
		if (!this.isEpisode()) return false;

		// use episodeName property for episode title in metadata
		const { season, seasonNumber, episodeNumber, episodeName } = item;

		return (
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

	private renderRatingButton() {
		const { item } = this.props;
		const rateItem = this.isEpisode() ? item.season && item.season.show : item;
		const redirectPath = this.isEpisode() ? item.season && item.season.show && item.season.show.path : item.path;
		return (
			<RatingWrapper
				item={rateItem}
				component={'rate_or_rating'}
				onStateChanged={this.onStateChanged}
				redirectPath={redirectPath}
			/>
		);
	}

	private renderPlayNextEpisode() {
		const { item, chainPlayCountdown, onPlayNext, playerId } = this.props;
		const { chainPlayPaused } = this.state;
		return (
			<PlayNextEpisode
				itemId={item.id}
				chainPlayCountdown={chainPlayCountdown}
				playerId={playerId}
				onPlayNext={onPlayNext}
				onFailed={this.onChainPlayFailed}
				isPaused={chainPlayPaused}
				isCountdownHidden={chainPlayCountdown === 0}
			/>
		);
	}

	private renderSuggestedContent() {
		const { item, playerId } = this.props;
		return <SuggestedContent item={item} playerId={playerId} />;
	}
}

function mapStateToProps(state: state.Root, ownProps): EndOfPlaybackStateProps {
	const { chainPlayCountdown } = state.app.config.playback;
	return {
		chainPlayCountdown: chainPlayCountdown || 0
	};
}

export default connect<EndOfPlaybackStateProps, any, EndOfPlaybackProps>(
	mapStateToProps,
	undefined
)(EndOfPlayback);

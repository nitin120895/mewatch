import * as React from 'react';
import { connect } from 'react-redux';
import Image from 'shared/component/Image';
import TimerCircle from './controls/TimerCircle';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getNextItem } from 'shared/app/playerWorkflow';
import { canPlay } from '../pageEntry/util/offer';
import { get } from 'shared/util/objects';
import { wasActiveWithin } from 'shared/app/userActivityMonitor';

import './PlayNextEpisode.scss';

const bem = new Bem('play-next-episode');

interface PlayNextEpisodeProps {
	itemId: string;
	chainPlayCountdown: number;
	chainPlayTimeout: number;
	playerId: string;
	onFailed: () => void;
	onPlayNext: PlayNextHandler;
	sub?: string;
	nextItem: api.ItemDetail;
	error: boolean;
	getNextItem: (itemId: string, site: string, sub: string) => Promise<any>;
	isPaused?: boolean;
	isCountdownHidden?: boolean;
}

export class PlayNextEpisode extends React.Component<PlayNextEpisodeProps> {
	private chainPlayCountdownRemainingTime = Infinity;

	componentDidMount() {
		const { error, itemId } = this.props;
		if (error) return this.props.onFailed();

		if (!this.hasNext()) this.loadNextItem(itemId);
	}

	componentWillReceiveProps(nextProps: PlayNextEpisodeProps) {
		if (nextProps.error !== this.props.error && nextProps.error) {
			this.props.onFailed();
		}

		if (nextProps.itemId !== this.props.itemId) {
			this.setState({ next: undefined }, () => this.loadNextItem(nextProps.itemId));
		}
	}

	private loadNextItem(itemId: string) {
		const { getNextItem, playerId, sub } = this.props;
		getNextItem(itemId, playerId, sub);
	}

	private hasNext() {
		return !!this.props.nextItem;
	}

	private canPlayItem() {
		const { nextItem } = this.props;
		return !!nextItem && canPlay(nextItem);
	}

	private isCountdownAllowed() {
		const { chainPlayTimeout, isCountdownHidden } = this.props;
		return this.canPlayItem() && !isCountdownHidden && wasActiveWithin(chainPlayTimeout * 60 * 1000);
	}

	private onCountdownTick = time => {
		this.chainPlayCountdownRemainingTime = time;
	};

	private onPlayNext = () => {
		const { onPlayNext, nextItem } = this.props;
		if (this.hasNext()) {
			onPlayNext(nextItem, this.canPlayItem(), this.chainPlayCountdownRemainingTime);
		}
	};

	render() {
		if (!this.hasNext()) return false;

		const { chainPlayCountdown, nextItem, isPaused } = this.props;
		const { episodeName, images, episodeNumber, seasonNumber } = nextItem;

		return (
			<div className={bem.b()}>
				<div className={bem.e('thumbnail')} onClick={this.onPlayNext}>
					<Image src={images.tile} className={bem.e('thumbnail-img')} />
				</div>
				<div className={bem.e('meta')}>
					<IntlFormatter elementType="h1">{'@{next_episode|Next episode}'}</IntlFormatter>
					<div className={bem.e('meta-title')}>
						<IntlFormatter
							elementType="h2"
							values={{
								seasonNumber: get(nextItem, 'season.seasonNumber') || seasonNumber,
								episodeNumber: episodeNumber
							}}
						>
							{`@{next_episode_episode_metadata}`}
						</IntlFormatter>
						<IntlFormatter elementType="h2">{episodeName}</IntlFormatter>
					</div>
					{this.isCountdownAllowed() && (
						<div className={bem.e('countdown')}>
							<div className={bem.e('countdown-block')}>
								<IntlFormatter elementType="p" className={bem.e('countdown-text')}>
									{'@{next_episode_starting|Starting in}'}
								</IntlFormatter>
								<TimerCircle
									startFrom={chainPlayCountdown}
									onFinish={this.onPlayNext}
									onTick={this.onCountdownTick}
									isPaused={isPaused}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { player, account, app } = state;
	const players = player.players;
	const subscriptionCode = (account && account.info && account.info.subscriptionCode) || '';
	const { playerId } = ownProps;
	const { chainPlayTimeout } = app.config.playback;
	return {
		sub: subscriptionCode,
		nextItem: players && players[playerId] && players[playerId].nextItem,
		error: players && players[playerId] && players[playerId].nextItemError,
		chainPlayTimeout: chainPlayTimeout || 0
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getNextItem: (itemId: string, playerId: string, sub: string) => {
			return dispatch(getNextItem(itemId, playerId, sub));
		}
	};
}

export default connect<PlayNextEpisodeProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(PlayNextEpisode);

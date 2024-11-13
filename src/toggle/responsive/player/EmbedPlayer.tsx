import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import warning from 'shared/util/warning';
import { isChannel } from 'toggle/responsive/util/epg';
import { getQueryParams } from 'shared/util/urls';
import PlayerStandard from 'toggle/responsive/player/PlayerStandard';
import { PlayerError } from './Player';

import './EmbedPlayer.scss';

const bem = new Bem('embed-player');

interface OwnProps {
	item: api.ItemDetail;
	onError?: (error: PlayerError) => void;
}

type EmbedPlayerProps = OwnProps & PageProps & EmbedPlayerState;

interface EmbedPlayerState {
	autoplay: boolean;
}

export default class EmbedPlayer extends React.Component<EmbedPlayerProps, EmbedPlayerState> {
	state = { autoplay: false };

	componentDidMount() {
		const queryString = getQueryParams(window.location.search);
		if (queryString && queryString.autoplay) {
			this.setState({ autoplay: queryString.autoplay === 1 });
		}
	}

	onError = error => {
		warning(error);
	};

	render() {
		const { autoplay } = this.state;
		const { item } = this.props;
		const linear = isChannel(item);
		return (
			<div className="pg-watch">
				<section className={cx(bem.b(), { linear: linear })}>
					<PlayerStandard
						{...this.props}
						id="embedPlayer"
						linear={linear}
						embed={true}
						autoplay={autoplay}
						onError={this.onError}
					/>
				</section>
			</div>
		);
	}
}

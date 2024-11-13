import * as React from 'react';
import { PlayerInterface } from 'ref/responsive/player/Player';
import { getCastPlayer } from 'ref/responsive/player/cast/getCastPlayer';

type WithCastPlayerProps = {
	render: (player: PlayerInterface) => React.ReactElement<any>;
};

export default class WithCastPlayer extends React.Component<WithCastPlayerProps> {
	render() {
		return this.props.render(getCastPlayer());
	}
}

import * as React from 'react';
import { isOpera, isEdge, isChrome, isMobile } from 'shared/util/browser';
import { PlayerInterface } from 'ref/responsive/player/Player';

export const CAST_PLAYER_ID = 'cast_player';

export const CastPlayerLoader = () => <CastLoader getComponent={() => CastPlayer} />;
export const CastButtonLoader = (props: ControlsCastProps) => (
	<CastLoader {...props} getComponent={() => ControlsCast} />
);
export const WithCastPlayerLoader = (props: WithCastPlayerProps) => (
	<CastLoader {...props} getComponent={() => WithCastPlayer} />
);

// we need to add explicit condition that browser is not Edge or Opera because theirs userAgents contains Chrome keyword
export function isCastSupported() {
	return isChrome() && !isMobile() && !isEdge() && !isOpera();
}

type CastLoaderProps = Partial<WithCastPlayerProps> &
	Partial<ControlsCastProps> & {
		getComponent: () => React.ComponentClass;
	};
type CastLoaderState = {
	Component?: React.ComponentClass<any>;
};

type ControlsCastProps = {
	className?: string;
};
type WithCastPlayerProps = {
	render: (player: PlayerInterface) => React.ReactElement<any>;
};

let CastPlayer: React.ComponentClass<{}>;
let ControlsCast: React.ComponentClass<ControlsCastProps>;
let WithCastPlayer: React.ComponentClass<WithCastPlayerProps>;

class CastLoader extends React.Component<CastLoaderProps, CastLoaderState> {
	constructor(props: CastLoaderProps) {
		super(props);
		this.state = {
			Component: props.getComponent()
		};
	}

	componentDidMount() {
		if (isCastSupported() && !this.state.Component) {
			const { getComponent } = this.props;
			import('./Cast' /* webpackChunkName: "cast" */).then(m => {
				CastPlayer = m.CastPlayer;
				ControlsCast = m.ControlsCast;
				WithCastPlayer = m.WithCastPlayer;
				this.setState({ Component: getComponent() });
			});
		}
	}

	render() {
		const { Component } = this.state;
		if (Component) {
			// tslint:disable:no-unused-variable
			const { getComponent, ...componentProps } = this.props;
			// tslint:enable
			return <Component {...componentProps} />;
		} else {
			return <div />;
		}
	}
}

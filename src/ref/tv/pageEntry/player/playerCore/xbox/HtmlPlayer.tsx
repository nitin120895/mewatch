import * as React from 'react';
import { PlayerCore, PlayerCoreProps } from '../PlayerCore';
import ShakaPlayerAPI from '../ShakaPlayerAPI';

export default class SubPlayer extends PlayerCore<PlayerCoreProps> {
	constructor(props) {
		super(props);
	}

	createVideoComponent() {
		return new ShakaPlayerAPI(this.props.device);
	}

	componentDidMount() {
		super.componentDidMount();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {
		const { videoItem } = this.props;
		return <div className="Video">{videoItem && <video id="video0" />}</div>;
	}
}

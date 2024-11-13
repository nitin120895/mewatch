import * as React from 'react';
import { PlayerCore, PlayerCoreProps } from '../PlayerCore';
import ShakaPlayerAPI from '../ShakaPlayerAPI';
import TizenKeysModel from 'shared/util/platforms/tizen/tizenKeysModel';
import { PlayState } from '../PlayerAPI';

export default class SubPlayer extends PlayerCore<PlayerCoreProps> {
	constructor(props) {
		super(props);
	}

	createVideoComponent() {
		return new ShakaPlayerAPI(this.props.device);
	}

	componentDidMount() {
		if (document && document.body) {
			document.body.addEventListener('keydown', this.onKeyDown, false);
		}
		super.componentDidMount();
	}

	componentWillUnmount() {
		if (document && document.body) {
			document.body.removeEventListener('keydown', this.onKeyDown, false);
		}
		super.componentWillUnmount();
	}

	render() {
		const { videoItem } = this.props;
		return <div className="Video">{videoItem && <video id="video0" />}</div>;
	}

	private onKeyDown = e => {
		const { isFullscreen, isLoading, onVideoStop } = this.props;
		if (!this.video || !isFullscreen || isLoading) return;

		switch (e.keyCode) {
			case TizenKeysModel.Play:
				this.video.play();
				break;

			case TizenKeysModel.Pause:
				this.video.pause();
				break;

			case TizenKeysModel.PlayPause:
				if (this.video.playState !== PlayState.PAUSED) this.video.pause();
				else this.video.play();
				break;

			case TizenKeysModel.Stop:
				onVideoStop();
				break;

			case TizenKeysModel.Rewind:
				this.video.rewind();
				break;

			case TizenKeysModel.FastForward:
				this.video.fastforward();
				break;
		}
	};
}

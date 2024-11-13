import * as React from 'react';
import { PlayerCore, PlayerCoreProps } from '../PlayerCore';
import ShakaPlayerAPI from '../ShakaPlayerAPI';
import WebKeysModel from 'shared/util/platforms/tv/tvKeysModel';
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
			case WebKeysModel.Play:
				this.video.play();
				break;

			case WebKeysModel.Pause:
				this.video.pause();
				break;

			case WebKeysModel.PlayPause:
				if (this.video.playState !== PlayState.PAUSED) this.video.pause();
				else this.video.play();
				break;

			case WebKeysModel.Stop:
				onVideoStop();
				break;

			case WebKeysModel.Rewind:
				this.video.rewind();
				break;

			case WebKeysModel.FastForward:
				this.video.fastforward();
				break;
		}
	};
}

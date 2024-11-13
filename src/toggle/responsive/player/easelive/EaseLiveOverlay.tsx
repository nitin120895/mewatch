import * as React from 'react';
import EaseLive from '@ease-live/ease-live-bridge-web';
import { isTouch } from 'shared/util/browser';
import { Bem } from 'shared/util/styles';
import { KalturaPlayerWrapper } from 'toggle/responsive/player/KalturaPlayerWrapper';

import './EaseLiveOverlay.scss';

const bem = new Bem('ease-live-overlay');

interface EaseLiveOverlayProps {
	player: KalturaPlayerWrapper;
	programId: string;
	showUI: boolean;
	setControlsVisibility: (visible: boolean) => void;
}

interface EaseLiveOverlayState {
	ready: boolean;
}

export default class EaseLiveOverlay extends React.Component<EaseLiveOverlayProps, EaseLiveOverlayState> {
	private overlayId = 'easeLiveContainer';
	private easeLive: any;

	constructor(props) {
		super(props);
		this.state = { ready: false };
	}

	componentDidMount() {
		this.initEaseLive();
	}

	componentDidUpdate(prevProps: Readonly<EaseLiveOverlayProps>): void {
		const { showUI } = this.props;
		if (prevProps.showUI !== showUI) {
			if (this.easeLive) {
				// Add sender trigger point so we know when to skip setting the controls display again
				this.easeLive.emit('stage.clicked', {
					controls: showUI ? 'visible' : 'hidden',
					sender: 'player'
				});
			}
		}
	}

	componentWillUnmount(): void {
		this.easeLive.destroy();
	}

	render() {
		const { ready } = this.state;
		return <div id={this.overlayId} className={bem.b({ hidden: !ready })} />;
	}

	private initEaseLive() {
		const { player, programId, setControlsVisibility } = this.props;
		const accountId = process.env.CLIENT_PLAYANYWHERE_ACCOUNT_ID;
		const projectId = process.env.CLIENT_PLAYANYWHERE_PROJECT_ID;

		if (accountId && projectId && programId) {
			this.easeLive = new EaseLive({
				accountId,
				projectId,
				programId,
				env: 'prod',
				viewContainer: `#${this.overlayId}`,
				playerPlugin: (easeLive, config) => {
					easeLive.on('bridge.ready', () => this.setState({ ready: true }));

					easeLive.on('bridge.error', err => console.log('bridge.error', err));

					easeLive.on('view.error', err => console.log('view.error', err));

					easeLive.on('app.error', err => console.log('app.error', err));

					// Set controls visibility from easelive
					easeLive.on('stage.clicked', data => {
						// Skip if player has already set controls display
						if (data.sender === 'player') {
							return;
						}
						const visible = data.controls === 'visible';
						setControlsVisibility(visible);
					});

					const useMouseEvents = !isTouch();
					if (useMouseEvents) {
						easeLive.on('view.mousemove', () => {
							setControlsVisibility(true);
						});
					}

					player.addEventListener(player.Event.PLAYBACK_START, () => {
						easeLive.emit('player.ready', {});
					});

					// Notify EaseLive when player state changes
					function onPlayerState(state) {
						easeLive.emit('player.state', {
							state: state
						});
					}

					player.addEventListener(player.Event.PLAY, () => {
						onPlayerState('playing');
					});

					player.addEventListener(player.Event.PAUSE, () => {
						onPlayerState('paused');
					});

					player.addEventListener(player.Event.STALLED, event => {
						onPlayerState('buffering');
					});

					player.addEventListener(player.Event.SEEKING, event => {
						onPlayerState('seeking');
					});

					player.addEventListener(player.Event.SEEKED, event => {
						onPlayerState('playing');
					});

					player.addEventListener(player.Event.TIME_UPDATE, data => {
						easeLive.emit('player.time', {
							timecode: new Date().getTime()
						});
					});
				}
			});

			this.easeLive.init();
		}
	}
}

import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import ControlsFullScreen from 'ref/responsive/player/controls/ControlsFullScreen';
import ControlsVolume from './controls/ControlsVolume';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { noop } from 'shared/util/function';

import './PlayerAdsOverlay.scss';
import { isIOS } from 'shared/util/browser';

const bem = new Bem('player-ads-overlay');
const bemPlayerControlButton = new Bem('player-control-button');

interface Props extends React.Props<any> {
	className?: string;
	toggleFullscreen: () => void;
	isAdPlaying: boolean;
	isControlsShown: boolean;
	isMuted: boolean;
	embed?: boolean;
	defaultVolume: number;
	setVolumeMutedState: (isMuted: boolean) => void;
	setVolume: (value: number) => void;
	interactMutedState: (hasInteracted: boolean) => void;
}

export class PlayerAdsOverlay extends React.Component<Props> {
	componentDidMount() {
		fullscreenService.setCallback(this.fullscreenCallback);
	}

	componentWillUnmount() {
		fullscreenService.removeCallback(this.fullscreenCallback);
	}

	render() {
		const {
			toggleFullscreen,
			isAdPlaying,
			isControlsShown,
			setVolumeMutedState,
			setVolume,
			isMuted,
			defaultVolume,
			interactMutedState,
			embed
		} = this.props;
		const isFullscreen = fullscreenService.isFullScreen();
		const isIOSEmbed = embed && isIOS();

		return (
			<div
				className={bem.b({
					'ads-playing': isAdPlaying,
					fullscreen: isFullscreen,
					'controls-shown': isControlsShown
				})}
			>
				<div className={bem.e('fader')} />
				<div className={bem.e('player-controls')}>
					<div className={bem.e('col-left')}>
						<ControlsVolume
							className={cx(bemPlayerControlButton.b(), bem.e('volume'))}
							onVolumeChange={setVolume}
							onActive={noop}
							defaultVolume={defaultVolume}
							setVolumeMutedState={setVolumeMutedState}
							isMuted={isMuted}
							isMutedClicked={interactMutedState}
						/>
					</div>
					{!isIOSEmbed && (
						<div className={bem.e('col-right')}>
							<ControlsFullScreen
								key="fullscreen"
								className={cx(bemPlayerControlButton.b(), bem.e('fullscreen'))}
								onClick={toggleFullscreen}
								isFullscreen={isFullscreen}
							/>
						</div>
					)}
				</div>
			</div>
		);
	}

	private fullscreenCallback = (): void => {
		// sync component's view on fullscreen change instead of store useless state inside components
		this.forceUpdate();
	};
}

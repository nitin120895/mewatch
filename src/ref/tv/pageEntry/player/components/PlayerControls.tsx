import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { wrapValue } from 'ref/tv/util/focusUtil';
import { PlayerAPI } from '../playerCore/PlayerAPI';
import './PlayerControls.scss';

const bem = new Bem('player-controls');

interface PlayerControlsProps {
	classNames?: string;
	isEndMode?: boolean;
	isPlay?: boolean;
	focused?: boolean;
	show?: boolean;
	player: PlayerAPI;
	clickSound: () => void;
	clickCC: () => void;
}

interface PlayerControlsState {
	focusState: number;
}

let focusArray = [];

export default class PlayerControls extends React.Component<PlayerControlsProps, PlayerControlsState> {
	private player: PlayerAPI;
	private showCC: boolean;
	private showSound: boolean;
	private show: boolean;

	constructor(props) {
		super(props);

		this.player = props.player;
		this.show = props.show;
		this.state = {
			focusState: 1 // play & pause
		};

		focusArray = this.getControlsArray();
	}

	componentWillReceiveProps(nextProps: PlayerControlsProps) {
		if (nextProps.show !== this.show) {
			this.show = nextProps.show;
			this.setState({ focusState: 1 });
		}

		if (nextProps.player && this.player !== nextProps.player) {
			this.player = nextProps.player;

			focusArray = this.getControlsArray();
		}
	}

	render() {
		const focused = this.props.focused;
		const focusState = focusArray[this.state.focusState];

		return (
			<div className={cx(bem.b(), this.props.classNames)}>
				{/* <button className={cx(bem.e('skip-back'),
				focused && focusState === 'skipBack' ? 'focused' : '')}>
				<i className={'icon icon-player-skip-back'}></i>
			</button> */}
				<button
					className={cx(bem.e('rewind'), focused && focusState === 'rewind' ? 'focused' : '')}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(0)}
				>
					<i className={'icon icon-player-rewind'} />
				</button>
				<button
					className={cx(bem.e('play', { show: !this.props.isPlay }), focused && focusState === 'play' ? 'focused' : '')}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(1)}
				>
					<i className={'icon icon-player-play'} />
				</button>
				<button
					className={cx(bem.e('pause', { show: this.props.isPlay }), focused && focusState === 'play' ? 'focused' : '')}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(1)}
				>
					<i className={'icon icon-player-pause'} />
				</button>
				<button
					className={cx(bem.e('fast-forward'), focused && focusState === 'ff' ? 'focused' : '')}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(2)}
				>
					<i className={'icon icon-player-fast-forward'} />
				</button>
				{/* <button className={cx(bem.e('skip-forward'), focused && focusState === 'skipForward' ? 'focused' : '')}>
				<i className={'icon icon-player-skip-forward'}></i>
			</button> */}
				<button
					className={cx(
						bem.e('closed-captions', { showCC: this.showCC }),
						focused && focusState === 'cc' ? 'focused' : '',
						focusState === 'cc' ? 'selected' : ''
					)}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(3)}
				>
					<i className={'icon icon-player-closed-captions'} />
				</button>
				<button
					className={cx(
						bem.e('sound', { showSound: this.showSound }),
						focused && focusState === 'sound' ? 'focused' : '',
						focusState === 'sound' ? 'selected' : ''
					)}
					onClick={this.invokeItem}
					onMouseEnter={() => this.handleMouseEnter(4)}
				>
					<i className={'icon icon-player-sound'} />
				</button>
			</div>
		);
	}

	private handleMouseEnter = (focusState: number) => {
		this.setState({ focusState: focusState });
	};

	moveLeft = () => {
		const maxIndex = focusArray.length - 1;
		const focusState = this.state.focusState - 1;
		this.setState({ focusState: wrapValue(focusState, 0, maxIndex) });
	};

	moveRight = () => {
		const maxIndex = focusArray.length - 1;
		const focusState = this.state.focusState + 1;
		this.setState({ focusState: wrapValue(focusState, 0, maxIndex) });
	};

	invokeItem = () => {
		if (!this.player) {
			return;
		}

		const focusState = focusArray[this.state.focusState];
		switch (focusState) {
			case 'play':
				if (this.props.isPlay) {
					this.player.pause();
				} else {
					this.player.play();
				}
				break;

			case 'cc':
				this.props.clickCC && this.props.clickCC();
				break;

			case 'sound':
				this.props.clickSound && this.props.clickSound();
				break;

			case 'ff':
				this.player.fastforward();
				break;

			case 'rewind':
				this.player.rewind();
				break;

			default:
				break;
		}
	};

	private getControlsArray() {
		const focusArray = [
			// 'skipBack',
			'rewind',
			'play',
			'ff'
			// 'skipForward',
			// 'cc',
			// 'sound'
		];

		if (!this.player) return focusArray;

		this.showCC = this.player.getAvailableTextTracks().length > 0;
		this.showSound = this.player.getAvailableAudioTracks().length > 1;
		if (this.showCC) {
			focusArray.push('cc');
		}

		if (this.showSound) {
			focusArray.push('sound');
		}

		return focusArray;
	}
}

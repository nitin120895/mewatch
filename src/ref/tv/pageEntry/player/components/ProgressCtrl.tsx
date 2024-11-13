import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { toTimeString } from 'ref/tv/util/text';
import './ProgressCtrl.scss';

interface ProgressCtrlProps extends React.Props<any> {
	className?: string;
	position: number;
	duration: number;
	playrate: number;
	thumbUrl?: string;
}

const bem = new Bem('player-progress');

export default class ProgressCtrl extends React.Component<ProgressCtrlProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const { playrate, className, position, duration, thumbUrl } = this.props;
		const classes = cx(bem.b(), className);
		const percentPosition = (position / duration) * 100;
		const showPlayrate = playrate !== 1;
		const curTime = toTimeString(position);
		let thumbImage;
		let thumbImgStyle;
		let thumbPosStyle;
		let textPosStyle;

		if (showPlayrate) {
			thumbImage = this.getThumbImage(position, thumbUrl);

			if (thumbImage) {
				thumbImgStyle = {
					backgroundImage: `url("${thumbImage}")`
				};

				if (percentPosition < 14) {
					thumbPosStyle = { right: 'auto' };
				}
			} else {
				if (percentPosition < 8) {
					textPosStyle = { right: 'auto' };
				}
			}
		}

		return (
			<div className={classes}>
				<div className={bem.e('timebar')}>
					<div className={bem.e('bar')}>
						<div
							className={bem.e('bar-current')}
							style={{
								width: percentPosition + '%'
							}}
						>
							<div className={bem.e('text-snap', { show: showPlayrate && !thumbImage })} style={textPosStyle}>
								{this.renderFFState(curTime, playrate, true)}
							</div>
							<div className={bem.e('thumb-snap', { show: showPlayrate && thumbImage })} style={thumbPosStyle}>
								<div className={bem.e('img')} style={thumbImgStyle} />
								<div className="cover" />
								{this.renderFFState(curTime, playrate, false)}
							</div>
						</div>
					</div>
					<div className={bem.e('text')}>
						<span className={bem.e('text-cur-pos')}>{curTime}</span>
						<span className={bem.e('text-center')}>/</span>
						<span className={bem.e('text-duration')}>{toTimeString(duration)}</span>
					</div>
				</div>
			</div>
		);
	}

	renderFFState(curTime, playrate, textMode) {
		const direction = playrate > 0 ? 'icon-player-fast-forward' : 'icon-player-rewind';

		return (
			<div className={bem.e('state', { textMode })}>
				<span className={bem.e('pos')}>{curTime}</span>
				<span className={bem.e('direction')}>
					<i className={cx(bem.e('icon'), 'icon', direction)} />
				</span>
				<span className={bem.e('rate')}>{Math.abs(playrate)}x</span>
			</div>
		);
	}

	private getThumbImage(pos, thumbUrl) {
		if (!pos || !thumbUrl) {
			return;
		}

		const curSeconds = Math.floor(pos / 5) * 5 + 1;
		const hours = Math.floor(curSeconds / 3600);
		const minutes = Math.floor((curSeconds % 3600) / 60);
		const seconds = Math.floor((curSeconds % 3600) % 60);
		const curTime =
			hours >= 10
				? hours
				: '0' +
				  hours +
				  '.' +
				  (minutes >= 10 ? minutes : '0' + minutes) +
				  '.' +
				  (seconds >= 10 ? seconds : '0' + seconds);

		return thumbUrl.replace(/\/[0-9][0-9].[0-9][0-9].[0-9][0-9]./, `/${curTime}.`);
	}
}

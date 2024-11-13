import * as React from 'react';
import LikeIcon from './LikeIcon';

import './AnimatedHeart.scss';

interface AnimatedHeartProps {
	color: string;
	removeHeart?: () => void;
}

class AnimatedHeart extends React.Component<AnimatedHeartProps, any> {
	private heartRef: HTMLElement;
	private animationReqId: number;

	private onHeartRef = ref => {
		if (!ref) return;
		this.heartRef = ref;
	};

	componentDidMount() {
		this.handleAnimation();
	}

	componentWillUnmount() {
		window.cancelAnimationFrame(this.animationReqId);
	}

	handleAnimation() {
		let x = 0;
		let y = 0;
		let finalY = -500;
		let phase = Math.random() * 360;
		let radius = Math.random() * 1;
		let speed = 1 + Math.random() * 2;
		let scale = 0.5 + Math.random() * 0.5;
		let grow = 0.01;
		let alpha = 1;
		let done = false;

		const fly = timestamp => {
			// Update animated property values
			if (alpha > 0) {
				alpha -= 0.009;
			}

			if (alpha < 0) {
				alpha = 0;
			}

			x += Math.cos(phase / 20) * radius;
			y -= speed;
			grow += (scale - grow) / 10;
			phase += 1;

			// Apply style to heart
			this.heartRef.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(0) scale(${grow})`;
			this.heartRef.style.opacity = alpha.toString();

			// Check if animation is done
			// When heart is final Y position or has faded out, whichever earlier
			done = y < finalY || alpha === 0;

			if (!done) {
				// Request next frame again if animation is in progress
				this.animationReqId = window.requestAnimationFrame(fly);
			} else {
				// When animation is done, stop calling next frame callback
				// and remove heart from DOM
				window.cancelAnimationFrame(this.animationReqId);
				this.props.removeHeart();
			}
		};

		this.animationReqId = window.requestAnimationFrame(fly);
	}

	render() {
		const { color } = this.props;
		return (
			<div className="animated-heart" ref={this.onHeartRef}>
				<LikeIcon fill={color} />
			</div>
		);
	}
}

export default AnimatedHeart;

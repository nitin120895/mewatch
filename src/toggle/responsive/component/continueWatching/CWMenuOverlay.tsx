import * as React from 'react';
import * as cx from 'classnames';

import { Bem } from 'shared/util/styles';
import { isTabletSize } from 'ref/responsive/util/grid';

import './CWMenuOverlay.scss';

const bem = new Bem('cw-menu-overlay');

enum OverlayPositions {
	rightFromDesktop = 2,
	rightBeforeDesktop = 1.5,
	top = 10.375
}

export class CWMenuOverlay extends React.Component<any> {
	private content: HTMLElement;
	componentDidMount() {
		window.addEventListener('resize', this.onResize, false);
		this.onResize();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	private resizeContent = () => {
		if (!this.content) return;
		const { innerWidth, innerHeight } = window;
		this.content.style.left = '0px';
		const bounds = this.content.getBoundingClientRect() as DOMRect;
		if (innerWidth - bounds.width < bounds.x) {
			const isTablet = isTabletSize();
			let right = isTablet ? OverlayPositions.rightBeforeDesktop : OverlayPositions.rightFromDesktop;
			this.content.style.left = 'auto';
			this.content.style.right = -right + 'rem';
		}

		const bottomclick = innerHeight - 0;
		if (bounds.bottom > bottomclick) {
			this.content.style.top = -OverlayPositions.top + 'rem';
		}
	};

	private onResize = (e?) => {
		window.requestAnimationFrame(this.resizeContent);
	};

	private onContentRef = (ref: HTMLElement) => {
		this.content = ref;
	};

	render() {
		const { className, children } = this.props;
		return (
			<div className={cx(bem.b(), className)}>
				<div className={bem.e('container')} ref={this.onContentRef}>
					<div className={cx(bem.e('content'))}>{children}</div>
				</div>
			</div>
		);
	}
}

export default CWMenuOverlay;

import * as React from 'react';
import * as cx from 'classnames';

import { Bem } from 'shared/util/styles';

import './PopOverOverlay.scss';

const bem = new Bem('pop-over-overlay');

interface PopOverOverlayProps {
	children: any;
	overlayTopPosition: boolean;
}

const PopOverOverlay = ({ children, overlayTopPosition }: PopOverOverlayProps) => {
	return (
		<div className={cx(bem.e('wrapper', { bottom: overlayTopPosition }))}>
			<div className={cx(bem.e('content'))}>{children}</div>
		</div>
	);
};

export default PopOverOverlay;

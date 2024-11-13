import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';

import './SlideArrow.scss';

type ArrowDirection = 'left' | 'right' | 'up' | 'down';

interface SlideArrowProps extends React.HTMLProps<any> {
	direction: ArrowDirection;
	className?: string;
	onClick?: (string) => void;
	introAnimation?: boolean;
	visible?: boolean;
	disabled?: boolean;
	ariaHidden?: boolean;
	ariaLabel?: string;
}

const bem = new Bem('arrow');
const viewBox = { width: 15, height: 27 };

export default class SlideArrow extends React.Component<SlideArrowProps, any> {
	static defaultProps = {
		introAnimation: false,
		visible: false,
		disabled: false,
		ariaHidden: false,
		ariaLabel: ''
	};

	static SVG_DATA = {
		left: 'M13 1 L3 12.5 L13 24',
		right: 'M3 1 L13 12.5 L3 24',
		up: 'M13 12.933L7 7l-6 5.933',
		down: 'M1 1l6 5.933L13 1M13 12.933'
	};

	private onClick = e => {
		const { onClick, direction } = this.props;
		if (onClick) onClick(direction);
	};

	render() {
		const { direction, className, introAnimation, visible, disabled, ariaHidden, ariaLabel } = this.props;
		const classes = cx(bem.b(direction, { [`animate-${direction}`]: introAnimation }, { visible }), className);
		const icon = SlideArrow.SVG_DATA[direction];
		return (
			<IntlFormatter
				elementType="button"
				type="button"
				className={classes}
				onClick={this.onClick}
				disabled={disabled}
				aria-hidden={ariaHidden}
				onMouseEnter={this.props.onMouseEnter}
				onMouseLeave={this.props.onMouseLeave}
				formattedProps={{ 'aria-label': ariaLabel }}
			>
				<SVGPathIcon className={cx('svg-icon', bem.e('icon'))} data={icon} viewBox={viewBox} />
			</IntlFormatter>
		);
	}
}

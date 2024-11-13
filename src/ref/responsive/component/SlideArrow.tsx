import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter from './IntlFormatter';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';

import './SlideArrow.scss';

type ArrowDirection = 'left' | 'right';

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
		left: 'M11 1 L2 12 L11 24',
		right: 'M1 1 L10 12 L1 24'
	};

	private onClick = e => {
		if (this.props.onClick) this.props.onClick(this.props.direction);
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

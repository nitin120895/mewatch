import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { resolveColor } from '../util/itemUtils';
import EllipsisLabel from './EllipsisLabel';
import './GradientTitle.scss';

interface GradientTitleProps {
	title: string;
	className?: string;
	customFields?: any;
	noGradient?: boolean;
}

const bem = new Bem('gradient-title');

export default class GradientTitle extends React.Component<GradientTitleProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const { title, className, customFields, noGradient } = this.props;
		const classes = cx(bem.b({ noGradient }), className);
		const titleClasses = cx(bem.e('title'), 'truncate');

		let tColor;
		let tHorAlignment;
		let tVerAlignment;

		if (customFields) {
			if (customFields.textColor) {
				tColor = resolveColor(customFields.textColor, '#fff');
			}

			if (customFields.textHorizontalAlignment) {
				tHorAlignment = customFields.textHorizontalAlignment.toLowerCase();
			}

			if (customFields.textVerticalAlignment) {
				tVerAlignment = customFields.textVerticalAlignment.toLowerCase();
			}
		}

		if (!tVerAlignment) {
			tVerAlignment = 'bottom';
		}

		let cusStyle = {
			textAlign: tHorAlignment ? tHorAlignment : 'center',
			top: tVerAlignment === 'top' ? '10%' : '',
			bottom: tVerAlignment === 'bottom' ? '0%' : '',
			color: tColor ? tColor : 'white'
		};

		cusStyle.top = tVerAlignment === 'center' ? '45%' : '';

		return (
			<div className={classes} style={cusStyle}>
				<EllipsisLabel className={titleClasses} text={title} />
			</div>
		);
	}
}

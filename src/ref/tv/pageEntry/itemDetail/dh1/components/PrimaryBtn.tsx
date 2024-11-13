import * as React from 'react';
import IntlFormatter from 'ref/tv/component/IntlFormatter';

interface PrimaryBtnProps extends React.HTMLProps<any> {
	className: string;
	text: string;
	index: number;
	onMouseEnter?: (index) => void;
	onMouseLeave?: (index) => void;
	onClick?: (position?) => void;
}

export default class PrimaryBtn extends React.Component<PrimaryBtnProps, any> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseLeave = () => {
		const { onMouseLeave, index } = this.props;
		onMouseLeave && onMouseLeave(index);
	};

	private handleClick = () => {
		const { onClick } = this.props;
		onClick && onClick();
	};

	render(): any {
		const { className, text } = this.props;

		return (
			<IntlFormatter
				tagName="button"
				onClick={this.handleClick}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				className={className}
			>
				{text}
			</IntlFormatter>
		);
	}
}

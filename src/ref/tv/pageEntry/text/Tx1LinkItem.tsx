import * as React from 'react';
import './Tx1Links.scss';

interface Tx1LinkItemProps extends React.HTMLProps<any> {
	className: string;
	setBtnRefs: (ref, index) => void;
	style?: any;
	index?: number;
	item?: api.ItemSummary;
	onMouseEnter?: (index) => void;
	onClick?: () => void;
}

export default class Tx1LinkItem extends React.Component<Tx1LinkItemProps, any> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleClick = () => {
		this.props.onClick && this.props.onClick();
	};

	private onReference = ref => {
		const { setBtnRefs, index } = this.props;
		setBtnRefs && setBtnRefs(ref, index);
	};

	render(): any {
		const { className, style, item } = this.props;

		return (
			<div
				className={className}
				ref={this.onReference}
				style={style}
				onClick={this.handleClick}
				onMouseEnter={this.handleMouseEnter}
			>
				{item.title}
			</div>
		);
	}
}

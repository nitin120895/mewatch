import * as React from 'react';
import * as classnames from 'classnames';

type KeyboardKeyProps = {
	uppercased?: boolean;
	className?: string;
	onClick?: (index) => void;
	onMouseEnter?: (index) => void;
	index?: number;
};

export class KeyboardKey extends React.PureComponent<KeyboardKeyProps, {}> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		const { onClick, index } = this.props;
		onClick && onClick(index);
	};

	render() {
		const classNames = classnames('KeyboardKey', this.props.className, {
			'KeyboardKey--uppercased': this.props.uppercased
		});

		return (
			<div className={classNames} onMouseEnter={this.handleMouseEnter} onClick={this.handleMouseClick}>
				<div className="border" />
				{this.props.children}
			</div>
		);
	}
}

export default KeyboardKey;

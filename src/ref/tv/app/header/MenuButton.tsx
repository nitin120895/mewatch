import * as React from 'react';
import * as cx from 'classnames';

/**
 * Accessible Menu Toggle Button.
 *
 * Displays a hamburger menu icon for use with an external menu component.
 */
interface MenuButtonProps extends React.HTMLProps<any> {
	onClick: () => void;
}

export default class MenuButton extends React.Component<MenuButtonProps, any> {
	static defaultProps = {
		className: 'menu-btn'
	};

	constructor(props) {
		super(props);
	}

	render() {
		const { className } = this.props;
		const classes = cx('icon-btn', className);
		const label = 'Toggle Navigation Menu';
		// Although we use a button element, we explicitly specify the role to enable toggle button mode
		return (
			<button
				type="button"
				role="button"
				tabIndex={0}
				className={classes}
				aria-label={label}
				aria-haspopup="true"
				onClick={this.props.onClick}
			>
				<i className="icon icon-menu-btn" />
			</button>
		);
	}
}

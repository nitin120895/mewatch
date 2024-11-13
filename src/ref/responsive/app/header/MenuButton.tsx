import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import * as cx from 'classnames';

interface MenuButtonProps extends React.HTMLProps<any> {
	width?: number | string;
	height?: number | string;
	toggleMenuVisibility(open: boolean): void;
	menuVisible: boolean;
	menuId?: string;
}

/**
 * Accessible Menu Toggle Button.
 *
 * Displays a hamburger menu icon for use with an external menu component.
 */
export default class MenuButton extends React.Component<MenuButtonProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%',
		className: 'menu-btn',
		menuVisible: false
	};

	static SVG_DATA = 'M0,27H32V23.33H0V27Zm0-9.17H32V14.17H0v3.67ZM0,5V8.67H32V5Z';
	static VIEW_BOX = { width: 32, height: 32 };

	constructor(props) {
		super(props);
	}

	private onClick = e => {
		e.preventDefault();
		this.props.toggleMenuVisibility(!this.props.menuVisible);
	};

	render() {
		const { className, width, height, menuVisible, menuId } = this.props;
		const classes = cx('icon-btn', className);
		const label = `${menuVisible ? 'Close' : 'Open'} Navigation Menu`;
		// Although we use a button element, we explicitly specify the role to enable toggle button mode
		return (
			<button
				type="button"
				role="button"
				tabIndex={0}
				className={classes}
				onClick={this.onClick}
				aria-label={label}
				aria-haspopup="true"
				aria-controls={menuId}
				aria-expanded={menuVisible}
				aria-pressed={menuVisible}
			>
				<SVGPathIcon
					className="svg-icon"
					data={MenuButton.SVG_DATA}
					viewBox={MenuButton.VIEW_BOX}
					width={width}
					height={height}
				/>
			</button>
		);
	}
}

import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import './ArrowButton.scss';

const bem = new Bem('arrow-button');

interface ArrowButtonProps extends React.HTMLProps<any> {
	direction: 'up' | 'down' | 'left' | 'right';
	onClick?: () => void;
	className?: string;
	show?: boolean;
}

export default class ArrowButton extends React.Component<ArrowButtonProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	constructor(props) {
		super(props);
	}

	render() {
		const { direction, show, className } = this.props;
		let buttonClass;
		let arrowDirectionClass;
		let hide = false;

		if (!show || !this.context.focusNav.mouseActive) hide = true;

		switch (direction) {
			case 'up':
				arrowDirectionClass = 'icon-arrow-up';
				break;
			case 'down':
				arrowDirectionClass = 'icon-arrow-down';
				break;
			case 'left':
				arrowDirectionClass = 'icon-arrow-prev';
				break;
			case 'right':
				arrowDirectionClass = 'icon-arrow-next';
				break;
			default:
				break;
		}

		buttonClass = className ? cx(bem.b({ hide }), className) : bem.b({ hide }, direction);

		return (
			<button type="button" className={buttonClass} onClick={this.onClick} disabled={hide}>
				<i className={cx(`icon ${arrowDirectionClass}`, bem.e('icon'))} />
			</button>
		);
	}

	private onClick = e => {
		e.preventDefault();
		this.props.onClick();
	};
}

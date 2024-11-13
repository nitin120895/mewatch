import * as React from 'react';
import * as PropTypes from 'prop-types';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import './FixedHero.scss';

type FixedHeroProps = {
	children: any;
};

type FixedHeroState = {
	isFixed: boolean;
};

type FixedHeroContext = {
	focusNav: DirectionalNavigation;
};

let count = 0;

export default class FixedHero extends React.Component<FixedHeroProps, FixedHeroState> {
	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	context: FixedHeroContext;

	private id = 'fixed-hero-' + ++count;

	constructor(props: FixedHeroProps, context: FixedHeroContext) {
		super(props);
		this.state = {
			isFixed: context.focusNav.isGlobalHeaderVisible
		};
	}

	componentDidMount() {
		this.context.focusNav.addEventHandler(GlobalEvent.GLOBAL_HEADER, this.id, (headerVisible: boolean) => {
			const { isFixed } = this.state;
			if (headerVisible) {
				!isFixed && this.setState({ isFixed: true });
			} else {
				isFixed && this.setState({ isFixed: false });
			}
		});
	}

	componentWillUnmount() {
		this.context.focusNav.removeEventHandler(GlobalEvent.GLOBAL_HEADER, this.id);
	}

	render() {
		const { children } = this.props;
		const { isFixed } = this.state;
		const cx = 'fixed-hero';
		const style: React.CSSProperties = isFixed ? undefined : { position: 'absolute' };

		return (
			<div className={cx} style={style}>
				{children}
			</div>
		);
	}
}

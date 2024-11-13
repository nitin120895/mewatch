import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { findDOMNode } from 'react-dom';

interface ContinuousScrollProps {
	className?: string;
	hasNextPage: boolean;
	loadNextPage: () => void;
	scrollContainer?: Element;
}

interface ContinuousScrollState {
	container: Element | Window;
}

export const continuousScrollBem = new Bem('continuous-scroll');

export default class ContinuousScroll extends React.Component<ContinuousScrollProps, ContinuousScrollState> {
	state = {
		container: typeof window !== 'undefined' ? window : undefined
	};
	continuousScrollEnd = undefined;

	componentDidMount() {
		this.state.container.addEventListener('scroll', this.onScroll, false);
	}

	componentWillReceiveProps({ scrollContainer }: ContinuousScrollProps) {
		if (scrollContainer && scrollContainer !== this.props.scrollContainer) {
			this.state.container.removeEventListener('scroll', this.onScroll);
			this.setState({ container: scrollContainer }, () => {
				this.state.container.addEventListener('scroll', this.onScroll, false);
			});
		}
	}

	componentWillUnmount() {
		this.continuousScrollEnd = undefined;
		this.state.container.removeEventListener('scroll', this.onScroll);
	}

	render() {
		const { className, hasNextPage } = this.props;
		return (
			<div className={continuousScrollBem.b(className)}>
				{this.props.children}
				{hasNextPage && <div id="continuousScrollEnd" ref={e => (this.continuousScrollEnd = e)} />}
			</div>
		);
	}

	onScroll = () => {
		if (!this.continuousScrollEnd) return;

		const { container } = this.state;
		const continuousScrollEnd = findDOMNode<HTMLElement>(this.continuousScrollEnd);
		let condition: boolean = undefined;
		let treshold: number = undefined;

		// If Scroll container is window
		if (!this.props.scrollContainer) {
			const scrollY = window.pageYOffset;
			treshold = 300;
			condition = scrollY >= continuousScrollEnd.offsetTop - (window.innerHeight + treshold);
		} else {
			// If Scroll container is custom node
			const node = (container as any) as HTMLElement;
			const { scrollTop, scrollHeight, offsetHeight, scrollLeft, scrollWidth, offsetWidth } = node;
			treshold = 150;

			// verticall scroll
			if (scrollWidth === offsetWidth) condition = scrollHeight - (scrollTop + offsetHeight + treshold) < 0;
			// horizontal scroll
			if (scrollHeight === offsetHeight) condition = scrollWidth - (scrollLeft + offsetWidth + treshold) < 0;
		}

		if (condition) {
			this.props.loadNextPage();
		}
	};
}

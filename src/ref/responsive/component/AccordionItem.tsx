import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { findDOMNode } from 'react-dom';
import { debounce } from 'shared/util/performance';
import { noop } from 'shared/util/function';

import './AccordionItem.scss';

const className = 'accordion-item';
const bem = new Bem(className);

interface AccordionItemProps extends React.HTMLProps<any> {
	open?: boolean;
	children: any;
	className?: string;
	onChildTransitionEnd?: (key: string) => void;
	keyId?: string;
	component?: string | React.ComponentClass<any> | React.SFC<any>;
	// If you use these, it is HIGHLY recommended you transition on all the grow props listed below
	onCloseTransitionClass?: string;
	onOpenTransitionClass?: string;
}

interface AccordionItemState {
	style?: object;
	transitioning?: boolean;
	closing?: boolean;
	opening?: boolean;
}

// All of these values contribute to the 'height' of a DOM node. So we need to make sure that we
// take into account the values of these and transition them all
const growProps = [
	'height',
	'paddingBottom',
	'paddingTop',
	'marginTop',
	'marginBottom',
	'borderTopWidth',
	'borderBottomWidth'
];
// We often 'zero' out all the props, so make a single object for this purpose
const zeroedProps = growProps.reduce((obj, prop) => {
	obj[prop] = '0px';
	return obj;
}, {});

function getGrowProps(element: HTMLElement) {
	const oldStyle = element.style.cssText;
	element.style.cssText = '';
	const styles = getComputedStyle(element);
	const values = growProps.reduce((obj, prop) => {
		obj[prop] = styles[prop];
		return obj;
	}, {});
	element.style.cssText = oldStyle;
	return values;
}

export default class AccordionItem extends React.Component<AccordionItemProps, any> {
	static defaultProps = {
		onCloseTransitionClass: `${className}-closing`,
		onOpenTransitionClass: `${className}-opening`,
		onChildTransitionEnd: noop,
		component: 'div'
	};

	state: AccordionItemState = {
		style: undefined,
		transitioning: false,
		closing: false,
		opening: false
	};

	private container: HTMLElement;
	private closeTimeout: number;
	private openTimeout: number;

	componentWillReceiveProps(nextProps: AccordionItemProps) {
		// we're closing. This needs to be done in will receive props
		// as we need to do it BEFORE it gets rendered to ensure we get the correct height
		if (this.props.open && !nextProps.open) {
			this.setState({
				closing: true,
				opening: false,
				transitioning: true,
				style: getGrowProps(this.container)
			});
		}

		if (!this.props.open && nextProps.open) {
			this.setState({
				style: zeroedProps,
				transitioning: true,
				opening: true,
				closing: false
			});
		}
	}

	componentDidUpdate(prevProps: AccordionItemProps) {
		if (!this.props.open && prevProps.open) {
			this.resetTimeouts();
			this.closeTimeout = window.setTimeout(() => {
				this.setState({
					style: zeroedProps
				});
			}, 10);
		}
		// we just got set to open, so animate it
		// we need to do opening in did update as we need it to be rendered
		// so it has a height
		if (!prevProps.open && this.props.open) {
			// retrieve the height we need to transition to
			const fullSizeValues = getGrowProps(this.container);
			// reset it now that we have our height
			this.resetTimeouts();
			this.openTimeout = window.setTimeout(() => {
				this.setState({
					style: fullSizeValues
				});
			}, 10);
		}
	}

	componentWillUnmount() {
		this.resetTimeouts();
	}

	private transitionEnd = debounce(() => {
		this.setState({
			closing: false,
			opening: false,
			style: undefined,
			transitioning: false
		});
		// let parent know we just finished the transition
		this.props.onChildTransitionEnd(this.props.keyId);
	}, 10);

	private onTransitionEnd = (e: React.TransitionEvent<any>) => {
		if (e.target === this.container && this.state.transitioning) {
			this.transitionEnd();
		}
	};

	/** Resets/cancels the timeouts to ensure we don't do two actions */
	private resetTimeouts = () => {
		window.clearTimeout(this.openTimeout);
		window.clearTimeout(this.closeTimeout);
	};

	private containerRef = node => {
		this.container = findDOMNode<HTMLElement>(node);
	};

	render() {
		const {
			children,
			className,
			open,
			onCloseTransitionClass,
			onOpenTransitionClass,
			component,
			...otherProps
		} = this.props;
		const { style, closing, opening, transitioning } = this.state;

		// to keep with props conventions, but satisfy jsx, we rename to upper case
		const Component = component;

		const cloneProps = { ...otherProps };
		delete cloneProps.onChildTransitionEnd;
		delete cloneProps.keyId;

		return (
			<Component
				{...cloneProps}
				className={cx(
					className,
					bem.b(
						!closing && !opening && open ? 'open' : undefined,
						!closing && !opening && !open ? 'closed' : undefined
					),
					opening && transitioning ? onOpenTransitionClass : undefined,
					closing && transitioning ? onCloseTransitionClass : undefined
				)}
				ref={this.containerRef}
				onTransitionEnd={this.onTransitionEnd}
				style={style}
			>
				{children}
			</Component>
		);
	}
}

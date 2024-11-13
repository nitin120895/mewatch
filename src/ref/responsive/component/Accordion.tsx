import * as React from 'react';
import { noop } from 'shared/util/function';
import AccordionItem from './AccordionItem';

interface AccordionProps {
	activeKey?: string;
	children?: React.ReactElement<any> | Array<React.ReactElement<any>>;
	className?: string;
	oneAtATime?: boolean;
	// Will apply a default to each child accordion item
	// If you use these, it is HIGHLY recommended you transition on all the grow props listed below
	onCloseTransitionClass?: string;
	onOpenTransitionClass?: string;
	onTransitionEnd?: () => void;
}

interface AccordionState {
	currentKey: string;
	closingKey?: string;
}

class Accordion extends React.Component<AccordionProps, AccordionState> {
	static defaultProps = {
		oneAtATime: false,
		onTransitionEnd: noop
	};
	state: AccordionState = {
		currentKey: this.props.activeKey
	};

	componentWillReceiveProps(nextProps: AccordionProps) {
		if (nextProps.oneAtATime) {
			if (!this.state.closingKey) {
				// we're not in the process of closing, so update as needed
				if (!this.props.activeKey && nextProps.activeKey) {
					// was closed, now open
					this.setState({ currentKey: nextProps.activeKey });
				} else if (nextProps.activeKey !== this.props.activeKey) {
					// was open, close the other one -
					// setting current key to nothing will start the closing transition
					this.setState({ currentKey: undefined, closingKey: this.props.activeKey });
				}
			} else if (this.state.closingKey === nextProps.activeKey) {
				// they re-actived the currently closing key, set it back to active so it opens
				this.setState({ currentKey: nextProps.activeKey, closingKey: undefined });
			}
		} else {
			if (this.props.activeKey !== nextProps.activeKey) {
				// key changed, update it
				this.setState({ currentKey: nextProps.activeKey });
			}
		}
	}

	private onChildTransitionDone = (key: string) => {
		if (this.state.closingKey === key) {
			// must've just finished closing, set up our next one
			window.requestAnimationFrame(() => {
				this.setState({ currentKey: this.props.activeKey, closingKey: undefined });
			});
		}

		this.props.onTransitionEnd();
	};

	render() {
		const { children, className, onCloseTransitionClass, onOpenTransitionClass, oneAtATime } = this.props;
		const { currentKey } = this.state;

		return (
			<div className={className}>
				{React.Children.map(children, (child: React.ReactElement<any>) => {
					const overrideableProps = {
						open: child.key === currentKey,
						keyId: child.key as string,
						onCloseTransitionClass,
						onOpenTransitionClass
					};
					const onTransitionDone = oneAtATime ? this.onChildTransitionDone : undefined;
					if (child.type !== AccordionItem) {
						// we want our accordion item to 'take over' the child. This is why we take it's component ad props
						// then just render it's children. This way we transition on the actual child, not a container aorund it.
						return (
							<AccordionItem
								{...child.props}
								{...overrideableProps}
								component={child.type}
								onChildTransitionEnd={onTransitionDone}
							/>
						);
					} else {
						return React.cloneElement(child, {
							...overrideableProps,
							// child props goes last as it will override any common props
							// if defined
							...child.props,
							onChildTransitionEnd: onTransitionDone
						});
					}
				})}
			</div>
		);
	}
}

export default Accordion;

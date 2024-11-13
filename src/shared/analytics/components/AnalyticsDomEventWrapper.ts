import * as PropTypes from 'prop-types';
import * as React from 'react';
import { createElement } from 'react';
import { findDOMNode } from 'react-dom';
import { isOfType, JSTypes } from '../../util/objects';
import { AnalyticsContext, DomEvents, DomEventSourceType, EntryProps, EventName } from '../types/types';
import { ItemWrapperProps } from './ItemWrapper';

const eventOptions = {
	capture: true,
	passive: true
};

export interface WrappedComponentContext extends AnalyticsContext {
	entry: EntryProps;
}

type WrapperEventHandler = <P extends ItemWrapperProps>(
	props: P
) => (context: WrappedComponentContext, event: Event) => DomEvents['data'];

type AnalyticsDomEventWrapperProps<P> = {
	events?: EventName[];
	getEventData: (context: WrappedComponentContext, event: Event, component?: any) => DomEvents['data'];
	sourceType: DomEventSourceType;
	children?: JSX.Element;
};

export class AnalyticsDomEventWrapper<P> extends React.Component<AnalyticsDomEventWrapperProps<P>> {
	static contextTypes = {
		emitDomEvent: PropTypes.func,
		entry: PropTypes.object,
		getContextEntryData: PropTypes.func
	};

	static defaultProps = {
		events: [EventName.CLICK]
	};

	protected domNode: HTMLElement;
	private eventData;

	private handleEvent: EventListener = (event: Event) => {
		// Caching the data here means we will not get up to date image src references.
		// This is an accepted limitation for now
		this.eventData = this.eventData || this.props.getEventData(this.context, event);
		this.context.emitDomEvent(this.props.sourceType, event, this.eventData);
	};

	private bindEvents(this: AnalyticsDomEventWrapper<P>, domNode) {
		const { events } = this.props;
		if (isOfType(JSTypes.Array, events) && (domNode instanceof HTMLElement || domNode instanceof EventTarget)) {
			events.forEach(eventName => domNode.addEventListener(eventName, this.handleEvent, eventOptions));
		}
	}

	private unbindEvents(this: AnalyticsDomEventWrapper<P>, domNode) {
		const { events } = this.props;
		if (isOfType(JSTypes.Array, events) && (domNode instanceof HTMLElement || domNode instanceof EventTarget)) {
			events.forEach(eventName => domNode.removeEventListener(eventName, this.handleEvent, eventOptions));
		}
	}

	componentDidUpdate() {
		if (findDOMNode(this) !== this.domNode) {
			this.domNode = findDOMNode(this);
			this.bindEvents(this.domNode);
		}
	}

	componentDidMount() {
		this.domNode = findDOMNode(this);
		this.bindEvents(this.domNode);
	}

	componentWillUnmount() {
		this.unbindEvents(this.domNode);
		this.domNode = undefined;
	}

	render() {
		return this.props.children;
	}
}

export function analyticsComponentWrapper(
	events: EventName[],
	getEventData: WrapperEventHandler,
	sourceType: DomEventSourceType
) {
	return function<P>(WrappedComponent: React.ComponentType<P>): React.SFC<P> {
		return (props: P) =>
			createElement(
				AnalyticsDomEventWrapper,
				{
					events,
					sourceType,
					getEventData: getEventData(props as any)
				},
				createElement(WrappedComponent as any, props)
			);
	};
}

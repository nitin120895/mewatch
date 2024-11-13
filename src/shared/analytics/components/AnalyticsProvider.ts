import * as PropTypes from 'prop-types';
import * as React from 'react';
import { AnalyticsContext, AxisAnalytics, DomEvents, DomEventSourceType, EventName } from '../types/types';

interface AnalyticsProviderProps {
	emitDomEvent: AxisAnalytics['emitDomEvent'];
	emitVideoEvent: AxisAnalytics['emitVideoEvent'];
	children: JSX.Element;
}

export class AnalyticsProvider extends React.Component<AnalyticsProviderProps> {
	static childContextTypes = {
		emitDomEvent: PropTypes.func,
		emitVideoEvent: PropTypes.func
	};

	handleDomEvent = (eventSource: DomEventSourceType, event: Event, data: DomEvents['data']) => {
		this.props.emitDomEvent({
			eventName: event.type as EventName,
			sourceType: eventSource,
			data
		} as DomEvents);
	};

	handleVideoEvent = event => {
		this.props.emitVideoEvent(event);
	};

	getChildContext(this: AnalyticsProvider): AnalyticsContext {
		return {
			emitDomEvent: this.handleDomEvent,
			emitVideoEvent: this.handleVideoEvent
		};
	}

	render() {
		return React.Children.only(this.props.children);
	}
}

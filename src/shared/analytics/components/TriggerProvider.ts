import * as React from 'react';
import { createElement } from 'react';
import { DomEventSourceType, DomEventTriggers, EventName } from '../types/types';
import { AnalyticsDomEventWrapper } from './AnalyticsDomEventWrapper';

interface TriggerProviderProps {
	trigger: DomEventTriggers;
	data?: any;
	children: JSX.Element;
}

function getEventData<P extends TriggerProviderProps>(props: P) {
	return () => {
		return { trigger: props.trigger, data: props.data };
	};
}

class TriggerProvider<P> extends React.Component<P & TriggerProviderProps> {
	render() {
		return createElement(
			AnalyticsDomEventWrapper,
			{
				events: [EventName.CLICK, EventName.MOUSEDOWN, EventName.TOUCHEND],
				getEventData: getEventData(this.props),
				sourceType: DomEventSourceType.Trigger
			},
			this.props.children
		);
	}
}

export default TriggerProvider;

import * as React from 'react';
import { createElement } from 'react';
import {
	CTATypes,
	DomEventCWPageRemoveSelectedCta,
	DomEventItemCta,
	DomEventOfferCta,
	DomEventProductCta,
	DomEventSourceType,
	DomEventPreferencesCta,
	EventName
} from '../types/types';
import { AnalyticsDomEventWrapper } from './AnalyticsDomEventWrapper';

type CTAEventData =
	| DomEventCWPageRemoveSelectedCta['data']
	| DomEventItemCta['data']
	| DomEventOfferCta['data']
	| DomEventProductCta['data']
	| DomEventPreferencesCta['data'];

interface CTAWrapperProps {
	type: CTATypes;
	data?: CTAEventData['data'];
	children: JSX.Element;
}

function getEventData<P extends CTAWrapperProps>(props: P) {
	return () => {
		return { type: props.type, data: props.data } as any;
	};
}

class CTAWrapper<P> extends React.Component<P & CTAWrapperProps> {
	render() {
		return createElement(
			AnalyticsDomEventWrapper,
			{
				events: [EventName.CLICK, EventName.MOUSEENTER],
				getEventData: getEventData(this.props),
				sourceType: DomEventSourceType.CTA
			},
			this.props.children
		);
	}
}

export default CTAWrapper;

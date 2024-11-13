import * as React from 'react';
import { createElement } from 'react';
import { MenuTypes, EventName, DomEventSourceType } from 'shared/analytics/types/types';
import { AnalyticsDomEventWrapper } from 'shared/analytics/components/AnalyticsDomEventWrapper';

interface MenuWrapperProps {
	children: JSX.Element;
	menuItemsOrder: string[]; // Order of labels according to menu item hierarchy
	type: MenuTypes;
}

const getEventData = <P extends MenuWrapperProps>({ type, menuItemsOrder }: P) => {
	return () => {
		return { menuItemsOrder, type } as any;
	};
};

class MenuWrapper<P> extends React.Component<P & MenuWrapperProps> {
	render() {
		return createElement(
			AnalyticsDomEventWrapper,
			{
				events: [EventName.CLICK],
				getEventData: getEventData(this.props),
				sourceType: DomEventSourceType.Menu
			},
			this.props.children
		);
	}
}

export default MenuWrapper;

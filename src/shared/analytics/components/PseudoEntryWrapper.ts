import * as PropTypes from 'prop-types';
import * as React from 'react';
import { getDomEventDataEntry } from 'shared/analytics/getContext';

interface PsuedoEntryWrapperProps<P extends PageEntryPropsBase = PageEntryPropsBase> {
	getContextEntryData: () => P;
	children?: React.ReactElement<any>;
}

class PseudoEntryWrapper extends React.Component<PsuedoEntryWrapperProps, {}> {
	static childContextTypes = {
		getContextEntryData: PropTypes.func
	};

	getChildContext() {
		return {
			getContextEntryData: this.props.getContextEntryData
		};
	}

	render() {
		return this.props.children;
	}

	context: { entry: PageEntryListProps };
}

const getMenuEntryContext = <P extends { title: string; list: api.ItemList }>(props: P) => ({
	entry: getDomEventDataEntry({
		id: 'nav',
		type: 'ListEntry',
		title: props.title,
		template: 'MENU',
		index: 0,
		location: { pathname: '/' },
		list: props.list,
		customFields: { moreLinkUrl: props.list.path }
	} as any)
});

export const wrapPsuedoEntry = (getContextEntryData, View) => props =>
	React.createElement(
		PseudoEntryWrapper,
		{ getContextEntryData: () => getContextEntryData(props) },
		React.createElement(View, props, props.children)
	);

export const wrapMenuEntry = View => wrapPsuedoEntry(getMenuEntryContext, View);

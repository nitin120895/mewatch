import { IWidgetViewOptions } from '@wscsports/blaze-web-sdk';
import { isMobilePortrait } from 'toggle/responsive/util/grid';

export const enum BlazeEvent {
	CtaClick = 'cta_click',
	StoryExit = 'story_exit',
	StoryPageExit = 'story_page_exit',
	StoryPageStart = 'story_page_start',
	StoryStart = 'story_start'
}

export const COLORS = {
	darkGray: '#222',
	lightGray: '#666',
	purplishPink: '#E04FC5',
	red: '#EC0000',
	secondaryGray: '#CCCCCC',
	white: '#FFF'
};

enum Operator {
	AND = 'and',
	OR = 'or'
}

export enum WidgeType {
	Moment = 'moment',
	Story = 'story'
}

export enum SortingOrder {
	AToZ = 'aToZ',
	Manual = 'manual',
	RecentlyCreatedFirst = 'recentlyCreatedFirst',
	RecentlyCreatedLast = 'recentlyCreatedLast',
	RecentlyUpdatedFirst = 'recentlyUpdatedFirst',
	RecentlyUpdatedLast = 'recentlyUpdatedLast',
	ZToA = 'zToA'
}

export const labelColor = '#FFF';
export const ctaDestinationProperty = 'cta_destination';

export type WSCBlazeWidgetProps = IWidgetViewOptions & {
	id: string;
	width: string;
	height: string;
	style?: React.CSSProperties;
	onRender?: () => void;
};

export const createShortFormProps = props => {
	const { item, id } = props;
	const { customFields }: any = item;
	const { label, widgetType, operator } = customFields;
	const { maxItems, sortBy } = props.customFields;
	const widgetTypeLowerCased = widgetType && widgetType.toLowerCase();
	const isValidWidgetType = widgetTypeLowerCased === WidgeType.Story;
	const isMultipleLabels = label && label.includes(',');
	const parameters = {
		id,
		label: label && parseLabel(label),
		widgetType: isValidWidgetType ? widgetTypeLowerCased : undefined,
		operator,
		isMultipleLabels,
		maxItems,
		sortBy
	};
	return parameters;
};

/** Api is sending label value = "test,home" so parsing this value and
 * *  getting the parsed value output = "test", "home" */
const parseLabel = label => {
	return label
		.split(',')
		.map(label => `"${label}"`)
		.join(', ');
};

/** This function is checking label has multiple value or not if yes, then checking for the operand, if the operand
 * is exists then use that operands otherwise use default operand as OR.
 * if not the multiple label then return the label
 */
export const getShortFormLabelParameter = (shortFormProps, BlazeSDK) => {
	const { label, operator, isMultipleLabels } = shortFormProps;
	const operatorValue = operator && operator.toLowerCase();
	let labelValues;

	if (isMultipleLabels) {
		switch (operatorValue) {
			case Operator.AND:
				labelValues = BlazeSDK.LabelBuilder().mustInclude(label);
				break;
			default:
				labelValues = BlazeSDK.LabelBuilder().atLeastOneOf(label);
		}
		return labelValues;
	}
	return label;
};

/** 1) This funtion is checking that maxItems or sortBy value is present or not.
 *    if the maxItems value is not present or  it is 0 then no need to send to braze SDK.
 */

export const getSortAndMaxItems = (customFields, widgetRowCircleProps) => {
	const { maxItems, sortBy, widgetType } = customFields;

	if (maxItems && maxItems > 0) {
		if (isMobilePortrait() && maxItems > 4 && widgetType === WidgeType.Moment) {
			widgetRowCircleProps.maxItemsCount = 4;
		} else {
			widgetRowCircleProps.maxItemsCount = maxItems;
		}
	}

	if (sortBy) {
		Object.values(SortingOrder).includes(sortBy) && (widgetRowCircleProps.orderType = sortBy);
	}
	return widgetRowCircleProps;
};

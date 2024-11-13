import { DomEventSourceType, EventName } from 'shared/analytics/types/types';
import {
	analyticsComponentWrapper,
	WrappedComponentContext
} from 'shared/analytics/components/AnalyticsDomEventWrapper';
import { getEntryDataFromContext } from 'shared/analytics/components/ItemWrapper';

const getRailData = () => (context: WrappedComponentContext, event) => {
	const entry = getEntryDataFromContext(context, event);

	return { entry };
};

export const wrapRailHeader = analyticsComponentWrapper([EventName.CLICK], getRailData, DomEventSourceType.RailHeader);

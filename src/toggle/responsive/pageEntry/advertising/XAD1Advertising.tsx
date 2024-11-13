import * as React from 'react';
import { XAD1Advertising as template } from 'shared/page/pageEntryTemplate';
import AdBanner from '../../component/AdBanner';

import './XAD1Advertising.scss';

interface AnalyticsProps extends PageEntryPropsBase {
	item?: api.ItemDetail;
}

class XAD1Advertising extends React.PureComponent<AnalyticsProps> {
	render() {
		const { location, customFields, item } = this.props;
		const { textAdFormat, adCommaDelimitedTags, Kids, adUnit } = customFields;
		return (
			<AdBanner
				textAdFormat={textAdFormat}
				adCommaDelimitedTags={adCommaDelimitedTags}
				kidsContent={Kids}
				location={location}
				item={item}
				adUnitOverride={adUnit}
			/>
		);
	}
}

const Component: any = XAD1Advertising;
Component.template = template;
export default Component;

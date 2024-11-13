import * as React from 'react';
import BlazeSDK from 'toggle/responsive/component/shortForm/BlazeWrapper';
import { isMobilePortrait } from 'toggle/responsive/util/grid';
import {
	createShortFormProps,
	getSortAndMaxItems,
	getShortFormLabelParameter,
	labelColor,
	WSCBlazeWidgetProps,
	COLORS
} from 'toggle/responsive/util/shortFormUtil';
import WSCBlazeSDK from 'toggle/responsive/component/shortForm/WSCBlazeWidget';

const Moment = props => {
	const { id } = props;
	if (BlazeSDK) {
		const shortFormProps = createShortFormProps(props);
		const labelProps = getShortFormLabelParameter(shortFormProps, BlazeSDK);

		// change stories title/label color  default black to white
		const widgetTheme = BlazeSDK.Theme('row-rectangle');
		widgetTheme.layoutStyle.labelStyle.color = labelColor;

		widgetTheme.layoutStyle.statusUnreadStyle.backgroundColor = COLORS.purplishPink;
		widgetTheme.layoutStyle.statusUnreadStyle.height = 16;
		widgetTheme.layoutStyle.statusUnreadStyle.width = 43;
		widgetTheme.layoutStyle.statusUnreadStyle.borderRadius = '4px';
		widgetTheme.layoutStyle.statusUnreadStyle.padding = '3px 6px';
		widgetTheme.layoutStyle.statusUnreadStyle.textSize = '14px';
		widgetTheme.layoutStyle.statusUnreadStyle.positionOffset = { top: '4px', left: '4px' };

		widgetTheme.layoutStyle.statusLiveUnreadStyle.backgroundColor = COLORS.red;
		widgetTheme.layoutStyle.statusLiveUnreadStyle.height = 16;
		widgetTheme.layoutStyle.statusLiveUnreadStyle.width = 43;
		widgetTheme.layoutStyle.statusLiveUnreadStyle.padding = '3px 6px';
		widgetTheme.layoutStyle.statusLiveUnreadStyle.textSize = '14px';
		widgetTheme.layoutStyle.statusLiveUnreadStyle.borderRadius = '4px';
		widgetTheme.layoutStyle.statusLiveUnreadStyle.positionOffset = { top: '4px', left: '4px' };

		widgetTheme.layoutStyle.statusLiveStyle.backgroundColor = COLORS.lightGray;
		widgetTheme.layoutStyle.statusLiveStyle.height = 16;
		widgetTheme.layoutStyle.statusLiveStyle.width = 43;
		widgetTheme.layoutStyle.statusLiveStyle.padding = '3px 6px';
		widgetTheme.layoutStyle.statusLiveStyle.textSize = '14px';
		widgetTheme.layoutStyle.statusLiveStyle.borderRadius = '4px';
		widgetTheme.layoutStyle.statusLiveStyle.positionOffset = { top: '4px', left: '4px' };

		widgetTheme.layoutStyle.borderRadius = '0px';
		widgetTheme.layoutStyle.lines = 3;
		widgetTheme.layoutStyle.labelStyle.fontSize = '14px';

		widgetTheme.playerStyle.timeColor = COLORS.white;
		widgetTheme.playerStyle.timeColor = COLORS.secondaryGray;
		widgetTheme.playerStyle.timeFontSize = '14px';
		widgetTheme.playerStyle.titleFontSize = '14px';

		if (isMobilePortrait()) {
			widgetTheme.layoutStyle.columns = 2;
			widgetTheme.layoutStyle.rows = 2;
		}

		// props for render stories and monents we can change as per our requirments
		const widgetRowCircleProps: WSCBlazeWidgetProps = {
			id: `container-${id}`,
			labels: labelProps,
			contentType: 'story',
			theme: widgetTheme,
			width: '100%',
			height: isMobilePortrait() ? 'auto' : '14rem'
		};

		return <WSCBlazeSDK {...getSortAndMaxItems(shortFormProps, widgetRowCircleProps)} />;
	}
	/* tslint:disable-next-line:no-null-keyword */
	return null;
};

export default Moment;

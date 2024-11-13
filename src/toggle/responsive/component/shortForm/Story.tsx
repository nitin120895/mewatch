import * as React from 'react';
import BlazeSDK from 'toggle/responsive/component/shortForm/BlazeWrapper';
import { isMobile } from 'shared/util/browser';
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

const Story = props => {
	if (BlazeSDK) {
		const { id } = props;
		const shortFormProps = createShortFormProps(props);
		const labelValues = getShortFormLabelParameter(shortFormProps, BlazeSDK);

		// change stories title/label color  default black to white
		const widgetTheme = BlazeSDK.Theme('row-circle');
		widgetTheme.layoutStyle.labelStyle.color = labelColor;
		widgetTheme.layoutStyle.horizontalItemsSpacing = 16;
		widgetTheme.layoutStyle.labelStyle.gap = 4;
		widgetTheme.layoutStyle.labelStyle.fontSize = '13px';

		// Status Live Style
		widgetTheme.layoutStyle.statusLiveStyle.borderRadius = '4px';
		widgetTheme.layoutStyle.statusLiveStyle.textColor = COLORS.white;
		widgetTheme.layoutStyle.statusLiveStyle.textSize = isMobile() ? '11px' : '14px';
		widgetTheme.layoutStyle.statusLiveStyle.borderColor = COLORS.darkGray;
		widgetTheme.layoutStyle.statusLiveStyle.thumbnailBorderColor = COLORS.lightGray;
		widgetTheme.layoutStyle.statusLiveStyle.padding = '3px 6px'; // figma padding is 0 6px but we need to increase padding to 3px 6px for spacing.
		widgetTheme.layoutStyle.statusLiveStyle.borderRadius = '7px';

		// Status Live Unread style
		widgetTheme.layoutStyle.statusLiveUnreadStyle.borderRadius = '4px';
		widgetTheme.layoutStyle.statusLiveUnreadStyle.textColor = COLORS.white;
		widgetTheme.layoutStyle.statusLiveUnreadStyle.textSize = isMobile() ? '11px' : '14px';
		widgetTheme.layoutStyle.statusLiveUnreadStyle.borderColor = COLORS.darkGray;
		widgetTheme.layoutStyle.statusLiveUnreadStyle.thumbnailBorderColor = COLORS.red;
		widgetTheme.layoutStyle.statusLiveStyle.padding = '3px 6px'; // figma padding is 0 6px but we need to increase padding to 3px 6px for spacing.

		// Status Unread Style
		widgetTheme.layoutStyle.statusUnreadStyle.thumbnailBorderColor = COLORS.purplishPink;
		widgetTheme.layoutStyle.statusUnreadStyle.padding = '3px 6px'; // figma padding is 0 6px but we need to increase padding to 3px 6px for spacing.

		// change for player style for both live and normal player.
		widgetTheme.playerStyle.timeColor = COLORS.white;
		widgetTheme.playerStyle.timeColor = COLORS.secondaryGray;
		widgetTheme.playerStyle.timeFontSize = '14px';
		widgetTheme.playerStyle.titleFontSize = '14px';
		// props for render stories and monents we can change as per our requirments

		const widgetRowCircleProps: WSCBlazeWidgetProps = {
			id: `shortformSports-${id}`,
			labels: labelValues,
			contentType: 'story',
			theme: widgetTheme,
			width: '100%',
			height: isMobilePortrait() ? '8.875rem' : '9.5rem'
		};
		return <WSCBlazeSDK {...getSortAndMaxItems(shortFormProps, widgetRowCircleProps)} />;
	}
	/* tslint:disable-next-line:no-null-keyword */
	return null;
};

export default Story;

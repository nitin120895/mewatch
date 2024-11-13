import * as React from 'react';
import { connect } from 'react-redux';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { SX2SubscriptionPlan as template } from 'shared/page/pageEntryTemplate';

export const CLOSE_BUTTON_SELECTOR = '[data-af-close-button]';
export const CTA_SELECTOR = '[data-af-cta-url]';
const SMART_BANNER_SELECTOR = '.responsive-wrapper';

interface DispatchProps {
	analyticsEvent: (type, payload?) => any;
}

class BannerManager extends React.Component<DispatchProps> {
	// tslint:disable-next-line:no-null-keyword

	constructor(props: DispatchProps) {
		super(props);
	}

	componentDidMount() {
		const { analyticsEvent } = this.props;

		const closeButton = document.querySelector(CLOSE_BUTTON_SELECTOR);
		const ctaButton = document.querySelector(CTA_SELECTOR);

		if (closeButton && ctaButton) {
			setTimeout(() => {
				analyticsEvent(AnalyticsEventType.BANNER_SHOWN);
			}, 500);

			closeButton.addEventListener('click', this.dismissBanner);
			ctaButton.addEventListener('click', this.clickedBanner);
		}

		this.updateBannerHeight();
		window.addEventListener('resize', this.updateBannerHeight);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateBannerHeight);
	}

	private dismissBanner = event => {
		event.stopPropagation();
		const { analyticsEvent } = this.props;
		analyticsEvent(AnalyticsEventType.BANNER_CLOSED);
		this.updateBannerHeight();
	};

	private clickedBanner = event => {
		event.stopPropagation();
		const { analyticsEvent } = this.props;
		analyticsEvent(AnalyticsEventType.BANNER_CLICKED);
		this.updateBannerHeight();
	};

	private updateBannerHeight = () => {
		const smartBannerElement = document.querySelector(SMART_BANNER_SELECTOR);

		if (smartBannerElement) {
			document.documentElement.style.setProperty('--banner-height', `${smartBannerElement.clientHeight}px`);
		} else {
			document.documentElement.style.setProperty('--banner-height', '0px');
		}
	};

	render() {
		// tslint:disable-next-line
		return null;
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, { payload }))
	};
}

const Component: any = connect<undefined, DispatchProps, any>(
	undefined,
	mapDispatchToProps
)(BannerManager);
Component.template = template;

export default Component;

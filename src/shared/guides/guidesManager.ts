import { getItem, setItem } from 'shared/util/localStorage';
import { Account } from 'shared/page/pageKey';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

const GUIDING_TIPS_CACHE_NAME = 'guides';

interface GuidingTipCacheItem {
	pageKey: string;
	action: AnalyticsEventType;
}

export interface GuidingTipScreen {
	title: string;
	description: string;
	image: {
		mobile_p: string;
		mobile_l: string;
		tablet_p: string;
		tablet_l: string;
		desktop: string;
	};
	className?: string;
}

export interface GuidingTip {
	pageKey: string[];
	actions: AnalyticsEventType[];
	screens: GuidingTipScreen[];
}

export class GuidesManager {
	private static instance: GuidesManager;
	private guidesCache: GuidingTipCacheItem[] = getItem(GUIDING_TIPS_CACHE_NAME) || [];

	static getInstance() {
		if (!GuidesManager.instance) GuidesManager.instance = new GuidesManager();

		return GuidesManager.instance;
	}

	private isGuidingTipSeen(pageKey: string, action: AnalyticsEventType) {
		return !!this.guidesCache.find(guidingTip => guidingTip.pageKey === pageKey && guidingTip.action === action);
	}

	private markGuidingTipAsSeen(pageKey: string, action: AnalyticsEventType) {
		this.guidesCache.push({ pageKey, action });
		setItem(GUIDING_TIPS_CACHE_NAME, this.guidesCache);
	}

	private getGuidingTipForPage(pageKey: string, action: AnalyticsEventType): GuidingTip {
		return guidingTipsMap.find(
			guidingTip => guidingTip.pageKey.includes(pageKey) && guidingTip.actions.includes(action)
		);
	}

	shouldShowGuidingTip(pageKey: string, action: AnalyticsEventType): boolean {
		return !!this.getGuidingTipForPage(pageKey, action) && !this.isGuidingTipSeen(pageKey, action);
	}

	getGuidingTip(pageKey: string, action: AnalyticsEventType): GuidingTip {
		if (this.shouldShowGuidingTip(pageKey, action)) {
			this.markGuidingTipAsSeen(pageKey, action);
			return this.getGuidingTipForPage(pageKey, action);
		}
	}
}

export const guidingTipsMap: GuidingTip[] = [
	{
		pageKey: [Account],
		actions: [AnalyticsEventType.PAGE_VIEWED],
		screens: [
			{
				title: '@{guiding_tip_subscriptions_title}',
				description: '@{guiding_tip_subscriptions_body}',
				image: {
					mobile_p: 'mobile-p-subscriptions-manage.png',
					mobile_l: 'mobile-l-subscriptions-manage.png',
					tablet_p: 'tablet-p-subscriptions-manage.png',
					tablet_l: 'tablet-l-subscriptions-manage.png',
					desktop: 'desktop-subscriptions-manage.png'
				},
				className: 'subscriptions-guiding-tip'
			}
		]
	}
];

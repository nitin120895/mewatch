import { Dispatch } from 'redux';
import { getItem as getLocalStorageItem, setItem as setLocalStorageItem } from 'shared/util/localStorage';
import { getItem as getSessionStorageItem, setItem as setSessionStorageItem } from 'shared/util/sessionStorage';
import { Home } from 'shared/page/pageKey';
import { getOnboardingModal } from 'toggle/responsive/component/modal/getOnboardingScreenModal';
import { redirectToSignPage } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { findPageSummary } from 'shared/page/sitemapLookup';
import { get } from 'shared/util/objects';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { GuidesManager } from 'shared/guides/guidesManager';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';

const ONBOARDING_LOCAL_CACHE_NAME = 'onboarding.storage';
const ONBOARDING_SESSION_CACHE_NAME = 'onboarding.session';

interface OnboardingLocalCache {
	showCount: number;
	doNotShowAgain: boolean;
}

interface OnboardingSessionCache {
	wasSeenInThisSession: boolean;
}

const initialOnboardingLocalCache: OnboardingLocalCache = {
	showCount: 0,
	doNotShowAgain: false
};

const initialOnboardingSessionCache: OnboardingSessionCache = {
	wasSeenInThisSession: false
};

class OnboardingManager {
	showOnboardingScreen(dispatch: Dispatch<any>, state: state.Root) {
		if (!this.shouldShowOnboardingScreen(state)) return;
		this.markAsSeen();
		this.showOndoardingScreenModal(state, dispatch);
	}

	private showOndoardingScreenModal(state: state.Root, dispatch: Dispatch<any>) {
		const config = get(state, 'app.config');

		dispatch(
			OpenModal(
				getOnboardingModal({
					onSignin: () => redirectToSignPage(config),
					onDisable: this.markAsDoNotShowAgain,
					closeLabel: '@{carousel_modal_skip|Skip}',
					fullWidth: true
				})
			)
		);

		dispatch(
			analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
				type: 'Page',
				path: '/onboarding'
			})
		);
	}

	private shouldShowOnboardingScreen(state: state.Root): boolean {
		if (typeof window === 'undefined') return false;

		const pathname = get(window, 'location.pathname');
		if (!pathname || _SSR_) return false;

		const localCache = this.getLocalCache();
		const sessionCache = this.getSessionCache();

		const { key } = findPageSummary(pathname, state);
		const maxShowLimit = get(state, 'app.config.general.onboardingIntroScreenViewLimit');
		const guidesManager = GuidesManager.getInstance();

		return (
			key === Home &&
			!guidesManager.shouldShowGuidingTip(key, AnalyticsEventType.PAGE_VIEWED) &&
			isAnonymousUser(state) &&
			!sessionCache.wasSeenInThisSession &&
			!localCache.doNotShowAgain &&
			localCache.showCount < maxShowLimit
		);
	}

	private markAsSeen = () => {
		const localCache = this.getLocalCache();
		const sessionCache = this.getSessionCache();
		localCache.showCount += 1;
		sessionCache.wasSeenInThisSession = true;
		setLocalStorageItem(ONBOARDING_LOCAL_CACHE_NAME, localCache);
		setSessionStorageItem(ONBOARDING_SESSION_CACHE_NAME, sessionCache);
	};

	private markAsDoNotShowAgain = () => {
		const localCache = this.getLocalCache();
		localCache.doNotShowAgain = true;

		setLocalStorageItem(ONBOARDING_LOCAL_CACHE_NAME, localCache);
	};

	private getLocalCache(): OnboardingLocalCache {
		return getLocalStorageItem(ONBOARDING_LOCAL_CACHE_NAME) || initialOnboardingLocalCache;
	}

	private getSessionCache(): OnboardingSessionCache {
		return getSessionStorageItem(ONBOARDING_SESSION_CACHE_NAME) || initialOnboardingSessionCache;
	}
}

export const onboardingManager = new OnboardingManager();

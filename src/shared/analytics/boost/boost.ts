import * as Redux from 'redux';
import { isRegisteredUser } from 'shared/analytics/api/util';
import { getRefreshedMeid } from 'shared/analytics/mixpanel/util';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { getBoostDeviceType } from 'shared/util/deviceUtil';
import { getContentSourceId } from 'shared/util/itemUtils';
import { getItem, removeItem, setItem } from 'shared/util/localStorage';
import { get, isEmptyObject } from 'shared/util/objects';

let store: Redux.Store<state.Root>;

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

export const enum LearnAction {
	Bookmarked = 'bookmark',
	Clicked = 'click',
	EndPlay = 'end_play',
	Onboarding = 'on_boarding',
	StartPlay = 'start_play',
	StopPlay = 'stop_play',
	Subscribed = 'purchase'
}

export const enum ContentSourceId {
	EPG = 1,
	VOD = 2,
	Episode = 101,
	Series = 102
}

const enum LocalStorageKeys {
	REF_USE_CASE = 'refUsecase',
	SOURCE_ID = 'sourceId',
	SELECTED_SUBSCRIBED_ITEM = 'selectedSubscribedItem'
}

const LINEAR_START_PLAY_DEFAULT_DELAY = 4;

export class Boost {
	private static instance: Boost;
	private countryCode: string;
	private isEnabled: boolean;
	private refUsecase: string;
	private sourceId: string;
	private subscribedItem: api.ItemDetail;

	static getInstance() {
		if (!Boost.instance) Boost.instance = new Boost();

		return Boost.instance;
	}

	getLinearContentData(event: TrackingEvent) {
		const scheduleItemId = get(event.context, 'item.scheduleItem.customId');

		return {
			contentItemId: scheduleItemId,
			contentItemInstanceId: scheduleItemId,
			contentSourceId: ContentSourceId.EPG
		};
	}

	getVODContentData(event: TrackingEvent) {
		const item = get(event.context, 'item');
		const { customId } = item;

		return {
			contentItemId: customId,
			contentItemInstanceId: customId,
			contentSourceId: getContentSourceId(item)
		};
	}

	getSubscribeContentData() {
		const { customId } = this.subscribedItem;

		return {
			contentItemId: customId,
			contentItemInstanceId: customId,
			contentSourceId: getContentSourceId(this.subscribedItem)
		};
	}

	learnAction(event: TrackingEvent, action: LearnAction, customData: {}) {
		const isBoostEnabled = this.isEnabled || this.checkBoostEnabled();
		if (!isBoostEnabled) return;

		const actionUrl = this.getActionUrl(event, action);
		const actionData = {
			...this.getGenericActionData(event, action),
			...customData
		};

		if (!isEmptyObject(actionData)) {
			fetch(actionUrl, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(actionData)
			});
		}
	}

	learnActionStartPlayLinear(event: TrackingEvent) {
		// Send LA only after N minutes of pre-start zone delay
		const state = store.getState();
		const delayInMin =
			get(state.app, 'config.general.customFields.BoostLinearStartPlaySendDelayMinute') ||
			LINEAR_START_PLAY_DEFAULT_DELAY;
		const delayInMs = delayInMin * 60 * 1000;
		const startPlayTimer = setTimeout(() => {
			const contentData = this.getLinearContentData(event);
			this.learnAction(event, LearnAction.StartPlay, contentData);
		}, delayInMs);

		return startPlayTimer;
	}

	clearCachedValues() {
		this.refUsecase = undefined;
		this.sourceId = undefined;
		this.subscribedItem = undefined;
		removeItem(LocalStorageKeys.REF_USE_CASE);
		removeItem(LocalStorageKeys.SOURCE_ID);
		removeItem(LocalStorageKeys.SELECTED_SUBSCRIBED_ITEM);
	}

	setCachedValues(event: TrackingEvent) {
		const { context, detail } = event;

		// Homepage/IDP rails list context or EOP rails list context
		this.refUsecase = get(context, 'entry.list.refUsecase') || get(detail, 'list.refUsecase');
		this.sourceId = get(context, 'entry.list.sourceId') || get(detail, 'list.sourceId');
		if (this.refUsecase) {
			setItem(LocalStorageKeys.REF_USE_CASE, this.refUsecase);
		}
		if (this.sourceId) {
			setItem(LocalStorageKeys.SOURCE_ID, this.sourceId);
		}
	}

	setSubscribedItem(event: TrackingEvent) {
		const item = get(event, 'context.item');
		if (item) {
			setItem(LocalStorageKeys.SELECTED_SUBSCRIBED_ITEM, item);
		}
	}

	shouldSendSubscribeLA() {
		/**
		 *	Send Subscribe LA only if action is triggered from a UX7 rail i.e. has cached values
		 *	and if an associated video asset is tied to subscription
		 **/
		this.subscribedItem = getItem(LocalStorageKeys.SELECTED_SUBSCRIBED_ITEM);
		this.refUsecase = getItem(LocalStorageKeys.REF_USE_CASE);
		this.sourceId = getItem(LocalStorageKeys.SOURCE_ID);

		return this.subscribedItem && (this.refUsecase || this.sourceId);
	}

	private checkBoostEnabled() {
		const state = store.getState();
		const isBoostEnabled = get(state.app, 'config.general.customFields.FeatureToggle.boostLearnAction.web.enabled');
		this.isEnabled = isBoostEnabled === true;

		return this.isEnabled;
	}

	private getGenericActionData(event: TrackingEvent, action: LearnAction) {
		const countryCode = this.countryCode || this.getCountryCode();
		const actionTime = Math.floor(Date.now() / 1000);

		const actionData: LearnActionData = {
			actionTime,
			countryCode,
			deviceType: getBoostDeviceType(),
			tz: Intl.DateTimeFormat().resolvedOptions().timeZone
		};

		const isVideoLearnAction = [LearnAction.StartPlay, LearnAction.StopPlay, LearnAction.EndPlay].includes(action);
		if (isVideoLearnAction) {
			const language = get(event, 'detail.playedAudioLang.lang');
			if (language) actionData.language = language;
		}

		if (this.refUsecase) actionData.refUsecase = this.refUsecase;
		if (this.sourceId) actionData.sourceId = this.sourceId;

		return actionData;
	}

	private getActionUrl(event: TrackingEvent, action: LearnAction) {
		const user = get(event, 'context.user');
		const idParam = isRegisteredUser(user) ? `userId=${user.userId}` : `sessionId=${getRefreshedMeid()}`;
		const baseUrl = process.env.CLIENT_BOOST_URL;
		const token = process.env.CLIENT_BOOST_TOKEN;
		const actionUrl = `${baseUrl}/${action}?token=${token}&${idParam}`;
		const boostEnv = process.env.CLIENT_BOOST_ENV;

		return boostEnv ? `${actionUrl}&env=${boostEnv}` : actionUrl;
	}

	private getCountryCode() {
		const state = store.getState();
		return get(state, 'app.countryCode');
	}
}

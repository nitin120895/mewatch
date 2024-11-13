import * as React from 'react';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import CommonMsgModal from 'ref/tv/component/modal/CommonMsgModal';
import DeviceModel from 'shared/util/platforms/deviceModel';
import * as Locale from 'shared/app/localeUtil';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { getItemRelatedList } from 'shared/service/content';

export class DetailHelper {
	focusNav: DirectionalNavigation;
	account: state.Account;
	profile: state.Profile;
	config: state.Config;
	classification: { [key: string]: api.Classification };
	pageTemplate: string;
	isInChainingPlay = false;

	promptSignIn: () => void;

	private router;
	private removeRouterListener: Function;
	private isHandlingClickWatch = false;
	private curMillSecond = 0;
	private timeoutTimer;
	private timeoutCallback;

	setRouter = router => {
		this.router = router;
		this.removeRouterListener = this.router.listen(this.stopTimeoutTimer);
	};

	dispose = () => {
		this.removeRouterListener();
	};

	onClickWatch = (item: api.ItemSummary, callback: (ret: boolean) => void) => {
		if (!this.isHandlingClickWatch) {
			this.isHandlingClickWatch = true;
		} else {
			callback(false);
		}

		if (!this.profile) {
			// Prompt sign in by active code
			this.promptSignIn();
			callback(false);

			this.focusNav.nextAction = 'watch';
			this.isHandlingClickWatch = false;
			return;
		}

		let isEntitled = canPlay(item);
		const checkDone = canPlay => {
			callback(canPlay);
			this.isHandlingClickWatch = false;
		};

		if (!isEntitled) {
			this.focusNav.showDialog(
				<CommonMsgModal
					captureFocus={true}
					title={''}
					text={'@{no_app_billing|In app billing and registration are not enabled in this application.}'}
					buttons={['@{ok|OK}']}
				/>
			);

			checkDone(false);
		} else {
			checkDone(true);
		}
	};

	getItemRelatedList = (item: api.ItemSummary, callback): api.ItemList => {
		if (item) {
			const { type } = DeviceModel.deviceInfo();
			getItemRelatedList(item.id, {
				maxRating:
					this.profile &&
					this.profile.info &&
					this.profile.info.maxRatingContentFilter &&
					this.profile.info.maxRatingContentFilter.code,
				device: type,
				sub: this.account && this.account.info && this.account.info.subscriptionCode,
				segments: this.account && this.account.info && this.account.info.segments,
				lang: Locale.getSavedLanguagePreference()
			}).then(response => {
				if (response.error) {
					throw 'Get item related list error';
				}

				callback(response.data);
			});
		}
		return undefined;
	};

	initTimeoutTimer = (callback?: () => void) => {
		if (!this.timeoutCallback) {
			this.timeoutCallback = callback;
		}

		if (!this.timeoutTimer) {
			const timeoutMinutesSetting = this.config.playback.chainPlayTimeout;

			if (timeoutMinutesSetting === 0) {
				return;
			}

			this.timeoutTimer = setInterval(() => {
				this.curMillSecond += 1000;

				if (this.curMillSecond / 1000 === timeoutMinutesSetting * 60) {
					this.stopTimeoutTimer(undefined, true);
					this.timeoutCallback && this.timeoutCallback();
				}
			}, 1000);
		}
	};

	private stopTimeoutTimer = (loc: any, forceStop: boolean) => {
		if (forceStop || (this.timeoutTimer && loc && loc.pathname && loc.pathname.indexOf('/watch/') === -1)) {
			clearInterval(this.timeoutTimer);
			this.timeoutTimer = undefined;
			this.curMillSecond = 0;
		}
	};

	resetTimeoutTimer = (callback: () => void) => {
		this.curMillSecond = 0;
		this.stopTimeoutTimer(undefined, true);
		this.initTimeoutTimer();
		callback();
	};

	clearTimeoutCallback = () => {
		this.timeoutCallback = undefined;
	};
}

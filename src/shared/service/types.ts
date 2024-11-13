/** @module types */
// Auto-generated, edits will be overwritten

namespace api {
	export interface AccessToken {
		/**
		 * The token value used for authenticated requests.
		 */
		value: string;
		/**
		 * True if this token can be refreshed, false if not.
		 */
		refreshable: boolean;
		/**
		 * The timestamp this token expires.
		 */
		expirationDate: Date;
		/**
		 * The type of the token.
		 */
		type: 'Anonymous' | 'UserAccount' | 'UserProfile';
		/**
		 * When a `UserAccount` token is issued during a single-sign-on flow
		 * 	a user may have been automatically registered if they didn't
		 * 	have an account already. If this occurs then `accountCreated`
		 * 	will be `true`.
		 */
		accountCreated?: boolean;
	}

	export interface Account {
		/**
		 * The id of the account.
		 */
		id: string;
		/**
		 * The email address belonging to the account.
		 */
		email: string;
		/**
		 * Whether usage tracking is associated with the account or anonymous.
		 */
		trackingEnabled: boolean;
		/**
		 * When an account level pin is defined this will be true.
		 */
		pinEnabled: boolean;
		/**
		 * Whether the account has opted in or out of marketing material.
		 */
		marketingEnabled: boolean;
		/**
		 * The id of the primary profile.
		 */
		primaryProfileId: string;
		/**
		 * The list of profiles under this account.
		 */
		profiles: ProfileSummary[];
		/**
		 * The download information for this account.
		 */
		downloads: DownloadInfo;
		/**
		 * The address details of the account holder.
		 */
		address?: Address;
		/**
		 * Whether the email address has been verified.
		 *
		 * 	Users who receive an emailed verification url click the link to verify their email address.
		 */
		emailVerified?: boolean;
		/**
		 * The first name of the account holder.
		 */
		firstName?: string;
		/**
		 * The last name of the account holder.
		 */
		lastName?: string;
		/**
		 * The date of birth of the account holder
		 */
		dateOfBirth?: Date;
		/**
		 * The age group of the account holder.
		 * 	A: age >= 21
		 * 	B: age from 18 to 20
		 * 	C: age from 16 to 17
		 * 	D: age < 16
		 * 	E: not specified
		 */
		ageGroup?: string;
		/**
		 * The gender of the account holder
		 */
		gender?: 'female' | 'male' | 'preferNotToSay';
		/**
		 * The marital status of the account holder. Needs to be selected from a list of available marital statuses in `/config` endpoint.
		 */
		maritalStatus?: string;
		/**
		 * The income of the account holder. Needs to be selected from a list of available incomes in `/config` endpoint.
		 */
		income?: string;
		/**
		 * The occupation of the account holder. Needs to be selected from a list of available occupations in `/config` endpoint.
		 */
		occupation?: string;
		/**
		 * The nationality of the account holder. Needs to be selected from a list of available nationalities in `/config` endpoint.
		 */
		nationality?: string;
		/**
		 * The ethnicity of the account holder. Needs to be selected from a list of available ethnicities in `/config` endpoint.
		 */
		ethnicity?: string;
		/**
		 * The home phone of the account holder
		 */
		homePhone?: string;
		/**
		 * The mobile phone of the account holder
		 */
		mobilePhone?: string;
		/**
		 * Whether the account has used up their free trial period of a plan.
		 */
		usedFreeTrial?: boolean;
		/**
		 * The social provider used for sign in.
		 */
		socialProvider?: 'google' | 'facebook' | 'apple';
		/**
		 * The classification rating defining the minimum rating level a user should be
		 * 	forced to enter the account pin code for playback. Anything at this rating
		 * 	level or above will require the pin for playback.
		 *
		 * 	e.g. AUOFLC-MA15+
		 *
		 * 	If you want to disable this guard pass an empty string or `null`.
		 */
		minRatingPlaybackGuard?: string;
		/**
		 * The ID of the profile to be updated
		 */
		profileId?: string;
		/**
		 * The id of the payment method to use by default for account transactions.
		 */
		defaultPaymentMethodId?: string;
		/**
		 * The id of the payment instrument to use by default for account transactions.
		 *
		 * 	 **DEPRECATED** The property `defaultPaymentMethodId` is now preferred.
		 */
		defaultPaymentInstrumentId?: string;
		/**
		 * The list of subscriptions, if any, the account has signed up to.
		 */
		subscriptions?: Subscription[];
		/**
		 * The active subscription code for an account.
		 *
		 * 	The value of this should be passed to any endpoints accepting a `sub` query parameter.
		 */
		subscriptionCode?: string;
		/**
		 * The list of entitlements to playback specific items.
		 */
		entitlements?: Entitlement[];
		/**
		 * The meRewards information for this account.
		 */
		rewards?: RewardsInfo;
		/**
		 * The segments an account has been placed under
		 */
		segments?: string[];
	}

	export interface AccountDevices {
		/**
		 * The array of registered playack devices.
		 */
		devices: Device[];
		/**
		 * The maximum number of playback devices that can be registered
		 * 	under an account at a single time.
		 *
		 * 	If there is no maximum defined this value will be `-1`.
		 */
		maxRegistered: number;
		/**
		 * Defines the start and end date of the current registration window along with calculated limits.
		 *
		 * 	If undefined then there are no registration limits for a period.
		 *
		 * 	For example given a registration period of 30 days, this sliding window will start on the
		 * 	oldest registration of the last 30 days, and end 30 days from that registration date.
		 *
		 * 	In this window there is a limit on how many devices can be registered in 30 days.
		 * 	If exceeded then no more devices can be registered unless one is deregistered or the
		 * 	oldest registration drops off the 30 day window.
		 *
		 * 	Deregistration also has potential limits which may prevent a device being deregistered.
		 * 	In this case the user must wait until the oldest deregistered device is more than 30
		 * 	days old.
		 */
		registrationWindow?: DeviceRegistrationWindow;
		/**
		 * Defines the start and end date of the current deregistration window along with calculated limits.
		 *
		 * 	If undefined then there are no deregistration limits for a period.
		 *
		 * 	For example given a deregistration period of 30 days, this sliding window will start on the
		 * 	oldest deregistration of the last 30 days, and end 30 days from that deregistration date.
		 *
		 * 	In this window there is a limit on how many devices can be deregistered in 30 days.
		 * 	If exceeded then no more devices can be deregistered unless the oldest deregistration drops
		 * 	off the 30 day window.
		 */
		deregistrationWindow?: DeviceRegistrationWindow;
	}

	export interface AccountNonce {
		/**
		 * The nonce value.
		 */
		value: string;
	}

	export interface AccountTokenByCodeRequest {
		/**
		 * The unique identifier for the device e.g. serial number.
		 */
		id: string;
		/**
		 * The generated device authorization code.
		 */
		code: string;
	}

	export interface AccountTokenRequest {
		/**
		 * The email associated with the account.
		 */
		email: string;
		/**
		 * The password associated with the account.
		 */
		password: string;
		/**
		 * The scope(s) of the tokens required.
		 * 	For each scope listed an Account and Profile token of that scope will be returned
		 */
		scopes: ('Catalog' | 'Commerce' | 'Settings' | 'Playback')[];
		/**
		 * Device unique identifier
		 */
		deviceId: string;
		/**
		 * If you specify a cookie type then a content filter cookie will be returned
		 * 	along with the token(s). This is only intended for web based clients which
		 * 	need to pass the cookies to a server to render a page based on the user's
		 * 	content filters e.g subscription code.
		 *
		 * 	If type `Session` the cookie will be session based.
		 * 	If type `Persistent` the cookie will have a medium term lifespan.
		 * 	If undefined no cookies will be set.
		 */
		cookieType?: 'Session' | 'Persistent';
	}

	export interface AccountUpdateRequest {
		/**
		 * The address of the account holder.
		 * 	If the address is provided any properties which are omitted from the address will be cleared.
		 */
		address?: Address;
		/**
		 * The first name of the account holder
		 */
		firstName?: string;
		/**
		 * The last name of the account holder
		 */
		lastName?: string;
		/**
		 * The date of birth of the account holder
		 */
		dateOfBirth?: string;
		/**
		 * The gender of the account holder
		 */
		gender?: 'female' | 'male' | 'preferNotToSay';
		/**
		 * The gender of the account holder. Needs to be selected from a list of available marital statuses in `/config` endpoint.
		 */
		maritalStatus?: string;
		/**
		 * The income of the account holder. Needs to be selected from a list of available incomes in `/config` endpoint.
		 */
		income?: string;
		/**
		 * The occupation of the account holder. Needs to be selected from a list of available occupations in `/config` endpoint.
		 */
		occupation?: string;
		/**
		 * The nationality of the account holder. Needs to be selected from a list of available nationalities in `/config` endpoint.
		 */
		nationality?: string;
		/**
		 * The ethnicity of the account holder. Needs to be selected from a list of available ethnicities in `/config` endpoint.
		 */
		ethnicity?: string;
		/**
		 * The home phone of the account holder
		 */
		homePhone?: string;
		/**
		 * The mobile phone of the account holder
		 */
		mobilePhone?: string;
		/**
		 * The segments an account should be placed under
		 */
		segments?: string[];
	}

	export interface AccountUser {
		/**
		 * The id of the account.
		 */
		id?: string;
		/**
		 * The email address belonging to the account.
		 */
		email?: string;
		/**
		 * The first name of the account holder.
		 */
		firstName?: string;
		/**
		 * The last name of the account holder.
		 */
		lastName?: string;
		/**
		 * The date of birth of the account holder
		 */
		dateOfBirth?: Date;
		/**
		 * The age group of the account holder.
		 * 	A: age >= 21
		 * 	B: age from 18 to 20
		 * 	C: age from 16 to 17
		 * 	D: age < 16
		 * 	E: not specified
		 */
		ageGroup?: string;
		/**
		 * The gender of the account holder
		 */
		gender?: 'female' | 'male' | 'preferNotToSay';
	}

	export interface Address {
		/**
		 * The country name or code. Needs to be selected from a list of available countries in `/config` endpoint.
		 */
		country?: string;
		/**
		 * The postal or zip code.
		 */
		postcode?: string;
		building?: string;
		block?: string;
		unit?: string;
		street?: string;
		/**
		 * The city name.
		 */
		city?: string;
	}

	export interface AnonymousTokenRequest {
		/**
		 * Device unique identifier
		 */
		deviceId: string;
		/**
		 * If you specify a cookie type then a content filter cookie will be returned
		 * 	along with the token(s). This is only intended for web based clients which
		 * 	need to pass the cookies to a server to render a page based on the user's
		 * 	content filters e.g subscription code.
		 *
		 * 	If type `Session` the cookie will be session based.
		 * 	If type `Persistent` the cookie will have a medium term lifespan.
		 * 	If undefined no cookies will be set.
		 */
		cookieType?: 'Session' | 'Persistent';
	}

	export interface AppConfig {
		/**
		 * The map of classification ratings.
		 */
		classification?: { [key: string]: Classification };
		subscription?: AppConfigSubscription;
		playback?: AppConfigPlayback;
		general?: AppConfigGeneral;
		navigation?: Navigation;
		sitemap?: PageSummary[];
		display?: AppConfigDisplay;
		i18n?: AppConfigI18n;
		linear?: AppConfigLinear;
		profile?: AppConfigProfile;
		brands?: DeviceBrand[];
		personalisation?: AppConfigPersonalisation;
		advertisment?: AppConfigAdvertisments;
		deeplinking?: AppConfigDeeplinking;
	}

	export interface AppConfigAdvertisments {
		/**
		 * The DFP network code
		 */
		adsNetworkCode: number;
		/**
		 * The MRSS source id
		 */
		adsMRSSId: number;
		/**
		 * Keyword for splash ad request
		 */
		adsSplashAdKeywords?: string;
		/**
		 * Overwrite kid profile ad parameter
		 */
		adsSplashKids?: boolean;
	}

	export interface AppConfigDeeplinking {
		/**
		 * The Android application package name.
		 */
		androidAppPackageName: string;
		/**
		 * The Android application fingerprint.
		 */
		androidAppFingerprint: string;
		/**
		 * iOS application ID.
		 */
		universalLinkAppID: string;
		/**
		 * iOS application paths.
		 */
		universalLinkPaths: string;
		/**
		 * Android Excluded paths.
		 */
		androidExcludedPaths: string[];
	}

	export interface AppConfigDisplay {
		/**
		 * An array of globally configured themes.
		 */
		themes: Theme[];
	}

	export interface AppConfigGeneral {
		/**
		 * List of default segmentation tags
		 */
		defaultSegmentationTags: string[];
		/**
		 * Download expiration time in days.
		 */
		downloadExpirationTimeInDays: number;
		/**
		 * The url of the primary website.
		 */
		websiteUrl?: string;
		/**
		 * A Google Analytics token to track applicaton user events.
		 */
		gaToken?: string;
		/**
		 * The public Stripe key to use for payment transactions.
		 */
		stripeKey?: string;
		/**
		 * The Facebook application id associated with an environment.
		 */
		facebookAppId?: string;
		/**
		 * A map of default item image types where the key is the item types.
		 */
		itemImageTypes?: { [key: string]: string };
		/**
		 * The currency code to target.
		 */
		currencyCode?: string;
		/**
		 * A map of custom configuration fields.
		 */
		customFields?: { [key: string]: any };
		/**
		 * The maximum value allowed for user ratings.
		 */
		maxUserRating?: number;
		/**
		 * Whether to require sign in for customers to access content.
		 */
		mandatorySignIn?: boolean;
		/**
		 * The default time zone of the site. e.g. "Etc/GMT"
		 */
		defaultTimeZone?: string;
		/**
		 * List of available audio languages
		 */
		audioLanguages?: Language[];
		/**
		 * List of available subtitle languages
		 */
		subtitleLanguages?: Language[];
		/**
		 * One time password expiration time in minutes.
		 */
		otpExpirationTimeInMinutes?: number;
		/**
		 * Playback token expiration time in minutes.
		 */
		playbackTokenExpirationTimeInMinutes?: number;
		/**
		 * Onboarding intro screen view limit.
		 */
		onboardingIntroScreenViewLimit?: number;
		/**
		 * Upsell screen view limit.
		 */
		upsellScreenViewLimit?: number;
		/**
		 * Upsell screen show frequency.
		 */
		upsellScreenShowFrequency?: number;
		/**
		 * Subscriptions available for IAP in iOS.
		 */
		iosIapSubscriptions?: string[];
	}

	export interface AppConfigI18n {
		/**
		 * An array of available languages.
		 */
		languages: Language[];
	}

	export interface AppConfigLinear {
		/**
		 * Number of available upcoming day schedules.
		 */
		viewingWindowDaysAfter?: number;
		/**
		 * Number of available day schedules in the past.
		 */
		viewingWindowDaysBefore?: number;
		/**
		 * Maximum time in minutes for which channel schedule information can be used without being refreshed
		 */
		scheduleCacheMaxAgeMinutes?: number;
		/**
		 * Offcet between UTC and `defaultTimeZone` in minutes.
		 */
		utcOffsetMinutes?: number;
		/**
		 * True if time in AmPm format
		 */
		useAmPmTimeFormat?: boolean;
		/**
		 * Number of minutes before the application should shows the
		 * 	reminder message for the user
		 */
		epgReminderNotificationOffsetMinutes?: number;
		/**
		 * Upcoming schedule limit for linear player.
		 */
		upcomingScheduleLimit?: number;
	}

	export interface AppConfigPersonalisation {
		/**
		 * Personalisation list ID for normal profiles
		 */
		personalisationGenreListId?: string;
		/**
		 * Personalisation list ID for kids profiles
		 */
		personalisationGenreListIdForKids?: string;
		/**
		 * cXense Widget Id for end of playback related items row.
		 */
		relatedItemWidgetId?: string;
		/**
		 * Zoom Widget Id for end of playback related items row on web.
		 */
		zoomWidgetIdWeb?: string;
		/**
		 * Zoom Widget Id for end of playback related items row on mobile.
		 */
		zoomWidgetIdMobile?: string;
		/**
		 * Zoom Widget Id for end of playback related items row on tv.
		 */
		zoomWidgetIdTv?: string;
	}

	export interface AppConfigPlayback {
		/**
		 * How often a heartbeat should be renewed during playback.
		 */
		heartbeatFrequency: number;
		/**
		 * An array of percentage points in which to fire off plabyack view events.
		 * 	For example a value of 0.5 would indicate that an event should be
		 * 	fired when the user is half way through the video.
		 * 	Often known as quartiles when four equaly spread event points.
		 */
		viewEventPoints: number[];
		/**
		 * The number of seconds before the end of playback when the current video
		 * 	should be minimized and user options are presented within the video player.
		 *
		 * 	If set to 0 there will be no squeezeback.
		 */
		chainPlaySqueezeback: number;
		/**
		 * The number of minutes of user inactivity before autoplay is paused.
		 *
		 * 	If set to 0 there will be no autoplay timeout.
		 */
		chainPlayTimeout: number;
		/**
		 * The number of seconds before autoplay of next video.
		 *
		 * 	If set to 0 there will be no autoplay.
		 */
		chainPlayCountdown: number;
		/**
		 * Kaltura base url for providing thumbnail images for playback
		 */
		kalturaThumbnailBaseUrl: string;
		/**
		 * The number of seconds before the watch credits CTA is dismissed.
		 *
		 * 	If set to 0 there will be no watch credits CTA.
		 */
		watchCreditsCtaCountdown: number;
		/**
		 * The number of seconds before the Skip Intro CTA is dismissed.
		 *
		 * 	If set to 0 the Skip Intro CTA will appear during the whole intro.
		 */
		skipIntroInteractionTimeInSeconds: number;
		/**
		 * Kaltura partner ID for every direct call to Kaltura services:
		 * 	 - hearbeat
		 * 	 - thumbnails
		 */
		kalturaPartnerId?: string;
		/**
		 * Kaltura base url for playback
		 */
		kalturaServiceUrl?: string;
		/**
		 * Kaltura heartbeat url for registering resume position inside Kaltura system
		 * 	and manage playback concurrency
		 */
		kalturaHeartbeatUrl?: string;
	}

	export interface AppConfigProfile {
		/**
		 * Maximum number of follows a profile can have.
		 */
		maxFollowsPerProfile: number;
	}

	export interface AppConfigSubscription {
		/**
		 * The available public plans a user can subscribe to.
		 */
		plans?: Plan[];
		/**
		 * The prime plan ids.
		 */
		primePricePlanIds?: string[];
	}

	export interface AutomaticSignIn {
		/**
		 * Url for automatic signin.
		 */
		url: string;
	}

	export interface Bookmark {
		/**
		 * The id of the item bookmarked.
		 */
		itemId: string;
		/**
		 * The date the bookmark was created.
		 */
		creationDate: Date;
	}

	export interface BookmarkListDataExpansion {
		/**
		 * The number of unwatched episodes.
		 */
		unwatchedEpisodes?: number;
	}

	/**
	 * List data for Bookmark List
	 */
	export interface BookmarksListData {
		/**
		 * Object where keys are itemIds for the items in the list and values are objects
		 * 	containing additional information of items like number of unwatchted episodes.
		 */
		itemInclusions?: { [key: string]: BookmarkListDataExpansion };
	}

	/**
	 * A pageable list of items.
	 */
	export interface BoostItemList {
		/**
		 * The id of this list
		 */
		id: string;
		/**
		 * The path of this list
		 */
		path: string;
		/**
		 * The total size of the list
		 */
		size: number;
		/**
		 * A list of items
		 */
		items: ItemSummary[];
		/**
		 * Metadata describing how to load the next or previous page of the list
		 */
		paging: Pagination;
		/**
		 * The title of this list
		 */
		title?: string;
		/**
		 * The Source Id of the recommendation
		 */
		sourceId?: string;
		/**
		 * The reference use case of the recommendation
		 */
		refUsecase?: string;
		/**
		 * The Series Title of the recommendation
		 */
		seriesTitle?: string;
		/**
		 * The Genre of the recommendation
		 */
		Genre?: string;
		/**
		 * The types of items in the list
		 */
		itemTypes?: (
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit')[];
	}

	export interface ChangeCreditCardRequest {
		/**
		 * External Id of existing payment method
		 */
		externalId: string;
	}

	export interface ChangeCreditCardResult {
		sessionId?: string;
		sessionData?: string;
	}

	export interface ChangePasswordRequest {
		/**
		 * Current account password.
		 */
		currentPassword: string;
		/**
		 * The new password for the account.
		 */
		newPassword: string;
	}

	export interface ChangePinRequest {
		/**
		 * The new pin to set.
		 */
		pin: string;
	}

	export interface Classification extends ClassificationSummary {
		/**
		 * The level of this classification when compared with its siblings.
		 * 	A higher level means a greater restriction.
		 * 	Each classification in a system should have a unique level.
		 */
		level: number;
		/**
		 * The parent system code of the classification.
		 */
		system: string;
		images: { [key: string]: string };
		/**
		 * Parental advisort text.
		 */
		advisoryText?: string;
	}

	export interface ClassificationSummary {
		/**
		 * The unique code for a classification.
		 */
		code: string;
		/**
		 * The name of the classification for display.
		 */
		name: string;
	}

	/**
	 * List data for ContinueWatching List
	 */
	export interface ContinueWatchingListData {
		/**
		 * Object where keys are itemIds for the items in the list and values are objects
		 * 	containing additional items (either episode/season/show) that were requested
		 * 	in the "include" query option.
		 *
		 * 	For example if you request the ContinueWatching list with "season" items in
		 * 	the list, you can specify `include=episode` and then the specific next episode
		 * 	will be returned in this object.
		 */
		itemInclusions?: { [key: string]: ContinueWatchingListDataExpansion };
	}

	export interface ContinueWatchingListDataExpansion {
		episode?: ItemSummary;
		season?: ItemSummary;
		show?: ItemSummary;
	}

	export interface CountryCode {
		/**
		 * Country Code of anonymous or logged in user
		 */
		code: string;
	}

	export interface Credit extends Person {
		/**
		 * The type of role the credit performed, e.g. actor.
		 */
		role:
			| 'actor'
			| 'associateproducer'
			| 'coactor'
			| 'director'
			| 'executiveproducer'
			| 'filminglocation'
			| 'guest'
			| 'narrator'
			| 'other'
			| 'presenter'
			| 'producer'
			| 'productmanager'
			| 'thememusicby'
			| 'voice'
			| 'writer';
		/**
		 * The name of the character.
		 */
		character?: string;
	}

	export interface DeleteCreditCardRequest {
		/**
		 * Id of existing payment method
		 */
		paymentMethodId: string;
	}

	export interface DeleteCreditCardResult {
		result?: boolean;
		executionTime?: number;
	}

	export interface Device {
		/**
		 * The unique identifier for this device e.g. serial number.
		 */
		id: string;
		/**
		 * The human recognisable name for this device.
		 */
		name: string;
		/**
		 * The date this device was registered.
		 */
		registrationDate: Date;
		/**
		 * Device brand identifier.
		 */
		brandId: number;
	}

	export interface DeviceAuthorizationCode {
		/**
		 * The generated device authorization code.
		 */
		code: string;
	}

	export interface DeviceAuthorizationCodeRequest {
		/**
		 * The unique identifier for this device e.g. serial number.
		 */
		id: string;
		/**
		 * Device brand identifier.
		 */
		brandId: number;
	}

	export interface DeviceAuthorizationRequest {
		/**
		 * The generated device authorization code.
		 */
		code: string;
		/**
		 * A human recognisable name for this device.
		 */
		name: string;
	}

	export interface DeviceBrand {
		/**
		 * Device brand identifier.
		 */
		id: number;
		/**
		 * Device brand name.
		 */
		name: string;
		/**
		 * Device family name.
		 */
		family?: string;
	}

	export interface DeviceRegistrationRequest {
		/**
		 * The unique identifier for this device e.g. serial number.
		 */
		id: string;
		/**
		 * A human recognisable name for this device.
		 */
		name: string;
		/**
		 * Device brand identifier.
		 */
		brandId: number;
	}

	export interface DeviceRegistrationWindow {
		/**
		 * The number of days a de/registration period runs for.
		 */
		periodDays: number;
		/**
		 * The maximum de/registrations that can be made in a period.
		 */
		limit: number;
		/**
		 * The remaining de/registrations that can be made in the current period.
		 */
		remaining: number;
		/**
		 * The start date of the current period.
		 *
		 * 	This is based on the earliest device de/registrations in the past N days, where
		 * 	N is defined by `periodDays`.
		 *
		 * 	If no device has been de/registered then start date will be from the current date.
		 */
		startDate: Date;
		/**
		 * The end date of the current period.
		 *
		 * 	This is based on the value of `startDate` plus the number of days defined by  `periodDays`.
		 */
		endDate: Date;
	}

	export interface DownloadInfo {
		/**
		 * The number of distinct assets downloaded this month.
		 */
		numberOfDownloads: number;
		/**
		 * The maximum number of distinct assets that can be downloaded per month.
		 *
		 * 	This information is returned only when there is a limit set for this account.
		 */
		monthlyLimit?: number;
	}

	export interface Entitlement extends OfferRights {
		/**
		 * The date of activation. If no date is defined the entitlement has not be activated.
		 */
		activationDate?: Date;
		/**
		 * The date the entitlement expires.
		 */
		expirationDate?: Date;
		/**
		 * The date the entitlement was created.
		 */
		creationDate?: Date;
		/**
		 * How many times the media has been played.
		 */
		playCount?: number;
		/**
		 * How many more downloads of this media are available.
		 */
		remainingDownloads?: number;
		/**
		 * The id of the item this entitlement is for.
		 */
		itemId?: string;
		/**
		 * The type of item this entitlement is for.
		 */
		itemType?:
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit';
		/**
		 * The id of the plan this entitlement is for.
		 */
		planId?: string;
		/**
		 * The duration of the entitled media.
		 */
		mediaDuration?: number;
		/**
		 * The classification of the entitled item.
		 */
		classification?: ClassificationSummary;
	}

	/**
	 * Defines playback exclusion rules for an Offer or Entitlement.
	 */
	export interface ExclusionRule {
		description?: string;
		/**
		 * The device type that the exclusion rules apply to.
		 */
		device?: string;
		/**
		 * Prevent airplay from an apple device.
		 */
		excludeAirplay?: boolean;
		/**
		 * Prevent chromecasting.
		 */
		excludeChromecast?: boolean;
		excludeDelivery?: 'Stream' | 'Download' | 'StreamOrDownload' | 'ProgressiveDownload' | 'None';
		excludeMinResolution?: 'SD' | 'HD-720' | 'HD-1080' | 'HD-4K' | 'VR-360' | 'External' | 'Unknown';
	}

	export interface Follow {
		/**
		 * The id of the item followed.
		 */
		itemId: string;
		/**
		 * The date the followed item was created.
		 */
		creationDate: Date;
	}

	/**
	 * Custom metadata associated with an item.
	 */
	export interface ItemCustomMetadata {
		/**
		 * The name of the custom metadata.
		 */
		name: string;
		/**
		 * The value of the custom metadata.
		 */
		value: string;
	}

	export interface ItemDetail extends ItemSummary {
		/**
		 * Advisory text about this item, related to the classification
		 */
		advisoryText?: string;
		/**
		 * An array of categories of this item.
		 */
		categories?: string[];
		/**
		 * The live channel number.
		 */
		channelNumber?: number;
		/**
		 * Copyright information about this item
		 */
		copyright?: string;
		/**
		 * The distributor of this item.
		 */
		distributor?: string;
		/**
		 * The description of this item.
		 */
		description?: string;
		/**
		 * An ordered list of custom name-value-pair item metadata.
		 *
		 * 	Usually displayed on an item detail page.
		 */
		customMetadata?: ItemCustomMetadata[];
		/**
		 * An array of genre paths mapping to the values within the `genres` array from ItemSummary.
		 */
		genrePaths?: string[];
		/**
		 * The optional location (e.g. city) of an event.
		 * 	Specific to Program and Event item types.
		 */
		location?: string;
		/**
		 * The optional venue of an event.
		 * 	Specific to Program and Event item types.
		 */
		venue?: string;
		/**
		 * The optional date of an event.
		 * 	Specific to a Program item type.
		 */
		eventDate?: Date;
		/**
		 * A list of credits associated with this item.
		 */
		credits?: Credit[];
		/**
		 * A list of seasons associated with this item.
		 */
		seasons?: ItemList;
		/**
		 * A list of episodes associated with this item.
		 */
		episodes?: ItemList;
		/**
		 * The season associated with this item.
		 */
		season?: ItemDetail;
		/**
		 * The season associated with this item.
		 */
		show?: ItemDetail;
		/**
		 * An array of segmentation tags of this item.
		 */
		segments?: string[];
		/**
		 * The total number of users who have rated this item.
		 */
		totalUserRatings?: number;
		/**
		 * A list of trailers associated with this item.
		 */
		trailers?: ItemSummary[];
		/**
		 * A list of extras associated with this item.
		 */
		extras?: ItemSummary[];
		/**
		 * A list of similar content.
		 */
		similar?: ItemSummary[];
	}

	/**
	 * A pageable list of items.
	 */
	export interface ItemList {
		/**
		 * The id of this list
		 */
		id: string;
		/**
		 * The path of this list
		 */
		path: string;
		/**
		 * The total size of the list
		 */
		size: number;
		/**
		 * A list of items
		 */
		items: ItemSummary[];
		/**
		 * Metadata describing how to load the next or previous page of the list
		 */
		paging: Pagination;
		/**
		 * The title of this list
		 */
		title?: string;
		/**
		 * A full description of this list.
		 */
		description?: string;
		/**
		 * A short description of this list.
		 */
		shortDescription?: string;
		/**
		 * The tagline of the item.
		 */
		tagline?: string;
		/**
		 * The types of items in the list
		 */
		itemTypes?: (
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit')[];
		/**
		 * Available audio languages in the list
		 */
		itemAudioLanguages?: string[];
		/**
		 * Available genres in the list
		 */
		itemGenres?: string[];
		listMeta?: any;
		images?: { [key: string]: string };
		/**
		 * If this list is parameterized, then this contains the parameter of the list in the format `name:value`.
		 * 	For example the Movies Genre list will take a parameter `genre` with a given value. e.g. `genre:action` or `genre:drama`.
		 */
		parameter?: string;
		/**
		 * A map of custom fields defined by a curator for a list.
		 */
		customFields?: { [key: string]: any };
		themes?: Theme[];
		/**
		 * Extra data needed for the specific list. The format and content will change
		 * 	depending on the list
		 */
		listData?: ListData;
	}

	export interface ItemPurchase {
		/**
		 * The identifier of the purchased item.
		 */
		id: string;
		/**
		 * The ownership of the purchased item.
		 */
		ownership: 'Subscription' | 'Free' | 'Rent' | 'Own' | 'None';
		/**
		 * The resolution of the purchased item.
		 */
		resolution: 'SD' | 'HD-720' | 'HD-1080' | 'HD-4K' | 'VR-360' | 'External' | 'Unknown';
		/**
		 * The title of the purchased item.
		 */
		title: string;
		/**
		 * The type of item purchased.
		 */
		type:
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit';
	}

	/**
	 * Contains related items grouped by relationship type key
	 */
	export interface ItemRelationship {
		key: string;
		items: ItemSummary[];
	}

	export interface ItemSchedule {
		id: string;
		/**
		 * The id of the channel item this schedule belongs to.
		 */
		channelId: string;
		/**
		 * The date and time this schedule starts.
		 */
		startDate: Date;
		/**
		 * The date and time this schedule ends.
		 */
		endDate: Date;
		/**
		 * True if this has been aired previously on the same channel.
		 */
		repeat?: boolean;
		/**
		 * True if this is a live event.
		 */
		live?: boolean;
		/**
		 * True if this is a featured item schedule.
		 */
		featured?: boolean;
		/**
		 * A program asset identifier for this item.
		 */
		customId?: string;
		/**
		 * True if this schedule is gap between programs
		 */
		isGap?: boolean;
		/**
		 * True if this schedule represents time when the channel is completely off air.
		 */
		blackout?: boolean;
		/**
		 * InteractiveType. "0" or "1".
		 */
		InteractiveType?: string;
		/**
		 * InteractiveId.
		 */
		InteractiveId?: string;
		/**
		 * AspectRatio.
		 */
		AspectRatio?: string;
		/**
		 * The item this schedule targets.
		 */
		item?: ScheduleItemSummary;
	}

	export interface ItemScheduleDetail extends ItemSchedule {
		/**
		 * The item this schedule targets.
		 */
		item?: ItemScheduleDetailItem;
	}

	export interface ItemScheduleDetailItem extends ItemDetail {
		/**
		 * The average user rating of associated show.
		 * 	When based on user ratings from our system this will be out of 10.
		 * 	Only valid for episodes.
		 */
		showAverageUserRating?: number;
		/**
		 * The total number of users who have rated this item.
		 * 	Only valid for episodes.
		 */
		showTotalUserRatings?: number;
	}

	export interface ItemScheduleList {
		/**
		 * The id of the channel the schedules belong to.
		 */
		channelId: string;
		/**
		 * The date and time this list of schedules starts.
		 */
		startDate: Date;
		/**
		 * The date and time this list of schedules ends.
		 */
		endDate: Date;
		/**
		 * The list of item schedules.
		 */
		schedules: ItemSchedule[];
	}

	export interface ItemScheduleSummary extends ItemSchedule {
		/**
		 * The item this schedule targets.
		 */
		item?: ItemSummary;
	}

	export interface ItemSummary {
		/**
		 * Unique identifier for an Item
		 */
		id: string;
		/**
		 * The type of item
		 */
		type:
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit';
		/**
		 * The display title of the item.
		 */
		title: string;
		/**
		 * The path to the detail page of this item. Can be used to load the item detail page via the /page endpoint.
		 */
		path: string;
		/**
		 * Subtype of the item. Mainly used to identify different types when `type`
		 * 	is `customAsset`
		 */
		subtype?: string;
		/**
		 * A contextually relative title to display after a parent title.
		 * 	Mostly applicable to Season, Episode and Trailer.
		 */
		contextualTitle?: string;
		/**
		 * A truncated description of the item
		 */
		shortDescription?: string;
		/**
		 * The description of this item.
		 */
		description?: string;
		/**
		 * A list of credits associated with this item.
		 */
		credits?: Credit[];
		/**
		 * The tagline of the item
		 */
		tagline?: string;
		/**
		 * The classification rating of this item.
		 */
		classification?: ClassificationSummary;
		/**
		 * The path to watch this item, if the item is a watchable type, e.g. a `movie`, `program` and `episode`.
		 */
		watchPath?: string;
		/**
		 * The scopes for this item
		 */
		scopes?: string[];
		/**
		 * The year this item was released
		 */
		releaseYear?: number;
		/**
		 * The number of episodes in the season, if the item is a season.
		 */
		episodeCount?: number;
		/**
		 * The number of available episodes in the season, if the item is a season.
		 */
		availableEpisodeCount?: number;
		/**
		 * The number of available seasons in the show, if the item is a show.
		 */
		availableSeasonCount?: number;
		/**
		 * The number of a season, if the item is a season.
		 */
		seasonNumber?: number;
		/**
		 * The index of an episode in the list of all episodes, if the item is an episode.
		 */
		episodeIndex?: number;
		/**
		 * The number of an episode, if the item is an episode.
		 */
		episodeNumber?: number;
		/**
		 * The full name of an episode.
		 */
		episodeName?: string;
		/**
		 * The identifier of the show this item belongs to, if the item is a season or episode.
		 */
		showId?: string;
		showTitle?: string;
		/**
		 * The identifier of the season this item belongs to, if the item is an episode.
		 */
		seasonId?: string;
		/**
		 * The channel short code, if the item is a channel.
		 */
		channelShortCode?: string;
		/**
		 * Whether closed captioning is available.
		 */
		hasClosedCaptions?: boolean;
		/**
		 * The average user rating.
		 * 	When based on user ratings from our system this will be out of 10.
		 */
		averageUserRating?: number;
		/**
		 * The badge this item has.
		 */
		badge?: string;
		/**
		 * The array of genres this item belongs to.
		 */
		genres?: string[];
		/**
		 * The array of sports this item belongs to.
		 */
		sports?: string[];
		/**
		 * The duration of the media in seconds.
		 */
		duration?: number;
		/**
		 * A custom identifier for this item.
		 * 	For example the id for this item under a different content system.
		 */
		customId?: string;
		/**
		 * The optional event start date.
		 * 	Specific to Event item type.
		 */
		eventStartDate?: Date;
		/**
		 * The optional event end date.
		 * 	Specific to Event item type.
		 */
		eventEndDate?: Date;
		/**
		 * The optional broadcast date.
		 */
		firstBroadcastDate?: Date;
		/**
		 * The optional event round.
		 * 	Specific to Event item type.
		 */
		round?: string;
		/**
		 * The optional sequence number for event or stage.
		 * 	Specific to Event and Stage item types.
		 */
		sequenceNumber?: number;
		/**
		 * The optional competition start year
		 * 	Specific to Competition item type
		 */
		yearStart?: number;
		/**
		 * The optional competition end year
		 * 	Specific to Competition item type
		 */
		yearEnd?: number;
		/**
		 * The optional gender.
		 */
		gender?: string;
		/**
		 * The optional country.
		 */
		country?: string;
		/**
		 * The optional role.
		 * 	Specific to Persona, Team item types
		 */
		role?: string;
		/**
		 * The array of available offers for this item.
		 */
		offers?: Offer[];
		images?: { [key: string]: string };
		/**
		 * Gets themes associated with the item
		 */
		themes?: Theme[];
		/**
		 * A map of custom fields defined by a curator for an item.
		 */
		customFields?: { [key: string]: any };
		/**
		 * The related items with this item
		 */
		relationships?: ItemRelationship[];
		/**
		 * Title of an alternate language.
		 */
		secondaryLanguageTitle?: string;
	}

	export interface Language {
		/**
		 * The ISO language code of the language e.g. "en-US".
		 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		 */
		code: string;
		/**
		 * Display label for the language.
		 */
		label: string;
		/**
		 * Display title for the language.
		 */
		title: string;
	}

	/**
	 * Extra data to accompany ItemList content. The (single) key in the object is
	 * 	the list name and the data changes depending on the list
	 */
	export interface ListData {
		ContinueWatching?: ContinueWatchingListData;
		Bookmarks?: BookmarksListData;
		Recommendations?: RecommendationsListData;
		RecommendationsZoom?: RecommendationsListDataZoom;
	}

	export interface MediaFile {
		/**
		 * The id of the media file.
		 */
		id: string;
		/**
		 * The name of the media file.
		 */
		name: string;
		/**
		 * The way in which the media file is delivered.
		 */
		deliveryType: 'Stream' | 'Progressive' | 'Download';
		/**
		 * The url to access the media file.
		 */
		url: string;
		/**
		 * The type of drm used to encrypt the media. 'None' if unencrypted.
		 */
		drmScheme: 'PLAYREADY_CENC' | 'WIDEVINE_CENC' | 'FAIRPLAY' | 'WIDEVINE' | 'PLAYREADY' | 'CUSTOM_DRM' | 'NONE';
		/**
		 * The format the media was encoded in.
		 */
		format: string;
		/**
		 * The resolution of the video media.
		 */
		resolution: 'SD' | 'HD-720' | 'HD-1080' | 'HD-4K' | 'VR-360' | 'External' | 'Unknown';
		/**
		 * The language code for the media, e.g. 'en'.
		 */
		language: string;
		/**
		 * The type of drm used to encrypt the media. 'None' if unencrypted.
		 */
		drm?: string;
		/**
		 * The base 64 encoded certificate for fair play drm validation.
		 */
		certificate?: string;
		/**
		 * The width of the video media.
		 */
		width?: number;
		/**
		 * The height of the video media.
		 */
		height?: number;
		/**
		 * The number of audio channels.
		 */
		channels?: number;
		/**
		 * A map of subtitles, where key is language and value is related url.
		 */
		subtitles?: any;
		/**
		 * List of subtitles with additional properties.
		 */
		subtitlesCollection?: MediaFileSubtitle[];
		/**
		 * A bumper video url for external providers.
		 */
		bumper?: string;
	}

	export interface MediaFileSubtitle {
		/**
		 * The url where subtitles can be accessed.
		 */
		url: string;
		/**
		 * The ISO 639-1 language code.
		 */
		languageCode: string;
		/**
		 * The ISO language name.
		 */
		language: string;
	}

	export interface NavContent {
		/**
		 * The title of the embedded navigation content.
		 */
		title?: string;
		/**
		 * An embedded list.
		 */
		list?: ItemList;
		/**
		 * The image type to target when rendering items of the list.
		 *
		 * 	e.g wallpaper, poster, hero3x1, logo.
		 */
		imageType?: string;
	}

	export interface NavEntry {
		/**
		 * The depth of the NavEntry (top level is 0)
		 */
		depth: number;
		/**
		 * The text label for this nav entry.
		 */
		label?: string;
		/**
		 * The identifier of the icon to be displayed.
		 */
		icon?: string;
		/**
		 * The id of the page.
		 */
		pageId?: string;
		/**
		 * The path this nav entry links to.
		 * 	May be undefined if the nav entry is not clickable e.g. a nav heading.
		 * 	If the value begins with `http` then it's an external url.
		 */
		path?: string;
		/**
		 * Embedded content to display in a navigation menu.
		 */
		content?: NavContent;
		/**
		 * Child nav entries.
		 */
		children?: NavEntry[];
		/**
		 * True if this is a featured menu item.
		 *
		 * 	Featured menu items may have a more prominent presentation than others in the navigation.
		 */
		featured?: boolean;
		/**
		 * This is for special navigation entries like meRewards.
		 */
		type?:
			| 'RewardPoints'
			| 'RewardCashback'
			| 'RewardTransactions'
			| 'RewardSurvey'
			| 'RewardCoupons'
			| 'RewardSection';
		/**
		 * A map of custom fields defined by a curator for a nav entry.
		 */
		customFields?: { [key: string]: any };
	}

	export interface Navigation {
		/**
		 * The header navigation.
		 */
		header: NavEntry[];
		/**
		 * The footer navigation.
		 */
		footer?: NavEntry;
		/**
		 * The account navigation.
		 */
		account?: NavEntry;
		/**
		 * The mobile navigation.
		 */
		mobile?: NavEntry;
		/**
		 * Copyright information.
		 */
		copyright?: string;
		/**
		 * A map of custom fields defined by a curator for navigation.
		 */
		customFields?: { [key: string]: any };
		/**
		 * The social links.
		 */
		socialLinks?: SocialLinkEntry[];
	}

	export interface Newsletter {
		/**
		 * The short code of the newsletter
		 */
		shortCode: string;
		/**
		 * Whether the user is subscribed to the newsletter
		 */
		subscribed: boolean;
		/**
		 * The name of the newsletter
		 */
		name?: string;
		/**
		 * The description of the newsletter
		 */
		description?: string;
		/**
		 * Whether the user can subscribe to the newsletter
		 */
		canSubscribe?: boolean;
		/**
		 * The newsletter classification.
		 */
		classification?: string;
	}

	export interface NewslettersSubscriptionRequest {
		/**
		 * The newsletter to subscribe/unsubscribe to
		 */
		newsletters: Newsletter[];
	}

	export interface NextPlaybackItem {
		/**
		 * The id of the item used to determine the next item to play.
		 */
		sourceItemId: string;
		/**
		 * Time when the item corresponding to the itemId passed in by the client was
		 * 	first watched by the user. Will be `undefined` if the user has never
		 * 	watched the item.
		 *
		 * 	It can be used to identify the scenario where the user has never watched a
		 * 	show and we are suggesting they watch the first episode (i.e. it is
		 * 	missing in this scenario)
		 *
		 * 	**This will only be populated when a `showId` is passed in**
		 */
		firstWatchedDate?: Date;
		/**
		 * Time when the item corresponding to the itemId passed in by the client was
		 * 	last watched by the user. Will be `undefined` if the user has never
		 * 	watched the item.
		 *
		 * 	It can be used to identify the scenario where the user has never watched a
		 * 	show and we are suggesting they watch the first episode (i.e. it is
		 * 	missing in this scenario)
		 *
		 * 	**This will only be populated when a `showId` is passed in**
		 */
		lastWatchedDate?: Date;
		/**
		 * Field indicating the type or reason behind the suggestion.
		 *
		 * 	Id Type   | Show Watched Status| Value            | Description
		 * 	----------|--------------------|------------------|---------------------------------
		 * 	showId    | Unwatched          | StartWatching    |
		 * 	showId    | Completely watched | RestartWatching  |
		 * 	showId    | Partly watched     | ContinueWatching | Suggested episode partly watched
		 * 	showId    | Partly watched     | Sequential       | Suggested episode unwatched
		 * 	episodeId | Any                | Sequential       | Next episode in show
		 */
		suggestionType?: 'StartWatching' | 'ContinueWatching' | 'RestartWatching' | 'Sequential' | 'None';
		/**
		 * The details of the next item to play.
		 *
		 * 	If `undefined` then no item was found.
		 */
		next?: ItemDetail;
	}

	export interface Offer extends OfferRights {
		price: number;
		availability: 'Available' | 'ComingSoon';
		id?: string;
		name?: string;
		startDate?: Date;
		endDate?: Date;
		/**
		 * The code of the subscription this offer is offered under, if any.
		 */
		subscriptionCode?: string;
		/**
		 * A map of custom fields defined by a curator for an offer.
		 */
		customFields?: { [key: string]: any };
	}

	/**
	 * The base type for both Offer and Entitlement.
	 */
	export interface OfferRights {
		deliveryType: 'Stream' | 'Download' | 'StreamOrDownload' | 'ProgressiveDownload' | 'None';
		scopes: string[];
		resolution: 'SD' | 'HD-720' | 'HD-1080' | 'HD-4K' | 'VR-360' | 'External' | 'Unknown';
		ownership: 'Subscription' | 'Free' | 'Rent' | 'Own' | 'None';
		/**
		 * The maximum number of allowed plays.
		 */
		maxPlays?: number;
		/**
		 * The maximum number of allowed downloads.
		 */
		maxDownloads?: number;
		/**
		 * The length of time in minutes which the rental will last once purchased.
		 */
		rentalPeriod?: number;
		/**
		 * The length of time in minutes which the rental will last once played for the first time.
		 */
		playPeriod?: number;
		/**
		 * Any specific playback exclusion rules.
		 */
		exclusionRules?: ExclusionRule[];
	}

	export interface Page extends PageSummary {
		/**
		 * Entries of a page
		 */
		entries: PageEntry[];
		metadata?: PageMetadata;
		/**
		 * A map of custom fields defined by a curator for a page.
		 */
		customFields?: { [key: string]: any };
		/**
		 * When the page represents the detail of an item this property will contain the item detail.
		 *
		 * 	For clients consuming an item detail page, any page row entry of type `ItemDetailEntry`
		 * 	should look to obtain its data from the contents of this property.
		 *
		 * 	*Note that you have to be using feature flag `idp` to enable this
		 * 	on item detail pages. See `feature-flags.md` for further details.*
		 */
		item?: ItemDetail;
		/**
		 * When the page represents the detail of a List this property will contain the list in question.
		 *
		 * 	For clients consuming a list detail page, any page row entry of type `ListDetailEntry`
		 * 	should look to obtain its data from the contents of this property.
		 *
		 * 	*Note that you have to be using feature flag `ldp` to enable this
		 * 	on list detail pages. See `feature-flags.md` for further details.*
		 */
		list?: ItemList;
		themes?: Theme[];
	}

	/**
	 * Represents an entry of a Page.
	 * 	Defines what specific piece of content should be presented e.g. an Item or ItemList.
	 * 	Also defines what visual template should be used to render that content.
	 */
	export interface PageEntry {
		/**
		 * The unique identifier for a page entry.
		 */
		id: string;
		/**
		 * The type of PageEntry. Used to help identify what type of content will be presented.
		 */
		type:
			| 'ItemEntry'
			| 'ItemDetailEntry'
			| 'ListEntry'
			| 'PlanEntry'
			| 'ListDetailEntry'
			| 'UserEntry'
			| 'TextEntry'
			| 'ImageEntry'
			| 'CustomEntry'
			| 'PeopleEntry';
		/**
		 * The name of the Page Entry.
		 */
		title: string;
		/**
		 * Template type used to present the content of the PageEntry.
		 */
		template: string;
		listMeta?: any;
		/**
		 * If 'type' is 'ItemEntry' then this is the item to be represented.
		 */
		item?: ItemSummary;
		/**
		 * If 'type' is 'ListEntry' or 'UserEntry' then this is the list to be represented.
		 */
		list?: ItemList;
		/**
		 * If 'type' is 'PlanEntry' then this is the subscription plan to be represented.
		 */
		plan?: SubscriptionPlan;
		/**
		 * If 'type' is 'TextEntry' then this is the text to be represented.
		 */
		text?: string;
		/**
		 * If 'type' is 'PeopleEntry' then this is the array of people to present.
		 */
		people?: Person[];
		/**
		 * A map of custom fields defined by a curator for a page entry.
		 */
		customFields?: { [key: string]: any };
		/**
		 * The images for the page entry if any.
		 *
		 * 	For example the images of an `ImageEntry`.
		 */
		images?: { [key: string]: string };
	}

	/**
	 * Metadata associated with a page. Primarily intended for SEO usage.
	 */
	export interface PageMetadata {
		description?: string;
		keywords?: string[];
	}

	export interface PageSummary {
		/**
		 * Unique identifier for the page.
		 */
		id: string;
		/**
		 * Title of the page.
		 */
		title: string;
		/**
		 * Unique path for the page.
		 */
		path: string;
		/**
		 * Identifier for of the page template to render this page.
		 */
		template: string;
		/**
		 * True if this page is static and doesn't have any dynamic content to load.
		 *
		 * 	Static pages don't need to go back to the page endpoint to load page content
		 * 	instead the page summary loaded with the sitemap should be enough to determine
		 * 	the page template type and render based on this.
		 */
		isStatic: boolean;
		/**
		 * True if this page is a system page type.
		 *
		 * 	**DEPRECATED** This property doesn't have any real use in client applications
		 * 	anymore so shouldn't be used. It especially shouldn't be used to determine if
		 * 	a page is static or not. Use the `isStatic` property instead.
		 */
		isSystemPage: boolean;
		/**
		 * Key used to lookup a known page.
		 */
		key?: string;
	}

	export interface Pagination {
		/**
		 * The current page number.
		 *
		 * 	A value of 0 indicates that the fist page has not yet been loaded. This is
		 * 	useful when wanting to return the paging metadata to indicate how to
		 * 	load in the first page.
		 */
		page: number;
		/**
		 * The total number of pages available given the current page size.
		 *
		 * 	A value of -1 indicates that the total has not yet been determined. This may
		 * 	arise when embedding secure list pagination info in a page which must be cached
		 * 	by a CDN. For example a Bookmarks list.
		 */
		total: number;
		/**
		 * Path to load next page of data, or null if not available
		 */
		next?: string;
		/**
		 * Path to load previous page of data, or null if not available.
		 */
		previous?: string;
		/**
		 * The current page size.
		 *
		 * 	A value of -1 indicates that the size has not yet been determined. This may
		 * 	arise when embedding secure list pagination info in a page which must be cached
		 * 	by a CDN. For example a Bookmarks list.
		 */
		size?: number;
		/**
		 * The authorization requirements to load a page of items.
		 *
		 * 	This will only be present on lists which are protected by some form
		 * 	of authorization token e.g. Bookmarks, Watched, Entitlements.
		 */
		authorization?: PaginationAuth;
		/**
		 * Any active list sort and filter options.
		 *
		 * 	If an option has a default value then it won't be defined.
		 */
		options?: PaginationOptions;
	}

	export interface PaginationAuth {
		/**
		 * The token type required to load the list.
		 */
		type: 'Anonymous' | 'UserAccount' | 'UserProfile';
		/**
		 * The token scope required.
		 */
		scope: 'Catalog' | 'Commerce' | 'Settings';
	}

	export interface PaginationOptions {
		/**
		 * The number of items to return in a list page.
		 */
		pageSize?: number;
		/**
		 * The applied sort order if any.
		 */
		order?: 'asc' | 'desc';
		/**
		 * The applied sort ordering property if any.
		 */
		orderBy?: 'a-z' | 'release-year' | 'date-added';
		/**
		 * The maximum rating (inclusive) of items returned, e.g. 'AUOFLC-PG'.
		 */
		maxRating?: string;
		/**
		 * Specific item type filter.
		 */
		itemType?:
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit'
			| 'article';
		/**
		 * Specific audio language filter.
		 */
		audioLanguages?: string[];
		/**
		 * Specific genre filter.
		 */
		genres?: string[];
		/**
		 * Items filtered by whether they've been fully watched or not.
		 *
		 * 	Only available on the `/account/profile/watched/list` endpoint currently.
		 */
		completed?: boolean;
	}

	export interface PasswordResetEmailRequest {
		/**
		 * The email address of the primary account profile to reset the password for.
		 */
		email: string;
	}

	export interface PasswordResetRequest {
		/**
		 * The new password for the primary account profile.
		 */
		password: string;
	}

	export interface PaymentMethod {
		/**
		 * The type of payment method.
		 */
		type: 'Card' | 'Telco' | 'Apple' | 'Google' | 'Gift';
		/**
		 * The unique identifier of a payment method.
		 */
		id?: string;
		/**
		 * A short description of a payment method.
		 *
		 * 	If the payment method is of type `Wallet` this will be "My Wallet"
		 *
		 * 	For `Card` type payment methods the format of this description may differ
		 * 	depending on the payment gateway in use. In the case of Stripe, this will
		 * 	be in the format "Visa (**** 4242, exp 08/19)"
		 */
		description?: string;
		/**
		 * The brand of the card if the payment method is a card.
		 */
		brand?: string;
		/**
		 * The balance of the wallet if the payment method is a wallet.
		 */
		balance?: number;
		/**
		 * The currency code of the wallet if the payment method is a wallet.
		 */
		currency?: string;
		/**
		 * The expiry month of the card if the payment method is a card.
		 */
		expiryMonth?: number;
		/**
		 * The expiry year of the card if the payment method is a card.
		 */
		expiryYear?: number;
		/**
		 * The last digits of the card if the payment method is a card.
		 * 	Depending on the payment gateway in use this value may be undefined.
		 */
		lastDigits?: string;
		/**
		 * Indicates whether the payment method has expired.
		 */
		isExpired?: boolean;
		/**
		 * Payment method name
		 */
		name?: string;
		/**
		 * Payment method external id
		 */
		externalId?: string;
	}

	export interface PaymentMethods {
		/**
		 * Indicates whether the user selected remember card for next purchases.
		 */
		rememberCard: boolean;
		/**
		 * The list of available payment methods.
		 */
		paymentMethods: PaymentMethod[];
	}

	export interface Person {
		/**
		 * The name of the person.
		 */
		name: string;
		/**
		 * The path to the person
		 */
		path: string;
	}

	export interface Plan {
		/**
		 * The identifier of a plan.
		 */
		id: string;
		/**
		 * The title of a plan.
		 */
		title: string;
		/**
		 * The short tagline for a plan.
		 */
		tagline: string;
		/**
		 * The type of plan.
		 */
		type: 'Free' | 'Subscription';
		/**
		 * True if a plan should be highlighted as featured, false if not.
		 */
		isFeatured: boolean;
		/**
		 * True if a plan is active, false if its retired.
		 */
		isActive: boolean;
		/**
		 * True if a plan should not be presented in the primary plan options, false if not.
		 */
		isPrivate: boolean;
		/**
		 * The revenue type a plan targets.
		 */
		revenueType: 'TVOD' | 'SVOD';
		/**
		 * The subscription code a plan targets.
		 */
		subscriptionCode: string;
		/**
		 * An alias for a plan.
		 */
		alias: string;
		/**
		 * The list of benefits to display for a plan.
		 */
		benefits: string[];
		/**
		 * The type of billing period used.
		 */
		billingPeriodType: 'day' | 'week' | 'month' | 'year' | 'none';
		/**
		 * Given the `billingPeriodType` this is how frequently it will run. e.g. every 2 weeks.
		 */
		billingPeriodFrequency: number;
		/**
		 * True if a plan has a trial period, false if not.
		 */
		hasTrialPeriod: boolean;
		/**
		 * How many days a trial period runs for a plan. Only valid if `hasTrialPeriod` is true.
		 */
		trialPeriodDays: number;
		/**
		 * The terms and conditions for a plan.
		 */
		termsAndConditions: string;
		/**
		 * The currency a plan is offered in.
		 */
		currency: string;
		/**
		 * The price of a plan. If a free plan then undefined.
		 */
		price?: number;
		/**
		 * A map of custom fields defined by a curator for a plan.
		 */
		customFields?: { [key: string]: any };
	}

	export interface PlanPurchase {
		/**
		 * The title of the purchased plan.
		 */
		title: string;
		/**
		 * The type of plan purchased.
		 */
		type: 'Free' | 'Subscription';
		/**
		 * The identifier of the purchased plan.
		 */
		id?: string;
		/**
		 * The price of the purchased plan.
		 */
		price?: number;
		/**
		 * The identifier of the subscription membership to the plan.
		 */
		subscriptionId?: string;
	}

	export interface PlaybackTokenRequest {
		/**
		 * The pin of the account
		 */
		pin: string;
	}

	export interface PostalCodeAddress {
		/**
		 * The name for the building
		 */
		building: string;
		/**
		 * The number of the block
		 */
		block: string;
		/**
		 * The name of the street
		 */
		street: string;
	}

	export interface PricePlan {
		/**
		 * The unique identifier for price plan.
		 */
		id?: string;
		/**
		 * The subscription external id.
		 */
		productId?: string;
		/**
		 * The cost of price plan.
		 */
		price?: number;
		/**
		 * The currency of price plan price.
		 */
		currency?: string;
		/**
		 * The name of price plan.
		 */
		name?: string;
		/**
		 * The terms and conditions associated with price plan.
		 */
		termsAndConditions?: string;
		/**
		 * The label of price plan.
		 */
		label?: string;
		/**
		 * The price text (1).
		 */
		priceText1?: string;
		/**
		 * The price text (2).
		 */
		priceText2?: string;
		/**
		 * The price text (3).
		 */
		priceText3?: string;
		/**
		 * The bonus text (1).
		 */
		bonusText1?: string;
		/**
		 * The bonus text link (1).
		 */
		bonusText1Link?: string;
		/**
		 * The bonus text (2).
		 */
		bonusText2?: string;
		/**
		 * The bonus text link (2).
		 */
		bonusText2Link?: string;
		/**
		 * Indicates whether the price plan is renewable.
		 */
		isRenewable?: boolean;
		/**
		 * The allowed payment methods in the list
		 */
		allowedPaymentMethods?: ('Apple' | 'Card' | 'Google' | 'Telco' | 'M1')[];
	}

	export interface PricePlanPrice {
		/**
		 * The unique identifier for price plan.
		 */
		id: string;
		/**
		 * The cost of price plan.
		 */
		price: number;
		/**
		 * The currency of price plan price.
		 */
		currency: string;
		/**
		 * The discounted cost of price plan.
		 */
		discountedPrice?: number;
	}

	export interface ProfileCreationRequest {
		/**
		 * The unique name of the profile.
		 */
		name: string;
		/**
		 * Whether an account pin is required to enter the profile.
		 *
		 * 	If no account pin is defined this has no impact.
		 */
		isRestricted?: boolean;
		/**
		 * Whether the profile can make purchases with the account payment options.
		 */
		purchaseEnabled?: boolean;
		/**
		 * The segments a profile should be placed under
		 */
		segments?: string[];
		/**
		 * The code of the preferred language for the profile.
		 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
		 * 	one of the languages specified in the app config.
		 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		 */
		languageCode?: string;
		/**
		 * The preferred audio language for the profile.
		 */
		audioLanguage?: string;
		/**
		 * The preferred subtitle language for the profile.
		 */
		subtitleLanguage?: string;
		/**
		 * The classification rating defining the minimum rating level a user should be
		 * 	forced to enter the account pin code for playback. Anything at this rating
		 * 	level or above will require the pin for playback.
		 *
		 * 	e.g. AUOFLC-MA15+
		 *
		 * 	If you want to disable this guard pass an empty string or `null`.
		 */
		minRatingPlaybackGuard?: string;
		/**
		 * The settings for recommendation engine.
		 */
		recommendationSettings?: ProfileRecommendationSettings;
		/**
		 * The quality of a video.
		 */
		downloadVideoQuality?: string;
	}

	export interface ProfileDetail extends ProfileSummary {
		/**
		 * A map of watched itemIds => last watched position
		 */
		watched: { [key: string]: Watched };
		/**
		 * A map of rated itemIds => rating out of 10
		 */
		rated: { [key: string]: number };
		/**
		 * A map of bookmarked itemIds => created date
		 */
		bookmarked: { [key: string]: Date };
		/**
		 * A map of followed itemIds => created date
		 */
		followed?: { [key: string]: Date };
	}

	export interface ProfileDisableProfilePlaybackGuardRequest {
		/**
		 * The account parental pin
		 */
		pin: string;
	}

	export interface ProfileRecommendationSettings {
		/**
		 * The cold start genre selection for recommendation engine.
		 */
		genreAliases?: string[];
		/**
		 * The cold start credit selection for recommendation engine.
		 */
		credits?: string[];
		/**
		 * The cold start audio language selection for recommendation engine.
		 */
		languages?: string[];
	}

	export interface ProfileSummary {
		/**
		 * The id of the profile.
		 */
		id: string;
		/**
		 * The unique name of the profile.
		 */
		name: string;
		/**
		 * Whether a pin is required to enter the profile.
		 */
		isRestricted: boolean;
		/**
		 * Whether the profile can make purchases with the account payment options.
		 */
		purchaseEnabled: boolean;
		/**
		 * The segments a profile has been placed under
		 */
		segments: string[];
		/**
		 * Hex color value assigned to the profile.
		 */
		color?: string;
		/**
		 * The maximum rating (inclusive) of content to return in feeds.
		 *
		 * 	**DEPRECATED** - It's no longer recommended filtering content globally as apps can end up
		 * 	with pages without content, even the homepage. Instead using features like segmentation
		 * 	tags to target demographics like kids means content curation can be more thought out.
		 */
		maxRatingContentFilter?: ClassificationSummary;
		/**
		 * The minumum rating (inclusive) of content where an account pin should be presented before entring playback.
		 */
		minRatingPlaybackGuard?: ClassificationSummary;
		/**
		 * The code of the preferred language for the profile.
		 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
		 * 	one of the languages specified in the app config.
		 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		 */
		languageCode?: string;
		/**
		 * The preferred audio language for the profile.
		 */
		audioLanguage?: string;
		/**
		 * The preferred subtitle language for the profile.
		 */
		subtitleLanguage?: string;
		/**
		 * The settings for recommendation engine.
		 */
		recommendationSettings?: ProfileRecommendationSettings;
		/**
		 * The quality of a video.
		 */
		downloadVideoQuality?: string;
	}

	export interface ProfileTokenRequest {
		/**
		 * The id of the profile the token should grant access rights to.
		 */
		profileId: string;
		/**
		 * The scope(s) of the token(s) required.
		 */
		scopes: ('Catalog' | 'Settings')[];
		/**
		 * The pin of the account
		 */
		pin?: string;
		/**
		 * If you specify a cookie type then a content filter cookie will be returned
		 * 	along with the token(s). This is only intended for web based clients which
		 * 	need to pass the cookies to a server to render a page based on the user's
		 * 	content filters e.g subscription code.
		 *
		 * 	If type `Session` the cookie will be session based.
		 * 	If type `Persistent` the cookie will have a medium term lifespan.
		 * 	If undefined no cookies will be set.
		 */
		cookieType?: 'Session' | 'Persistent';
	}

	export interface ProfileUpdateRequest {
		/**
		 * The unique name of the profile.
		 */
		name?: string;
		/**
		 * Whether an account pin is required to enter the profile.
		 *
		 * 	If no account pin is defined this has no impact.
		 */
		isRestricted?: boolean;
		/**
		 * Whether the profile can make purchases with the account payment options.
		 */
		purchaseEnabled?: boolean;
		/**
		 * The segments a profile should be placed under
		 */
		segments?: string[];
		/**
		 * The code of the preferred language for the profile.
		 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
		 * 	one of the languages specified in the app config.
		 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		 */
		languageCode?: string;
		/**
		 * The preferred language for audio
		 */
		audioLanguage?: string;
		/**
		 * The preferred language for audio
		 */
		subtitleLanguage?: string;
		/**
		 * The classification rating defining the minimum rating level a user should be
		 * 	forced to enter the account pin code for playback. Anything at this rating
		 * 	level or above will require the pin for playback.
		 *
		 * 	e.g. AUOFLC-MA15+
		 *
		 * 	If you want to disable this guard, call `DELETE /account/profiles/{id}/playback-guard`.
		 */
		minRatingPlaybackGuard?: string;
		/**
		 * The settings for recommendation engine.
		 */
		recommendationSettings?: ProfileRecommendationSettings;
		/**
		 * The quality of a video.
		 */
		downloadVideoQuality?: string;
	}

	export interface Purchase {
		/**
		 * The identifier of the purchase.
		 */
		id: string;
		/**
		 * The title of the purchase.
		 */
		title: string;
		/**
		 * The date the purchase was authorized.
		 */
		authorizationDate: Date;
		/**
		 * The total cost of the purchase.
		 */
		total: number;
		/**
		 * The currency code used to make the purchase.
		 */
		currency: string;
	}

	export interface PurchaseExtended {
		/**
		 * The identifier of the purchase.
		 */
		id: string;
		/**
		 * The title of the purchase.
		 */
		title: string;
		/**
		 * The date the purchase was authorized.
		 */
		authorizationDate: Date;
		/**
		 * The total cost of the purchase.
		 */
		total: number;
		/**
		 * The currency code used to make the purchase.
		 */
		currency: string;
		/**
		 * Payment method which was used to complete the purchase.
		 */
		paymentMethod?: PaymentMethod;
	}

	export interface PurchaseItems {
		/**
		 * The total number of items.
		 */
		size?: number;
		/**
		 * A list of purchases.
		 */
		items?: Purchase[];
		paging?: Pagination;
	}

	export interface PurchaseItemsExtended {
		/**
		 * The total number of items.
		 */
		size?: number;
		/**
		 * A list of purchases with more details including payment method.
		 */
		items?: PurchaseExtended[];
		paging?: Pagination;
	}

	export interface PurchaseReceiptRequest {
		/**
		 * The identifier of the subscription membership to the plan.
		 */
		subscriptionId: string;
		/**
		 * The payment gateway name for the In-App billing service to be used.
		 */
		provider: 'Google' | 'Apple';
		/**
		 * A unique identifier that was provided by the In-App billing service to validate the purchase.
		 */
		receiptId: string;
	}

	export interface PurchaseRequest {
		/**
		 * The identifier of the subscription membership to the plan.
		 */
		subscriptionId: string;
		/**
		 * The type of a payment.
		 */
		paymentType: 'Card' | 'Telco';
		promocode?: string;
		/**
		 * The identifier of the payment method to use.
		 * 	Can be omitted, or if purchasing a plan, the default payment method will be used (but default payment method should be setup before).
		 * 	If default payment method was not setup, payment method must be provided.
		 */
		paymentMethodId?: string;
	}

	export interface PurchaseResponse {
		/**
		 * The url to redirect.
		 */
		paymentUrl?: string;
		/**
		 * Session data of purchase.
		 */
		sessionData?: string;
		/**
		 * Id of purchase.
		 */
		sessionId?: string;
	}

	export interface PurchaseVerifyRequest {
		/**
		 * Redirection result after an Adyen payment is made.
		 * 	Used to verify the payment result.
		 */
		redirectResult: string;
	}

	export interface PurchaseVerifyResponse {
		/**
		 * The status of purchase.
		 */
		status: string;
		/**
		 * The result code of purchase.
		 */
		resultCode: string;
	}

	export interface RecommendationSettingsUpdateRequest {
		/**
		 * The cold start genre selection for recommendation engine.
		 */
		genreAliases?: string[];
		/**
		 * The cold start item selection for recommendation engine.
		 */
		itemIds?: string[];
	}

	/**
	 * List data for Cxense Recommendations List
	 */
	export interface RecommendationsListData {
		/**
		 * Object where keys are itemIds for the items in the list and values are objects
		 * 	containing additional information of items like click tracking URLs.
		 */
		itemInclusions?: { [key: string]: RecommendationsListDataExpansion };
	}

	export interface RecommendationsListDataExpansion {
		/**
		 * The cxense click url.
		 */
		clickUrl?: string;
		/**
		 * The cxense click image.
		 */
		clickImage?: string;
	}

	export interface RecommendationsListDataExpansionZoom {
		/**
		 * The ZOOM click through url.
		 */
		clickThroughUrl?: string;
		/**
		 * The ZOOM click url.
		 */
		clickUrl?: string;
	}

	/**
	 * List data for ZOOM Recommendations List
	 */
	export interface RecommendationsListDataZoom {
		/**
		 * Object where keys are itemIds for the items in the list and values are objects
		 * 	containing additional information of items like click tracking URLs.
		 */
		itemInclusions?: { [key: string]: RecommendationsListDataExpansionZoom };
	}

	export interface RegistrationRequest {
		deviceId: string;
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		dateOfBirth: string;
		termsCondition: boolean;
		gender: 'female' | 'male' | 'preferNotToSay';
		/**
		 * Newsletter shortcodes from `/newsletters` endpoint.
		 */
		newsletters?: string[];
		/**
		 * The pin used for parental control
		 */
		pin?: string;
		/**
		 * The segments to apply to the primary profile.
		 */
		segments?: string[];
		/**
		 * The code of the preferred language for the primary profile.
		 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
		 * 	one of the languages specified in the app config.
		 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		 */
		languageCode?: string;
	}

	export interface Reminder {
		/**
		 * The unique identifier.
		 */
		id: string;
		/**
		 * The name for this reminder's asset.
		 */
		schedule: ItemSchedule;
		/**
		 * The ItemSchedule custom id.
		 */
		channel: ItemSummary;
	}

	export interface ReminderRequest {
		/**
		 * The asset Id for the reminder.
		 */
		customId: string;
	}

	export interface RewardsInfo {
		/**
		 * The meReward points.
		 */
		RewardPoints?: RewardsInfoItem;
		/**
		 * The meRewards cashback.
		 */
		RewardCashback?: RewardsInfoItem;
		/**
		 * The meRewards coupons.
		 */
		RewardCoupons?: RewardsInfoItem;
		/**
		 * The meRewards survey.
		 */
		RewardSurvey?: RewardsInfoItem;
		/**
		 * The meRewards transcations.
		 */
		RewardTransactions?: RewardsInfoItem;
	}

	export interface RewardsInfoItem {
		/**
		 * The meRewards item url.
		 */
		url?: string;
		/**
		 * The meRewards item value.
		 */
		value?: number;
	}

	export interface ScheduleItemSummary {
		/**
		 * The display title of the item.
		 */
		title: string;
		/**
		 * The path to watch this item, if the item is a watchable type, e.g. a `movie`, `program` and `episode`.
		 * 	If VOD item is not available then empty.
		 */
		watchPath?: string;
		/**
		 * The path to the detail page of this item. Can be used to load the item detail page via the /page endpoint.
		 * 	If VOD item is not available then empty.
		 */
		path?: string;
		/**
		 * A description of the item.
		 */
		description?: string;
		/**
		 * The name of the channel.
		 */
		broadcastChannel?: string;
		/**
		 * The program category.
		 */
		category?: string;
		/**
		 * The classification rating of this item.
		 */
		classification?: ClassificationSummary;
		/**
		 * The program genre code.
		 */
		genreCode?: string;
		/**
		 * The program prd_number.
		 */
		prdNumber?: string;
		/**
		 * The broadcast channel start.
		 */
		broadcastChannelStart?: Date;
		/**
		 * Whether the item is blackout.
		 */
		blackout?: boolean;
		/**
		 * The blackout message.
		 */
		blackoutMessage?: string;
		/**
		 * Whether catch up is enabled for this item.
		 */
		enableCatchUp?: boolean;
		/**
		 * Whether start over is enabled for this item.
		 */
		enableStartOver?: boolean;
		/**
		 * Whether start over is enabled for this item.
		 */
		enableStartOverV2?: boolean;
		/**
		 * Whether trick play/seeking is enabled for this item.
		 */
		enableSeeking?: boolean;
		/**
		 * For old CTVs does not support DRM, blackout will be based on programSource flag.
		 */
		programSource?: string;
		/**
		 * The master reference key
		 */
		masterReferenceKey?: string;
		/**
		 * For web, mobile app, new CTVs, hbbTV, blackout will be based on Simulcast flag.
		 */
		simulcast?: string;
		/**
		 * Unique identifier for a VOD Item
		 */
		id?: string;
		/**
		 * images from VOD item if EPG-VOD link exists or fallback images otherwise.
		 */
		images?: { [key: string]: string };
		/**
		 * The type of item.
		 */
		type?:
			| 'movie'
			| 'show'
			| 'season'
			| 'episode'
			| 'program'
			| 'link'
			| 'trailer'
			| 'channel'
			| 'customAsset'
			| 'event'
			| 'competition'
			| 'confederation'
			| 'stage'
			| 'persona'
			| 'team'
			| 'credit';
		/**
		 * The number of a season, if the item is a season.
		 */
		seasonNumber?: number;
		/**
		 * The number of an episode, if the item is an episode.
		 */
		episodeNumber?: number;
		/**
		 * The title of an episode.
		 */
		episodeTitle?: string;
		/**
		 * Title of an alternate language.
		 */
		secondaryLanguageTitle?: string;
		/**
		 * Url metadata of the schedule item.
		 */
		url?: string;
		/**
		 * TaxonomyTier1 metadata of the schedule item.
		 */
		taxonomyTier1?: string;
		/**
		 * TaxonomyTier2 metadata of the schedule item.
		 */
		taxonomyTier2?: string;
	}

	/**
	 * Key-value object of query string parameters for the `/search/lists` endpoint. Values will be strings, regardless of
	 * 	the data type of the parameter.
	 *
	 * 	These parameters can be used to make a request for the next page of a search results list obtained from the `/search/lists`
	 * 	endpoint.
	 *
	 * 	Parameters for paging (`page_size`, `page`) and user context (e.g. `device`, `segments`, `lang`) may or may not be included here, but
	 * 	should be taken from the `list.paging` object and client side context either way.
	 *
	 * 	The `term` key may be missing in the case where the initial page request did not include a term query string, in this case the front
	 * 	end should fill in this value from the user input
	 *
	 * 	Example:
	 *
	 * 	  term: 'tomb'
	 * 	  item_types: 'movie,program'
	 */
	export interface SearchListQueryOptions {
		term?: string;
		max_rating?: string;
		item_types?: string;
		item_sub_types?: string;
		exclude_item_sub_types?: string;
		device?: string;
		sub?: string;
		segments?: string;
		ff?: string;
		lang?: string;
	}

	export interface SearchListsResult {
		/**
		 * The ItemList containing the requested search query results.
		 */
		list: ItemList;
	}

	export interface SearchListsResults {
		/**
		 * An array of search query results
		 */
		data: SearchListsResult[];
	}

	export interface SearchResults {
		/**
		 * The search term.
		 */
		term: string;
		/**
		 * The total number of results.
		 */
		total: number;
		/**
		 * Applied item audio language filter.
		 *
		 * 	Missing value mean the filter was not applied.
		 */
		itemAudioLanguage?: string;
		/**
		 * The list of all items relevant to the search term.
		 *
		 * 	If this is present then the `movies` and `tv` lists won't be.
		 */
		items?: ItemList;
		/**
		 * The list of movie items relevant to the search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		movies?: ItemList;
		/**
		 * The list of tv items (shows + programs) relevant to the search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		tv?: ItemList;
		/**
		 * The list of extras items (programs of subtype ProgramExtra) relevant to the search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		extras?: ItemList;
		/**
		 * The list of sports items (shows of subtype SportsEventSeries) relevant to the search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		sports?: ItemList;
		/**
		 * The list of other items (`customAsset`s) relevant to the search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		other?: ItemList;
		/**
		 * The list of people (credits only) relevant to the search term.
		 */
		people?: Person[];
		/**
		 * The list of persons relevant to the search term.
		 *
		 * 	The list is returned only when `sv2` feature flag is set and it
		 * 	contains `Persona` and `Credit` item types.
		 */
		persons?: ItemList;
		/**
		 * The list of events relevant to search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		events?: ItemList;
		/**
		 * The list of competitions relevant to search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		competitions?: ItemList;
		/**
		 * The list of teams relevant to search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		teams?: ItemList;
		/**
		 * The list of confederations relevant to search term.
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		confederations?: ItemList;
		/**
		 * The list of news and highlights relevant to search term.
		 * 	This list may include different asset types, and will build based on asset subtype value
		 *
		 * 	If this is present then the `items` list won't be.
		 */
		newsHighlights?: ItemList;
	}

	export interface SeasonInfo {
		/**
		 * Season id
		 */
		id: string;
		/**
		 * Season number
		 */
		seasonNumber?: number;
		/**
		 * Episode count of this season
		 */
		episodeCount?: number;
	}

	export interface ServiceError {
		/**
		 * A description of the error.
		 */
		message: string;
		/**
		 * An optional code classifying the error. Should be taken in the context of the http status code.
		 */
		code?: number;
		/**
		 * A source of the error.
		 */
		source?: string;
	}

	export interface SettingsTokenRequest {
		/**
		 * The Mediacorp OTP
		 */
		oneTimePassword: string;
	}

	/**
	 * A pageable list of episodes with season information.
	 */
	export interface ShowEpisodesResponse {
		/**
		 * The id of this list
		 */
		id: string;
		/**
		 * The path of this list
		 */
		path: string;
		/**
		 * The total size of the list
		 */
		size: number;
		/**
		 * A list of items
		 */
		items: ItemSummary[];
		/**
		 * Metadata describing how to load the next or previous page of the list
		 */
		paging: Pagination;
		/**
		 * The seasons information
		 */
		seasons?: SeasonInfo[];
	}

	export interface SingleSignOnRequest {
		/**
		 * The third party single-sign-on provider.
		 */
		provider: 'Facebook' | 'Google' | 'Apple' | 'Mediacorp';
		/**
		 * A token from the third party single-sign-on provider e.g. an identity token from Facebook.
		 */
		token: string;
		/**
		 * Device unique identifier
		 */
		deviceId: string;
		/**
		 * The social provider specification when token was generated directly with Mediacorp API
		 * 	using either https://ssoapi.mediacorp.sg/#signin-using-a-google-account or
		 * 	https://ssoapi.mediacorp.sg/#signin-using-a-facebook-account
		 */
		socialProvider?: 'Facebook' | 'Google' | 'Apple';
		/**
		 * The scope(s) of the tokens required.
		 * 	For each scope listed an Account and Profile token of that scope will be returned.
		 */
		scopes?: ('Catalog' | 'Commerce' | 'Settings' | 'Playback')[];
		/**
		 * If you specify a cookie type then a content filter cookie will be returned
		 * 	along with the token(s). This is only intended for web based clients which
		 * 	need to pass the cookies to a server to render a page based on the user's
		 * 	content filters e.g subscription code.
		 *
		 * 	If type `Session` the cookie will be session based.
		 * 	If type `Persistent` the cookie will have a medium term lifespan.
		 * 	If undefined no cookies will be set.
		 */
		cookieType?: 'Session' | 'Persistent';
		/**
		 * When a user attempts to sign in using single-sign-on, we may find an account created
		 * 	previously through the manual sign up flow with the same email. If this is the
		 * 	case then an option to link the two accounts can be made available.
		 *
		 * 	If this flag is set to true then accounts will be linked automatically.
		 *
		 * 	If this flag is not set or set to false and an existing account is found
		 * 	then an http 401 with subcode `6001` will be returned. Client apps can then present the
		 * 	option to link the accounts. If the user decides to accept, then the same call
		 * 	can be repeated with this flag set to true.
		 */
		linkAccounts?: boolean;
	}

	export interface SocialLinkEntry {
		/**
		 * link url
		 */
		link: string;
		/**
		 * link title.
		 */
		title: string;
		images: { [key: string]: string };
	}

	export interface SsoDeviceRegistration {
		/**
		 * The message for device registration.
		 */
		message: string;
	}

	export interface SsoDeviceRegistrationRequest {
		/**
		 * The unique identifier for this device e.g. serial number.
		 */
		id: string;
		/**
		 * The type for this device e.g. web, mobile, tv, others.
		 */
		type: 'web' | 'mobile' | 'tv' | 'others';
		/**
		 * A human recognisable name for this device.
		 */
		name?: string;
		/**
		 * Manufacturer for this device.
		 */
		manufacturer?: string;
		/**
		 * Model for this device.
		 */
		model?: string;
		/**
		 * OS for this device.
		 */
		os?: string;
		/**
		 * Browser.
		 */
		browser?: string;
	}

	export interface Subscription {
		/**
		 * The unique subscription code.
		 */
		code: string;
		/**
		 * The start date of a subscription.
		 */
		startDate: Date;
		/**
		 * True if a subscription is in its trial period, false if not.
		 */
		isTrialPeriod: boolean;
		/**
		 * The plan a subscription belongs to.
		 */
		planId: string;
		/**
		 * The status of a subscription.
		 */
		status: 'Active' | 'Cancelled' | 'Lapsed' | 'Expired' | 'None';
		/**
		 * The end date of a subscription.
		 *
		 * 	After this date the subscription will become expired. If this is a recurring
		 * 	subscription which has not been cancelled then the account holder will be
		 * 	automatically charged and a new subscription will be activated.
		 *
		 * 	Some subscriptions may not have an end date, in which case this
		 * 	property will not exist.
		 */
		endDate?: Date;
	}

	export interface SubscriptionDetail extends Subscription {
		/**
		 * Unique identifier for the subscription.
		 */
		id?: string;
		/**
		 * True if a subscription is renewable and not one-off.
		 */
		isRenewable?: boolean;
		/**
		 * True if a subscription is can be cancelled.
		 */
		isCancellationEnabled?: boolean;
		/**
		 * The date of next renewal.
		 */
		nextRenewalDate?: Date;
		/**
		 * Subscription image.
		 */
		image?: string;
		/**
		 * Subscription name.
		 */
		name?: string;
		/**
		 * Subscription description.
		 */
		description?: string;
		/**
		 * True if a subscription can be resumed
		 */
		canResubscribe?: boolean;
		/**
		 * The payment method
		 */
		paymentMethod?: string;
		/**
		 * The identifier of purchase
		 */
		purchaseId?: string;
		/**
		 * The recurring cost
		 */
		recurringCost?: number;
		/**
		 * The recurring cost currency
		 */
		currency?: string;
	}

	export interface SubscriptionPlan {
		/**
		 * The external ID.
		 */
		externalId?: string;
		/**
		 * The description of subscription plan.
		 */
		description?: string;
		/**
		 * The package header text (1).
		 */
		packageHeaderText1?: string;
		/**
		 * The package header text (2).
		 */
		packageHeaderText2?: string;
		/**
		 * The package header text (3).
		 */
		packageHeaderText3?: string;
		/**
		 * The bonus text (1).
		 */
		bonusText1?: string;
		/**
		 * The bonus text link (1).
		 */
		bonusText1Link?: string;
		/**
		 * The bonus text (2).
		 */
		bonusText2?: string;
		/**
		 * The bonus text link (2).
		 */
		bonusText2Link?: string;
		/**
		 * List of available subscription plans (from Kaltura).
		 */
		pricePlans?: PricePlan[];
		/**
		 * List of conflicting plan ids.
		 */
		conflictingPlans?: string[];
	}

	export interface Theme {
		/**
		 * The list of colors defined for the theme.
		 */
		colors: ThemeColor[];
		/**
		 * The type of theme.
		 */
		type: 'Background' | 'Text' | 'Custom';
	}

	export interface ThemeColor {
		/**
		 * The name of the theme color.
		 */
		name: string;
		/**
		 * The hex value of the theme color.
		 */
		value: string;
		/**
		 * The opacity of the theme color from 0 to 1.
		 *
		 * 	When omitted, no opacity level is to be applied to the color, or in other words we
		 * 	assume the color has an opacity of 1
		 */
		opacity?: number;
	}

	export interface TokenRefreshRequest {
		/**
		 * The token to refresh.
		 */
		token: string;
		/**
		 * If you specify a cookie type then a content filter cookie will be returned
		 * 	along with the token(s). This is only intended for web based clients which
		 * 	need to pass the cookies to a server to render a page based on the user's
		 * 	content filters e.g subscription code.
		 *
		 * 	If type `Session` the cookie will be session based.
		 * 	If type `Persistent` the cookie will have a medium term lifespan.
		 * 	If undefined no cookies will be set.
		 */
		cookieType?: 'Session' | 'Persistent';
	}

	export interface UserExistsRequest {
		username: string;
	}

	export interface UserExistsResult {
		/**
		 * True if username is already registered, false if not.
		 */
		value: boolean;
		/**
		 * Additional information for user, such as user deleted.
		 */
		message?: string;
	}

	export interface UserRating {
		/**
		 * The id of the item rated.
		 */
		itemId: string;
		/**
		 * The rating out of 10
		 */
		rating: number;
	}

	export interface VerifyPromoCodeRequest {
		promocode: string;
	}

	export interface VerifyPromoCodeResult {
		/**
		 * Price of the subscription plan after application of promo code.
		 */
		price: number;
	}

	export interface VerifyRecaptchaRequest {
		/**
		 * The user response token provided by the reCAPTCHA client-side integration.
		 */
		response: string;
		/**
		 * The type of reCAPTCHA type. Checkbox = 1, invisible = 2.
		 */
		type: number;
	}

	export interface VerifyRecaptchaResult {
		/**
		 * True if verify successfully, false if not.
		 */
		success: boolean;
		/**
		 * Error codes if fail to verify.
		 */
		errorCodes?: string[];
	}

	export interface Watched {
		/**
		 * The last playhead position watched for the item.
		 */
		position: number;
		firstWatchedDate: Date;
		lastWatchedDate: Date;
		/**
		 * The id of the item watched.
		 */
		itemId?: string;
		/**
		 * True - if the item is fully watched, False - otherwise.
		 */
		isFullyWatched?: boolean;
	}

	export interface OpenApiSpec {
		host: string;
		basePath: string;
		schemes: string[];
		contentTypes: string[];
		accepts: string[];
		securityDefinitions?: { [key: string]: SecurityDefinition };
	}

	export interface SecurityDefinition {
		type: 'basic' | 'apiKey' | 'oauth2';
		description?: string;
		name?: string;
		in?: 'query' | 'header';
		flow?: 'implicit' | 'password' | 'application' | 'accessCode';
		authorizationUrl?: string;
		tokenUrl?: string;
		scopes?: { [key: string]: string };
	}

	export type CollectionFormat = 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
	export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch';

	export interface OperationInfo {
		path: string;
		method: HttpMethod;
		security?: OperationSecurity[];
		contentTypes?: string[];
		accepts?: string[];
	}

	export interface OperationSecurity {
		id: string;
		scopes?: string[];
	}

	export interface OperationParamGroups {
		header?: { [key: string]: string };
		path?: { [key: string]: string | number | boolean };
		query?: { [key: string]: string | string[] | number | boolean };
		formData?: { [key: string]: string | number | boolean };
		body?: any;
	}

	export interface ServiceRequest {
		method: HttpMethod;
		url: string;
		headers: { [index: string]: string };
		body: any;
	}

	export interface RequestInfo {
		baseUrl: string;
		parameters: OperationParamGroups;
	}

	export interface ResponseOutcome {
		retry?: boolean;
		res: Response<any>;
	}

	export interface ServiceOptions {
		/**
		 * The service url.
		 *
		 * If not specified then defaults to the one defined in the Open API
		 * spec used to generate the service api.
		 */
		url?: string;
		/**
		 * Fetch options object to apply to each request e.g
		 *
		 *		 { mode: 'cors', credentials: true }
		 *
		 * If a headers object is defined it will be merged with any defined in
		 * a specific request, the latter taking precedence with name collisions.
		 */
		fetchOptions?: any;
		/**
		 * Function which should resolve rights for a request (e.g auth token) given
		 * the OpenAPI defined security requirements of the operation to be executed.
		 */
		getAuthorization?: (
			security: OperationSecurity,
			securityDefinitions: any,
			op: OperationInfo
		) => Promise<OperationRightsInfo>;
		/**
		 * Given an error response, custom format and return a ServiceError
		 */
		formatServiceError?: (response: FetchResponse, data: any) => ServiceError;
		/**
		 * Before each Fetch request is dispatched this function will be called if it's defined.
		 *
		 * You can use this to augment each request, for example add extra query parameters.
		 *
		 *		 const params = reqInfo.parameters;
		 *		 if (params && params.query) {
		 *			 params.query.lang = "en"
		 *		 }
		 *		 return reqInfo
		 */
		processRequest?: (op: OperationInfo, reqInfo: RequestInfo) => RequestInfo;
		/**
		 * If you need some type of request retry behavior this function
		 * is the place to do it.
		 *
		 * The response is promise based so simply resolve the "res" parameter
		 * if you're happy with it e.g.
		 *
		 *		 if (!res.error) return Promise.resolve({ res });
		 *
		 * Otherwise return a promise which flags a retry.
		 *
		 *		 return Promise.resolve({ res, retry: true })
		 *
		 * You can of course do other things before this, like refresh an auth
		 * token if the error indicated it expired.
		 *
		 * The "attempt" param will tell you how many times a retry has been attempted.
		 */
		processResponse?: (req: api.ServiceRequest, res: Response<any>, attempt: number) => Promise<api.ResponseOutcome>;
		/**
		 * If a fetch request fails this function gives you a chance to process
		 * that error before it's returned up the promise chain to the original caller.
		 */
		processError?: (req: api.ServiceRequest, res: api.ResponseOutcome) => Promise<api.ResponseOutcome>;
		/**
		 * By default the authorization header name is "Authorization".
		 * This property allows you to override it.
		 *
		 * One place this can come up is where your API is under the same host as
		 * a website it powers. If the website has Basic Auth in place then some
		 * browsers will override your "Authorization: Bearer <token>" header with
		 * the Basic Auth value when calling your API. To counter this we can change
		 * the header, e.g.
		 *
		 *		 authorizationHeader = "X-Authorization"
		 *
		 * The service must of course accept this alternative.
		 */
		authorizationHeader?: string;
	}

	export type OperationRights = { [key: string]: OperationRightsInfo };

	export interface OperationRightsInfo {
		username?: string;
		password?: string;
		token?: string;
		apiKey?: string;
	}

	export interface Response<T> {
		raw: FetchResponse;
		/**
		 * If 'error' is true then data will be of type ServiceError
		 */
		data?: T;
		/**
		 * True if there was a service error, false if not
		 */
		error?: boolean;
	}

	export interface FetchResponse extends FetchBody {
		url: string;
		status: number;
		statusText: string;
		ok: boolean;
		headers: Headers;
		type: string | FetchResponseType;
		size: number;
		timeout: number;
		redirect(url: string, status: number): FetchResponse;
		error(): FetchResponse;
		clone(): FetchResponse;
	}

	export interface FetchBody {
		bodyUsed: boolean;
		arrayBuffer(): Promise<ArrayBuffer>;
		blob(): Promise<Blob>;
		formData(): Promise<FormData>;
		json(): Promise<any>;
		json<T>(): Promise<T>;
		text(): Promise<string>;
	}

	export interface FetchHeaders {
		get(name: string): string;
		getAll(name: string): Array<string>;
		has(name: string): boolean;
	}

	export declare enum FetchResponseType {
		'basic',
		'cors',
		'default',
		'error',
		'opaque'
	}

	export class ServiceError extends Error {
		status: number;
	}

	/**
	 * Flux standard action meta for service action
	 */
	export interface ServiceMeta {
		res: FetchResponse;
		info: any;
	}
}
/**
 * @typedef AccessToken
 * @memberof module:types
 *
 * @property {string} value The token value used for authenticated requests.
 * @property {boolean} refreshable True if this token can be refreshed, false if not.
 * @property {date} expirationDate The timestamp this token expires.
 * @property {string} type The type of the token.
 * @property {boolean} accountCreated When a `UserAccount` token is issued during a single-sign-on flow
 * 	a user may have been automatically registered if they didn't
 * 	have an account already. If this occurs then `accountCreated`
 * 	will be `true`.
 */

/**
 * @typedef Account
 * @memberof module:types
 *
 * @property {string} id The id of the account.
 * @property {module:types.Address} address The address details of the account holder.
 * @property {string} email The email address belonging to the account.
 * @property {boolean} emailVerified Whether the email address has been verified.
 *
 * 	Users who receive an emailed verification url click the link to verify their email address.
 * @property {string} firstName The first name of the account holder.
 * @property {string} lastName The last name of the account holder.
 * @property {date} dateOfBirth The date of birth of the account holder
 * @property {string} ageGroup The age group of the account holder.
 * 	A: age >= 21
 * 	B: age from 18 to 20
 * 	C: age from 16 to 17
 * 	D: age < 16
 * 	E: not specified
 * @property {string} gender The gender of the account holder
 * @property {string} maritalStatus The marital status of the account holder. Needs to be selected from a list of available marital statuses in `/config` endpoint.
 * @property {string} income The income of the account holder. Needs to be selected from a list of available incomes in `/config` endpoint.
 * @property {string} occupation The occupation of the account holder. Needs to be selected from a list of available occupations in `/config` endpoint.
 * @property {string} nationality The nationality of the account holder. Needs to be selected from a list of available nationalities in `/config` endpoint.
 * @property {string} ethnicity The ethnicity of the account holder. Needs to be selected from a list of available ethnicities in `/config` endpoint.
 * @property {string} homePhone The home phone of the account holder
 * @property {string} mobilePhone The mobile phone of the account holder
 * @property {boolean} trackingEnabled Whether usage tracking is associated with the account or anonymous.
 * @property {boolean} pinEnabled When an account level pin is defined this will be true.
 * @property {boolean} marketingEnabled Whether the account has opted in or out of marketing material.
 * @property {string} primaryProfileId The id of the primary profile.
 * @property {boolean} usedFreeTrial Whether the account has used up their free trial period of a plan.
 * @property {string} socialProvider The social provider used for sign in.
 * @property {string} minRatingPlaybackGuard The classification rating defining the minimum rating level a user should be
 * 	forced to enter the account pin code for playback. Anything at this rating
 * 	level or above will require the pin for playback.
 *
 * 	e.g. AUOFLC-MA15+
 *
 * 	If you want to disable this guard pass an empty string or `null`.
 * @property {string} profileId The ID of the profile to be updated
 * @property {string} defaultPaymentMethodId The id of the payment method to use by default for account transactions.
 * @property {string} defaultPaymentInstrumentId The id of the payment instrument to use by default for account transactions.
 *
 * 	 **DEPRECATED** The property `defaultPaymentMethodId` is now preferred.
 * @property {module:types.Subscription[]} subscriptions The list of subscriptions, if any, the account has signed up to.
 * @property {string} subscriptionCode The active subscription code for an account.
 *
 * 	The value of this should be passed to any endpoints accepting a `sub` query parameter.
 * @property {module:types.ProfileSummary[]} profiles The list of profiles under this account.
 * @property {module:types.Entitlement[]} entitlements The list of entitlements to playback specific items.
 * @property {module:types.DownloadInfo} downloads The download information for this account.
 * @property {module:types.RewardsInfo} rewards The meRewards information for this account.
 * @property {string[]} segments The segments an account has been placed under
 */

/**
 * @typedef AccountDevices
 * @memberof module:types
 *
 * @property {module:types.Device[]} devices The array of registered playack devices.
 * @property {number} maxRegistered The maximum number of playback devices that can be registered
 * 	under an account at a single time.
 *
 * 	If there is no maximum defined this value will be `-1`.
 * @property {module:types.DeviceRegistrationWindow} registrationWindow Defines the start and end date of the current registration window along with calculated limits.
 *
 * 	If undefined then there are no registration limits for a period.
 *
 * 	For example given a registration period of 30 days, this sliding window will start on the
 * 	oldest registration of the last 30 days, and end 30 days from that registration date.
 *
 * 	In this window there is a limit on how many devices can be registered in 30 days.
 * 	If exceeded then no more devices can be registered unless one is deregistered or the
 * 	oldest registration drops off the 30 day window.
 *
 * 	Deregistration also has potential limits which may prevent a device being deregistered.
 * 	In this case the user must wait until the oldest deregistered device is more than 30
 * 	days old.
 * @property {module:types.DeviceRegistrationWindow} deregistrationWindow Defines the start and end date of the current deregistration window along with calculated limits.
 *
 * 	If undefined then there are no deregistration limits for a period.
 *
 * 	For example given a deregistration period of 30 days, this sliding window will start on the
 * 	oldest deregistration of the last 30 days, and end 30 days from that deregistration date.
 *
 * 	In this window there is a limit on how many devices can be deregistered in 30 days.
 * 	If exceeded then no more devices can be deregistered unless the oldest deregistration drops
 * 	off the 30 day window.
 */

/**
 * @typedef AccountNonce
 * @memberof module:types
 *
 * @property {string} value The nonce value.
 */

/**
 * @typedef AccountTokenByCodeRequest
 * @memberof module:types
 *
 * @property {string} id The unique identifier for the device e.g. serial number.
 * @property {string} code The generated device authorization code.
 */

/**
 * @typedef AccountTokenRequest
 * @memberof module:types
 *
 * @property {string} email The email associated with the account.
 * @property {string} password The password associated with the account.
 * @property {string[]} scopes The scope(s) of the tokens required.
 * 	For each scope listed an Account and Profile token of that scope will be returned
 * @property {string} deviceId Device unique identifier
 * @property {string} cookieType If you specify a cookie type then a content filter cookie will be returned
 * 	along with the token(s). This is only intended for web based clients which
 * 	need to pass the cookies to a server to render a page based on the user's
 * 	content filters e.g subscription code.
 *
 * 	If type `Session` the cookie will be session based.
 * 	If type `Persistent` the cookie will have a medium term lifespan.
 * 	If undefined no cookies will be set.
 */

/**
 * @typedef AccountUpdateRequest
 * @memberof module:types
 *
 * @property {module:types.Address} address The address of the account holder.
 * 	If the address is provided any properties which are omitted from the address will be cleared.
 * @property {string} firstName The first name of the account holder
 * @property {string} lastName The last name of the account holder
 * @property {string} dateOfBirth The date of birth of the account holder
 * @property {string} gender The gender of the account holder
 * @property {string} maritalStatus The gender of the account holder. Needs to be selected from a list of available marital statuses in `/config` endpoint.
 * @property {string} income The income of the account holder. Needs to be selected from a list of available incomes in `/config` endpoint.
 * @property {string} occupation The occupation of the account holder. Needs to be selected from a list of available occupations in `/config` endpoint.
 * @property {string} nationality The nationality of the account holder. Needs to be selected from a list of available nationalities in `/config` endpoint.
 * @property {string} ethnicity The ethnicity of the account holder. Needs to be selected from a list of available ethnicities in `/config` endpoint.
 * @property {string} homePhone The home phone of the account holder
 * @property {string} mobilePhone The mobile phone of the account holder
 * @property {string[]} segments The segments an account should be placed under
 */

/**
 * @typedef AccountUser
 * @memberof module:types
 *
 * @property {string} id The id of the account.
 * @property {string} email The email address belonging to the account.
 * @property {string} firstName The first name of the account holder.
 * @property {string} lastName The last name of the account holder.
 * @property {date} dateOfBirth The date of birth of the account holder
 * @property {string} ageGroup The age group of the account holder.
 * 	A: age >= 21
 * 	B: age from 18 to 20
 * 	C: age from 16 to 17
 * 	D: age < 16
 * 	E: not specified
 * @property {string} gender The gender of the account holder
 */

/**
 * @typedef Address
 * @memberof module:types
 *
 * @property {string} country The country name or code. Needs to be selected from a list of available countries in `/config` endpoint.
 * @property {string} postcode The postal or zip code.
 * @property {string} building
 * @property {string} block
 * @property {string} unit
 * @property {string} street
 * @property {string} city The city name.
 */

/**
 * @typedef AnonymousTokenRequest
 * @memberof module:types
 *
 * @property {string} deviceId Device unique identifier
 * @property {string} cookieType If you specify a cookie type then a content filter cookie will be returned
 * 	along with the token(s). This is only intended for web based clients which
 * 	need to pass the cookies to a server to render a page based on the user's
 * 	content filters e.g subscription code.
 *
 * 	If type `Session` the cookie will be session based.
 * 	If type `Persistent` the cookie will have a medium term lifespan.
 * 	If undefined no cookies will be set.
 */

/**
 * @typedef AppConfig
 * @memberof module:types
 *
 * @property {object} classification The map of classification ratings.
 * @property {module:types.AppConfigSubscription} subscription
 * @property {module:types.AppConfigPlayback} playback
 * @property {module:types.AppConfigGeneral} general
 * @property {module:types.Navigation} navigation
 * @property {module:types.PageSummary[]} sitemap
 * @property {module:types.AppConfigDisplay} display
 * @property {module:types.AppConfigI18n} i18n
 * @property {module:types.AppConfigLinear} linear
 * @property {module:types.AppConfigProfile} profile
 * @property {module:types.DeviceBrand[]} brands
 * @property {module:types.AppConfigPersonalisation} personalisation
 * @property {module:types.AppConfigAdvertisments} advertisment
 * @property {module:types.AppConfigDeeplinking} deeplinking
 */

/**
 * @typedef AppConfigAdvertisments
 * @memberof module:types
 *
 * @property {number} adsNetworkCode The DFP network code
 * @property {number} adsMRSSId The MRSS source id
 * @property {string} adsSplashAdKeywords Keyword for splash ad request
 * @property {boolean} adsSplashKids Overwrite kid profile ad parameter
 */

/**
 * @typedef AppConfigDeeplinking
 * @memberof module:types
 *
 * @property {string} androidAppPackageName The Android application package name.
 * @property {string} androidAppFingerprint The Android application fingerprint.
 * @property {string} universalLinkAppID iOS application ID.
 * @property {string} universalLinkPaths iOS application paths.
 * @property {string[]} androidExcludedPaths Android Excluded paths.
 */

/**
 * @typedef AppConfigDisplay
 * @memberof module:types
 *
 * @property {module:types.Theme[]} themes An array of globally configured themes.
 */

/**
 * @typedef AppConfigGeneral
 * @memberof module:types
 *
 * @property {string} websiteUrl The url of the primary website.
 * @property {string} gaToken A Google Analytics token to track applicaton user events.
 * @property {string} stripeKey The public Stripe key to use for payment transactions.
 * @property {string} facebookAppId The Facebook application id associated with an environment.
 * @property {object} itemImageTypes A map of default item image types where the key is the item types.
 * @property {string} currencyCode The currency code to target.
 * @property {object} customFields A map of custom configuration fields.
 * @property {number} maxUserRating The maximum value allowed for user ratings.
 * @property {boolean} mandatorySignIn Whether to require sign in for customers to access content.
 * @property {string} defaultTimeZone The default time zone of the site. e.g. "Etc/GMT"
 * @property {module:types.Language[]} audioLanguages List of available audio languages
 * @property {module:types.Language[]} subtitleLanguages List of available subtitle languages
 * @property {string[]} defaultSegmentationTags List of default segmentation tags
 * @property {number} otpExpirationTimeInMinutes One time password expiration time in minutes.
 * @property {number} playbackTokenExpirationTimeInMinutes Playback token expiration time in minutes.
 * @property {number} downloadExpirationTimeInDays Download expiration time in days.
 * @property {number} onboardingIntroScreenViewLimit Onboarding intro screen view limit.
 * @property {number} upsellScreenViewLimit Upsell screen view limit.
 * @property {number} upsellScreenShowFrequency Upsell screen show frequency.
 * @property {string[]} iosIapSubscriptions Subscriptions available for IAP in iOS.
 */

/**
 * @typedef AppConfigI18n
 * @memberof module:types
 *
 * @property {module:types.Language[]} languages An array of available languages.
 */

/**
 * @typedef AppConfigLinear
 * @memberof module:types
 *
 * @property {number} viewingWindowDaysAfter Number of available upcoming day schedules.
 * @property {number} viewingWindowDaysBefore Number of available day schedules in the past.
 * @property {number} scheduleCacheMaxAgeMinutes Maximum time in minutes for which channel schedule information can be used without being refreshed
 * @property {number} utcOffsetMinutes Offcet between UTC and `defaultTimeZone` in minutes.
 * @property {boolean} useAmPmTimeFormat True if time in AmPm format
 * @property {number} epgReminderNotificationOffsetMinutes Number of minutes before the application should shows the
 * 	reminder message for the user
 * @property {number} upcomingScheduleLimit Upcoming schedule limit for linear player.
 */

/**
 * @typedef AppConfigPersonalisation
 * @memberof module:types
 *
 * @property {string} personalisationGenreListId Personalisation list ID for normal profiles
 * @property {string} personalisationGenreListIdForKids Personalisation list ID for kids profiles
 * @property {string} relatedItemWidgetId cXense Widget Id for end of playback related items row.
 * @property {string} zoomWidgetIdWeb Zoom Widget Id for end of playback related items row on web.
 * @property {string} zoomWidgetIdMobile Zoom Widget Id for end of playback related items row on mobile.
 * @property {string} zoomWidgetIdTv Zoom Widget Id for end of playback related items row on tv.
 */

/**
 * @typedef AppConfigPlayback
 * @memberof module:types
 *
 * @property {number} heartbeatFrequency How often a heartbeat should be renewed during playback.
 * @property {number[]} viewEventPoints An array of percentage points in which to fire off plabyack view events.
 * 	For example a value of 0.5 would indicate that an event should be
 * 	fired when the user is half way through the video.
 * 	Often known as quartiles when four equaly spread event points.
 * @property {number} chainPlaySqueezeback The number of seconds before the end of playback when the current video
 * 	should be minimized and user options are presented within the video player.
 *
 * 	If set to 0 there will be no squeezeback.
 * @property {number} chainPlayTimeout The number of minutes of user inactivity before autoplay is paused.
 *
 * 	If set to 0 there will be no autoplay timeout.
 * @property {number} chainPlayCountdown The number of seconds before autoplay of next video.
 *
 * 	If set to 0 there will be no autoplay.
 * @property {string} kalturaPartnerId Kaltura partner ID for every direct call to Kaltura services:
 * 	 - hearbeat
 * 	 - thumbnails
 * @property {string} kalturaServiceUrl Kaltura base url for playback
 * @property {string} kalturaHeartbeatUrl Kaltura heartbeat url for registering resume position inside Kaltura system
 * 	and manage playback concurrency
 * @property {string} kalturaThumbnailBaseUrl Kaltura base url for providing thumbnail images for playback
 * @property {number} watchCreditsCtaCountdown The number of seconds before the watch credits CTA is dismissed.
 *
 * 	If set to 0 there will be no watch credits CTA.
 * @property {number} skipIntroInteractionTimeInSeconds The number of seconds before the Skip Intro CTA is dismissed.
 *
 * 	If set to 0 the Skip Intro CTA will appear during the whole intro.
 */

/**
 * @typedef AppConfigProfile
 * @memberof module:types
 *
 * @property {number} maxFollowsPerProfile Maximum number of follows a profile can have.
 */

/**
 * @typedef AppConfigSubscription
 * @memberof module:types
 *
 * @property {module:types.Plan[]} plans The available public plans a user can subscribe to.
 * @property {string[]} primePricePlanIds The prime plan ids.
 */

/**
 * @typedef AutomaticSignIn
 * @memberof module:types
 *
 * @property {string} url Url for automatic signin.
 */

/**
 * @typedef Bookmark
 * @memberof module:types
 *
 * @property {string} itemId The id of the item bookmarked.
 * @property {date} creationDate The date the bookmark was created.
 */

/**
 * @typedef BookmarkListDataExpansion
 * @memberof module:types
 *
 * @property {number} unwatchedEpisodes The number of unwatched episodes.
 */

/**
 * @typedef BookmarksListData
 * @memberof module:types
 *
 * @property {object} itemInclusions Object where keys are itemIds for the items in the list and values are objects
 * 	containing additional information of items like number of unwatchted episodes.
 */

/**
 * @typedef BoostItemList
 * @memberof module:types
 *
 * @property {string} id The id of this list
 * @property {string} title The title of this list
 * @property {string} sourceId The Source Id of the recommendation
 * @property {string} refUsecase The reference use case of the recommendation
 * @property {string} seriesTitle The Series Title of the recommendation
 * @property {string} Genre The Genre of the recommendation
 * @property {string} path The path of this list
 * @property {string[]} itemTypes The types of items in the list
 * @property {number} size The total size of the list
 * @property {module:types.ItemSummary[]} items A list of items
 * @property {module:types.Pagination} paging Metadata describing how to load the next or previous page of the list
 */

/**
 * @typedef ChangeCreditCardRequest
 * @memberof module:types
 *
 * @property {string} externalId External Id of existing payment method
 */

/**
 * @typedef ChangeCreditCardResult
 * @memberof module:types
 *
 * @property {string} sessionId
 * @property {string} sessionData
 */

/**
 * @typedef ChangePasswordRequest
 * @memberof module:types
 *
 * @property {string} currentPassword Current account password.
 * @property {string} newPassword The new password for the account.
 */

/**
 * @typedef ChangePinRequest
 * @memberof module:types
 *
 * @property {string} pin The new pin to set.
 */

/**
 * @typedef Classification
 * @memberof module:types
 * @extends ClassificationSummary
 *
 * @property {string} advisoryText Parental advisort text.
 * @property {number} level The level of this classification when compared with its siblings.
 * 	A higher level means a greater restriction.
 * 	Each classification in a system should have a unique level.
 * @property {string} system The parent system code of the classification.
 * @property {object} images
 */

/**
 * @typedef ClassificationSummary
 * @memberof module:types
 *
 * @property {string} code The unique code for a classification.
 * @property {string} name The name of the classification for display.
 */

/**
 * @typedef ContinueWatchingListData
 * @memberof module:types
 *
 * @property {object} itemInclusions Object where keys are itemIds for the items in the list and values are objects
 * 	containing additional items (either episode/season/show) that were requested
 * 	in the "include" query option.
 *
 * 	For example if you request the ContinueWatching list with "season" items in
 * 	the list, you can specify `include=episode` and then the specific next episode
 * 	will be returned in this object.
 */

/**
 * @typedef ContinueWatchingListDataExpansion
 * @memberof module:types
 *
 * @property {module:types.ItemSummary} episode
 * @property {module:types.ItemSummary} season
 * @property {module:types.ItemSummary} show
 */

/**
 * @typedef CountryCode
 * @memberof module:types
 *
 * @property {string} code Country Code of anonymous or logged in user
 */

/**
 * @typedef Credit
 * @memberof module:types
 * @extends Person
 *
 * @property {string} role The type of role the credit performed, e.g. actor.
 * @property {string} character The name of the character.
 */

/**
 * @typedef DeleteCreditCardRequest
 * @memberof module:types
 *
 * @property {string} paymentMethodId Id of existing payment method
 */

/**
 * @typedef DeleteCreditCardResult
 * @memberof module:types
 *
 * @property {boolean} result
 * @property {number} executionTime
 */

/**
 * @typedef Device
 * @memberof module:types
 *
 * @property {string} id The unique identifier for this device e.g. serial number.
 * @property {string} name The human recognisable name for this device.
 * @property {date} registrationDate The date this device was registered.
 * @property {number} brandId Device brand identifier.
 */

/**
 * @typedef DeviceAuthorizationCode
 * @memberof module:types
 *
 * @property {string} code The generated device authorization code.
 */

/**
 * @typedef DeviceAuthorizationCodeRequest
 * @memberof module:types
 *
 * @property {string} id The unique identifier for this device e.g. serial number.
 * @property {number} brandId Device brand identifier.
 */

/**
 * @typedef DeviceAuthorizationRequest
 * @memberof module:types
 *
 * @property {string} code The generated device authorization code.
 * @property {string} name A human recognisable name for this device.
 */

/**
 * @typedef DeviceBrand
 * @memberof module:types
 *
 * @property {number} id Device brand identifier.
 * @property {string} name Device brand name.
 * @property {string} family Device family name.
 */

/**
 * @typedef DeviceRegistrationRequest
 * @memberof module:types
 *
 * @property {string} id The unique identifier for this device e.g. serial number.
 * @property {string} name A human recognisable name for this device.
 * @property {number} brandId Device brand identifier.
 */

/**
 * @typedef DeviceRegistrationWindow
 * @memberof module:types
 *
 * @property {number} periodDays The number of days a de/registration period runs for.
 * @property {number} limit The maximum de/registrations that can be made in a period.
 * @property {number} remaining The remaining de/registrations that can be made in the current period.
 * @property {date} startDate The start date of the current period.
 *
 * 	This is based on the earliest device de/registrations in the past N days, where
 * 	N is defined by `periodDays`.
 *
 * 	If no device has been de/registered then start date will be from the current date.
 * @property {date} endDate The end date of the current period.
 *
 * 	This is based on the value of `startDate` plus the number of days defined by  `periodDays`.
 */

/**
 * @typedef DownloadInfo
 * @memberof module:types
 *
 * @property {number} numberOfDownloads The number of distinct assets downloaded this month.
 * @property {number} monthlyLimit The maximum number of distinct assets that can be downloaded per month.
 *
 * 	This information is returned only when there is a limit set for this account.
 */

/**
 * @typedef Entitlement
 * @memberof module:types
 * @extends OfferRights
 *
 * @property {date} activationDate The date of activation. If no date is defined the entitlement has not be activated.
 * @property {date} expirationDate The date the entitlement expires.
 * @property {date} creationDate The date the entitlement was created.
 * @property {number} playCount How many times the media has been played.
 * @property {number} remainingDownloads How many more downloads of this media are available.
 * @property {string} itemId The id of the item this entitlement is for.
 * @property {string} itemType The type of item this entitlement is for.
 * @property {string} planId The id of the plan this entitlement is for.
 * @property {number} mediaDuration The duration of the entitled media.
 * @property {module:types.ClassificationSummary} classification The classification of the entitled item.
 */

/**
 * @typedef ExclusionRule
 * @memberof module:types
 *
 * @property {string} description
 * @property {string} device The device type that the exclusion rules apply to.
 * @property {boolean} excludeAirplay Prevent airplay from an apple device.
 * @property {boolean} excludeChromecast Prevent chromecasting.
 * @property {string} excludeDelivery
 * @property {string} excludeMinResolution
 */

/**
 * @typedef Follow
 * @memberof module:types
 *
 * @property {string} itemId The id of the item followed.
 * @property {date} creationDate The date the followed item was created.
 */

/**
 * @typedef ItemCustomMetadata
 * @memberof module:types
 *
 * @property {string} name The name of the custom metadata.
 * @property {string} value The value of the custom metadata.
 */

/**
 * @typedef ItemDetail
 * @memberof module:types
 * @extends ItemSummary
 *
 * @property {string} advisoryText Advisory text about this item, related to the classification
 * @property {string[]} categories An array of categories of this item.
 * @property {number} channelNumber The live channel number.
 * @property {string} copyright Copyright information about this item
 * @property {string} distributor The distributor of this item.
 * @property {string} description The description of this item.
 * @property {module:types.ItemCustomMetadata[]} customMetadata An ordered list of custom name-value-pair item metadata.
 * 	Usually displayed on an item detail page.
 * @property {string[]} genrePaths An array of genre paths mapping to the values within the `genres` array from ItemSummary.
 * @property {string} location The optional location (e.g. city) of an event.
 * 	Specific to Program and Event item types.
 * @property {string} venue The optional venue of an event.
 * 	Specific to Program and Event item types.
 * @property {date} eventDate The optional date of an event.
 * 	Specific to a Program item type.
 * @property {module:types.Credit[]} credits A list of credits associated with this item.
 * @property {module:types.ItemList} seasons A list of seasons associated with this item.
 * @property {module:types.ItemList} episodes A list of episodes associated with this item.
 * @property {module:types.ItemDetail} season The season associated with this item.
 * @property {module:types.ItemDetail} show The season associated with this item.
 * @property {string[]} segments An array of segmentation tags of this item.
 * @property {number} totalUserRatings The total number of users who have rated this item.
 * @property {module:types.ItemSummary[]} trailers A list of trailers associated with this item.
 * @property {module:types.ItemSummary[]} extras A list of extras associated with this item.
 * @property {module:types.ItemSummary[]} similar A list of similar content.
 */

/**
 * @typedef ItemList
 * @memberof module:types
 *
 * @property {string} id The id of this list
 * @property {string} title The title of this list
 * @property {string} description A full description of this list.
 * @property {string} shortDescription A short description of this list.
 * @property {string} tagline The tagline of the item.
 * @property {string} path The path of this list
 * @property {string[]} itemTypes The types of items in the list
 * @property {string[]} itemAudioLanguages Available audio languages in the list
 * @property {string[]} itemGenres Available genres in the list
 * @property {number} size The total size of the list
 * @property {module:types.ItemSummary[]} items A list of items
 * @property {object} listMeta
 * @property {object} images
 * @property {string} parameter If this list is parameterized, then this contains the parameter of the list in the format `name:value`.
 * 	For example the Movies Genre list will take a parameter `genre` with a given value. e.g. `genre:action` or `genre:drama`.
 * @property {module:types.Pagination} paging Metadata describing how to load the next or previous page of the list
 * @property {object} customFields A map of custom fields defined by a curator for a list.
 * @property {module:types.Theme[]} themes
 * @property {module:types.ListData} listData Extra data needed for the specific list. The format and content will change
 * 	depending on the list
 */

/**
 * @typedef ItemPurchase
 * @memberof module:types
 *
 * @property {string} id The identifier of the purchased item.
 * @property {string} ownership The ownership of the purchased item.
 * @property {string} resolution The resolution of the purchased item.
 * @property {string} title The title of the purchased item.
 * @property {string} type The type of item purchased.
 */

/**
 * @typedef ItemRelationship
 * @memberof module:types
 *
 * @property {string} key
 * @property {module:types.ItemSummary[]} items
 */

/**
 * @typedef ItemSchedule
 * @memberof module:types
 *
 * @property {string} id
 * @property {string} channelId The id of the channel item this schedule belongs to.
 * @property {date} startDate The date and time this schedule starts.
 * @property {date} endDate The date and time this schedule ends.
 * @property {boolean} repeat True if this has been aired previously on the same channel.
 * @property {boolean} live True if this is a live event.
 * @property {boolean} featured True if this is a featured item schedule.
 * @property {string} customId A program asset identifier for this item.
 * @property {boolean} isGap True if this schedule is gap between programs
 * @property {boolean} blackout True if this schedule represents time when the channel is completely off air.
 * @property {string} InteractiveType InteractiveType. "0" or "1".
 * @property {string} InteractiveId InteractiveId.
 * @property {string} AspectRatio AspectRatio.
 * @property {module:types.ScheduleItemSummary} item The item this schedule targets.
 */

/**
 * @typedef ItemScheduleDetail
 * @memberof module:types
 * @extends ItemSchedule
 *
 * @property {module:types.ItemScheduleDetailItem} item The item this schedule targets.
 */

/**
 * @typedef ItemScheduleDetailItem
 * @memberof module:types
 * @extends ItemDetail
 *
 * @property {number} showAverageUserRating The average user rating of associated show.
 * 	When based on user ratings from our system this will be out of 10.
 * 	Only valid for episodes.
 * @property {number} showTotalUserRatings The total number of users who have rated this item.
 * 	Only valid for episodes.
 */

/**
 * @typedef ItemScheduleList
 * @memberof module:types
 *
 * @property {string} channelId The id of the channel the schedules belong to.
 * @property {date} startDate The date and time this list of schedules starts.
 * @property {date} endDate The date and time this list of schedules ends.
 * @property {module:types.ItemSchedule[]} schedules The list of item schedules.
 */

/**
 * @typedef ItemScheduleSummary
 * @memberof module:types
 * @extends ItemSchedule
 *
 * @property {module:types.ItemSummary} item The item this schedule targets.
 */

/**
 * @typedef ItemSummary
 * @memberof module:types
 *
 * @property {string} id Unique identifier for an Item
 * @property {string} type The type of item
 * @property {string} subtype Subtype of the item. Mainly used to identify different types when `type`
 * 	is `customAsset`
 * @property {string} title The display title of the item.
 * @property {string} contextualTitle A contextually relative title to display after a parent title.
 * 	Mostly applicable to Season, Episode and Trailer.
 * @property {string} shortDescription A truncated description of the item
 * @property {string} description The description of this item.
 * @property {module:types.Credit[]} credits A list of credits associated with this item.
 * @property {string} tagline The tagline of the item
 * @property {module:types.ClassificationSummary} classification The classification rating of this item.
 * @property {string} path The path to the detail page of this item. Can be used to load the item detail page via the /page endpoint.
 * @property {string} watchPath The path to watch this item, if the item is a watchable type, e.g. a `movie`, `program` and `episode`.
 * @property {string[]} scopes The scopes for this item
 * @property {number} releaseYear The year this item was released
 * @property {number} episodeCount The number of episodes in the season, if the item is a season.
 * @property {number} availableEpisodeCount The number of available episodes in the season, if the item is a season.
 * @property {number} availableSeasonCount The number of available seasons in the show, if the item is a show.
 * @property {number} seasonNumber The number of a season, if the item is a season.
 * @property {number} episodeIndex The index of an episode in the list of all episodes, if the item is an episode.
 * @property {number} episodeNumber The number of an episode, if the item is an episode.
 * @property {string} episodeName The full name of an episode.
 * @property {string} showId The identifier of the show this item belongs to, if the item is a season or episode.
 * @property {string} showTitle
 * @property {string} seasonId The identifier of the season this item belongs to, if the item is an episode.
 * @property {string} channelShortCode The channel short code, if the item is a channel.
 * @property {boolean} hasClosedCaptions Whether closed captioning is available.
 * @property {number} averageUserRating The average user rating.
 * 	When based on user ratings from our system this will be out of 10.
 * @property {string} badge The badge this item has.
 * @property {string[]} genres The array of genres this item belongs to.
 * @property {string[]} sports The array of sports this item belongs to.
 * @property {number} duration The duration of the media in seconds.
 * @property {string} customId A custom identifier for this item.
 * 	For example the id for this item under a different content system.
 * @property {date} eventStartDate The optional event start date.
 * 	Specific to Event item type.
 * @property {date} eventEndDate The optional event end date.
 * 	Specific to Event item type.
 * @property {date} firstBroadcastDate The optional broadcast date.
 * @property {string} round The optional event round.
 * 	Specific to Event item type.
 * @property {number} sequenceNumber The optional sequence number for event or stage.
 * 	Specific to Event and Stage item types.
 * @property {number} yearStart The optional competition start year
 * 	Specific to Competition item type
 * @property {number} yearEnd The optional competition end year
 * 	Specific to Competition item type
 * @property {string} gender The optional gender.
 * @property {string} country The optional country.
 * @property {string} role The optional role.
 * 	Specific to Persona, Team item types
 * @property {module:types.Offer[]} offers The array of available offers for this item.
 * @property {object} images
 * @property {module:types.Theme[]} themes Gets themes associated with the item
 * @property {object} customFields A map of custom fields defined by a curator for an item.
 * @property {module:types.ItemRelationship[]} relationships The related items with this item
 * @property {string} secondaryLanguageTitle Title of an alternate language.
 */

/**
 * @typedef Language
 * @memberof module:types
 *
 * @property {string} code The ISO language code of the language e.g. "en-US".
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @property {string} label Display label for the language.
 * @property {string} title Display title for the language.
 */

/**
 * @typedef ListData
 * @memberof module:types
 *
 * @property {module:types.ContinueWatchingListData} ContinueWatching
 * @property {module:types.BookmarksListData} Bookmarks
 * @property {module:types.RecommendationsListData} Recommendations
 * @property {module:types.RecommendationsListDataZoom} RecommendationsZoom
 */

/**
 * @typedef MediaFile
 * @memberof module:types
 *
 * @property {string} id The id of the media file.
 * @property {string} name The name of the media file.
 * @property {string} deliveryType The way in which the media file is delivered.
 * @property {string} url The url to access the media file.
 * @property {string} drm The type of drm used to encrypt the media. 'None' if unencrypted.
 * @property {string} drmScheme The type of drm used to encrypt the media. 'None' if unencrypted.
 * @property {string} certificate The base 64 encoded certificate for fair play drm validation.
 * @property {string} format The format the media was encoded in.
 * @property {string} resolution The resolution of the video media.
 * @property {number} width The width of the video media.
 * @property {number} height The height of the video media.
 * @property {number} channels The number of audio channels.
 * @property {string} language The language code for the media, e.g. 'en'.
 * @property {object} subtitles A map of subtitles, where key is language and value is related url.
 * @property {module:types.MediaFileSubtitle[]} subtitlesCollection List of subtitles with additional properties.
 * @property {string} bumper A bumper video url for external providers.
 */

/**
 * @typedef MediaFileSubtitle
 * @memberof module:types
 *
 * @property {string} url The url where subtitles can be accessed.
 * @property {string} languageCode The ISO 639-1 language code.
 * @property {string} language The ISO language name.
 */

/**
 * @typedef NavContent
 * @memberof module:types
 *
 * @property {string} title The title of the embedded navigation content.
 * @property {module:types.ItemList} list An embedded list.
 * @property {string} imageType The image type to target when rendering items of the list.
 *
 * 	e.g wallpaper, poster, hero3x1, logo.
 */

/**
 * @typedef NavEntry
 * @memberof module:types
 *
 * @property {number} depth The depth of the NavEntry (top level is 0)
 * @property {string} label The text label for this nav entry.
 * @property {string} icon The identifier of the icon to be displayed.
 * @property {string} pageId The id of the page.
 * @property {string} path The path this nav entry links to.
 * 	May be undefined if the nav entry is not clickable e.g. a nav heading.
 * 	If the value begins with `http` then it's an external url.
 * @property {module:types.NavContent} content Embedded content to display in a navigation menu.
 * @property {module:types.NavEntry[]} children Child nav entries.
 * @property {boolean} featured True if this is a featured menu item.
 *
 * 	Featured menu items may have a more prominent presentation than others in the navigation.
 * @property {string} type This is for special navigation entries like meRewards.
 * @property {object} customFields A map of custom fields defined by a curator for a nav entry.
 */

/**
 * @typedef Navigation
 * @memberof module:types
 *
 * @property {module:types.NavEntry[]} header The header navigation.
 * @property {module:types.NavEntry} footer The footer navigation.
 * @property {module:types.NavEntry} account The account navigation.
 * @property {module:types.NavEntry} mobile The mobile navigation.
 * @property {string} copyright Copyright information.
 * @property {object} customFields A map of custom fields defined by a curator for navigation.
 * @property {module:types.SocialLinkEntry[]} socialLinks The social links.
 */

/**
 * @typedef Newsletter
 * @memberof module:types
 *
 * @property {string} name The name of the newsletter
 * @property {string} description The description of the newsletter
 * @property {string} shortCode The short code of the newsletter
 * @property {boolean} subscribed Whether the user is subscribed to the newsletter
 * @property {boolean} canSubscribe Whether the user can subscribe to the newsletter
 * @property {string} classification The newsletter classification.
 */

/**
 * @typedef NewslettersSubscriptionRequest
 * @memberof module:types
 *
 * @property {module:types.Newsletter[]} newsletters The newsletter to subscribe/unsubscribe to
 */

/**
 * @typedef NextPlaybackItem
 * @memberof module:types
 *
 * @property {string} sourceItemId The id of the item used to determine the next item to play.
 * @property {date} firstWatchedDate Time when the item corresponding to the itemId passed in by the client was
 * 	first watched by the user. Will be `undefined` if the user has never
 * 	watched the item.
 *
 * 	It can be used to identify the scenario where the user has never watched a
 * 	show and we are suggesting they watch the first episode (i.e. it is
 * 	missing in this scenario)
 *
 * 	**This will only be populated when a `showId` is passed in**
 * @property {date} lastWatchedDate Time when the item corresponding to the itemId passed in by the client was
 * 	last watched by the user. Will be `undefined` if the user has never
 * 	watched the item.
 *
 * 	It can be used to identify the scenario where the user has never watched a
 * 	show and we are suggesting they watch the first episode (i.e. it is
 * 	missing in this scenario)
 *
 * 	**This will only be populated when a `showId` is passed in**
 * @property {string} suggestionType Field indicating the type or reason behind the suggestion.
 *
 * 	Id Type   | Show Watched Status| Value            | Description
 * 	----------|--------------------|------------------|---------------------------------
 * 	showId    | Unwatched          | StartWatching    |
 * 	showId    | Completely watched | RestartWatching  |
 * 	showId    | Partly watched     | ContinueWatching | Suggested episode partly watched
 * 	showId    | Partly watched     | Sequential       | Suggested episode unwatched
 * 	episodeId | Any                | Sequential       | Next episode in show
 * @property {module:types.ItemDetail} next The details of the next item to play.
 *
 * 	If `undefined` then no item was found.
 */

/**
 * @typedef Offer
 * @memberof module:types
 * @extends OfferRights
 *
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {date} startDate
 * @property {date} endDate
 * @property {string} availability
 * @property {string} subscriptionCode The code of the subscription this offer is offered under, if any.
 * @property {object} customFields A map of custom fields defined by a curator for an offer.
 */

/**
 * @typedef OfferRights
 * @memberof module:types
 *
 * @property {string} deliveryType
 * @property {string[]} scopes
 * @property {string} resolution
 * @property {string} ownership
 * @property {number} maxPlays The maximum number of allowed plays.
 * @property {number} maxDownloads The maximum number of allowed downloads.
 * @property {number} rentalPeriod The length of time in minutes which the rental will last once purchased.
 * @property {number} playPeriod The length of time in minutes which the rental will last once played for the first time.
 * @property {module:types.ExclusionRule[]} exclusionRules Any specific playback exclusion rules.
 */

/**
 * @typedef Page
 * @memberof module:types
 * @extends PageSummary
 *
 * @property {module:types.PageMetadata} metadata
 * @property {module:types.PageEntry[]} entries Entries of a page
 * @property {object} customFields A map of custom fields defined by a curator for a page.
 * @property {module:types.ItemDetail} item When the page represents the detail of an item this property will contain the item detail.
 *
 * 	For clients consuming an item detail page, any page row entry of type `ItemDetailEntry`
 * 	should look to obtain its data from the contents of this property.
 *
 * 	*Note that you have to be using feature flag `idp` to enable this
 * 	on item detail pages. See `feature-flags.md` for further details.*
 * @property {module:types.ItemList} list When the page represents the detail of a List this property will contain the list in question.
 *
 * 	For clients consuming a list detail page, any page row entry of type `ListDetailEntry`
 * 	should look to obtain its data from the contents of this property.
 *
 * 	*Note that you have to be using feature flag `ldp` to enable this
 * 	on list detail pages. See `feature-flags.md` for further details.*
 * @property {module:types.Theme[]} themes
 */

/**
 * @typedef PageEntry
 * @memberof module:types
 *
 * @property {string} id The unique identifier for a page entry.
 * @property {string} type The type of PageEntry. Used to help identify what type of content will be presented.
 * @property {string} title The name of the Page Entry.
 * @property {string} template Template type used to present the content of the PageEntry.
 * @property {object} listMeta
 * @property {module:types.ItemSummary} item If 'type' is 'ItemEntry' then this is the item to be represented.
 * @property {module:types.ItemList} list If 'type' is 'ListEntry' or 'UserEntry' then this is the list to be represented.
 * @property {module:types.SubscriptionPlan} plan If 'type' is 'PlanEntry' then this is the subscription plan to be represented.
 * @property {string} text If 'type' is 'TextEntry' then this is the text to be represented.
 * @property {module:types.Person[]} people If 'type' is 'PeopleEntry' then this is the array of people to present.
 * @property {object} customFields A map of custom fields defined by a curator for a page entry.
 * @property {object} images The images for the page entry if any.
 *
 * 	For example the images of an `ImageEntry`.
 */

/**
 * @typedef PageMetadata
 * @memberof module:types
 *
 * @property {string} description
 * @property {string[]} keywords
 */

/**
 * @typedef PageSummary
 * @memberof module:types
 *
 * @property {string} id Unique identifier for the page.
 * @property {string} title Title of the page.
 * @property {string} path Unique path for the page.
 * @property {string} key Key used to lookup a known page.
 * @property {string} template Identifier for of the page template to render this page.
 * @property {boolean} isStatic True if this page is static and doesn't have any dynamic content to load.
 *
 * 	Static pages don't need to go back to the page endpoint to load page content
 * 	instead the page summary loaded with the sitemap should be enough to determine
 * 	the page template type and render based on this.
 * @property {boolean} isSystemPage True if this page is a system page type.
 *
 * 	**DEPRECATED** This property doesn't have any real use in client applications
 * 	anymore so shouldn't be used. It especially shouldn't be used to determine if
 * 	a page is static or not. Use the `isStatic` property instead.
 */

/**
 * @typedef Pagination
 * @memberof module:types
 *
 * @property {string} next Path to load next page of data, or null if not available
 * @property {string} previous Path to load previous page of data, or null if not available.
 * @property {number} page The current page number.
 *
 * 	A value of 0 indicates that the fist page has not yet been loaded. This is
 * 	useful when wanting to return the paging metadata to indicate how to
 * 	load in the first page.
 * @property {number} size The current page size.
 *
 * 	A value of -1 indicates that the size has not yet been determined. This may
 * 	arise when embedding secure list pagination info in a page which must be cached
 * 	by a CDN. For example a Bookmarks list.
 * @property {number} total The total number of pages available given the current page size.
 *
 * 	A value of -1 indicates that the total has not yet been determined. This may
 * 	arise when embedding secure list pagination info in a page which must be cached
 * 	by a CDN. For example a Bookmarks list.
 * @property {module:types.PaginationAuth} authorization The authorization requirements to load a page of items.
 *
 * 	This will only be present on lists which are protected by some form
 * 	of authorization token e.g. Bookmarks, Watched, Entitlements.
 * @property {module:types.PaginationOptions} options Any active list sort and filter options.
 *
 * 	If an option has a default value then it won't be defined.
 */

/**
 * @typedef PaginationAuth
 * @memberof module:types
 *
 * @property {string} type The token type required to load the list.
 * @property {string} scope The token scope required.
 */

/**
 * @typedef PaginationOptions
 * @memberof module:types
 *
 * @property {number} pageSize The number of items to return in a list page.
 * @property {string} order The applied sort order if any.
 * @property {string} orderBy The applied sort ordering property if any.
 * @property {string} maxRating The maximum rating (inclusive) of items returned, e.g. 'AUOFLC-PG'.
 * @property {string} itemType Specific item type filter.
 * @property {string[]} audioLanguages Specific audio language filter.
 * @property {string[]} genres Specific genre filter.
 * @property {boolean} completed Items filtered by whether they've been fully watched or not.
 *
 * 	Only available on the `/account/profile/watched/list` endpoint currently.
 */

/**
 * @typedef PasswordResetEmailRequest
 * @memberof module:types
 *
 * @property {string} email The email address of the primary account profile to reset the password for.
 */

/**
 * @typedef PasswordResetRequest
 * @memberof module:types
 *
 * @property {string} password The new password for the primary account profile.
 */

/**
 * @typedef PaymentMethod
 * @memberof module:types
 *
 * @property {string} id The unique identifier of a payment method.
 * @property {string} description A short description of a payment method.
 *
 * 	If the payment method is of type `Wallet` this will be "My Wallet"
 *
 * 	For `Card` type payment methods the format of this description may differ
 * 	depending on the payment gateway in use. In the case of Stripe, this will
 * 	be in the format "Visa (**** 4242, exp 08/19)"
 * @property {string} type The type of payment method.
 * @property {string} brand The brand of the card if the payment method is a card.
 * @property {number} balance The balance of the wallet if the payment method is a wallet.
 * @property {string} currency The currency code of the wallet if the payment method is a wallet.
 * @property {number} expiryMonth The expiry month of the card if the payment method is a card.
 * @property {number} expiryYear The expiry year of the card if the payment method is a card.
 * @property {string} lastDigits The last digits of the card if the payment method is a card.
 * 	Depending on the payment gateway in use this value may be undefined.
 * @property {boolean} isExpired Indicates whether the payment method has expired.
 * @property {string} name Payment method name
 * @property {string} externalId Payment method external id
 */

/**
 * @typedef PaymentMethods
 * @memberof module:types
 *
 * @property {boolean} rememberCard Indicates whether the user selected remember card for next purchases.
 * @property {module:types.PaymentMethod[]} paymentMethods The list of available payment methods.
 */

/**
 * @typedef Person
 * @memberof module:types
 *
 * @property {string} name The name of the person.
 * @property {string} path The path to the person
 */

/**
 * @typedef Plan
 * @memberof module:types
 *
 * @property {string} id The identifier of a plan.
 * @property {string} title The title of a plan.
 * @property {string} tagline The short tagline for a plan.
 * @property {string} type The type of plan.
 * @property {boolean} isFeatured True if a plan should be highlighted as featured, false if not.
 * @property {boolean} isActive True if a plan is active, false if its retired.
 * @property {boolean} isPrivate True if a plan should not be presented in the primary plan options, false if not.
 * @property {string} revenueType The revenue type a plan targets.
 * @property {string} subscriptionCode The subscription code a plan targets.
 * @property {string} alias An alias for a plan.
 * @property {string[]} benefits The list of benefits to display for a plan.
 * @property {string} billingPeriodType The type of billing period used.
 * @property {number} billingPeriodFrequency Given the `billingPeriodType` this is how frequently it will run. e.g. every 2 weeks.
 * @property {boolean} hasTrialPeriod True if a plan has a trial period, false if not.
 * @property {number} trialPeriodDays How many days a trial period runs for a plan. Only valid if `hasTrialPeriod` is true.
 * @property {string} termsAndConditions The terms and conditions for a plan.
 * @property {number} price The price of a plan. If a free plan then undefined.
 * @property {string} currency The currency a plan is offered in.
 * @property {object} customFields A map of custom fields defined by a curator for a plan.
 */

/**
 * @typedef PlanPurchase
 * @memberof module:types
 *
 * @property {string} id The identifier of the purchased plan.
 * @property {number} price The price of the purchased plan.
 * @property {string} subscriptionId The identifier of the subscription membership to the plan.
 * @property {string} title The title of the purchased plan.
 * @property {string} type The type of plan purchased.
 */

/**
 * @typedef PlaybackTokenRequest
 * @memberof module:types
 *
 * @property {string} pin The pin of the account
 */

/**
 * @typedef PostalCodeAddress
 * @memberof module:types
 *
 * @property {string} building The name for the building
 * @property {string} block The number of the block
 * @property {string} street The name of the street
 */

/**
 * @typedef PricePlan
 * @memberof module:types
 *
 * @property {string} id The unique identifier for price plan.
 * @property {string} productId The subscription external id.
 * @property {number} price The cost of price plan.
 * @property {string} currency The currency of price plan price.
 * @property {string} name The name of price plan.
 * @property {string} termsAndConditions The terms and conditions associated with price plan.
 * @property {string} label The label of price plan.
 * @property {string} priceText1 The price text (1).
 * @property {string} priceText2 The price text (2).
 * @property {string} priceText3 The price text (3).
 * @property {string} bonusText1 The bonus text (1).
 * @property {string} bonusText1Link The bonus text link (1).
 * @property {string} bonusText2 The bonus text (2).
 * @property {string} bonusText2Link The bonus text link (2).
 * @property {boolean} isRenewable Indicates whether the price plan is renewable.
 * @property {string[]} allowedPaymentMethods The allowed payment methods in the list
 */

/**
 * @typedef PricePlanPrice
 * @memberof module:types
 *
 * @property {string} id The unique identifier for price plan.
 * @property {number} price The cost of price plan.
 * @property {number} discountedPrice The discounted cost of price plan.
 * @property {string} currency The currency of price plan price.
 */

/**
 * @typedef ProfileCreationRequest
 * @memberof module:types
 *
 * @property {string} name The unique name of the profile.
 * @property {boolean} isRestricted Whether an account pin is required to enter the profile.
 *
 * 	If no account pin is defined this has no impact.
 * @property {boolean} purchaseEnabled Whether the profile can make purchases with the account payment options.
 * @property {string[]} segments The segments a profile should be placed under
 * @property {string} languageCode The code of the preferred language for the profile.
 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
 * 	one of the languages specified in the app config.
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @property {string} audioLanguage The preferred audio language for the profile.
 * @property {string} subtitleLanguage The preferred subtitle language for the profile.
 * @property {string} minRatingPlaybackGuard The classification rating defining the minimum rating level a user should be
 * 	forced to enter the account pin code for playback. Anything at this rating
 * 	level or above will require the pin for playback.
 *
 * 	e.g. AUOFLC-MA15+
 *
 * 	If you want to disable this guard pass an empty string or `null`.
 * @property {module:types.ProfileRecommendationSettings} recommendationSettings The settings for recommendation engine.
 * @property {string} downloadVideoQuality The quality of a video.
 */

/**
 * @typedef ProfileDetail
 * @memberof module:types
 * @extends ProfileSummary
 *
 * @property {object} watched A map of watched itemIds => last watched position
 * @property {object} rated A map of rated itemIds => rating out of 10
 * @property {object} bookmarked A map of bookmarked itemIds => created date
 * @property {object} followed A map of followed itemIds => created date
 */

/**
 * @typedef ProfileDisableProfilePlaybackGuardRequest
 * @memberof module:types
 *
 * @property {string} pin The account parental pin
 */

/**
 * @typedef ProfileRecommendationSettings
 * @memberof module:types
 *
 * @property {string[]} genreAliases The cold start genre selection for recommendation engine.
 * @property {string[]} credits The cold start credit selection for recommendation engine.
 * @property {string[]} languages The cold start audio language selection for recommendation engine.
 */

/**
 * @typedef ProfileSummary
 * @memberof module:types
 *
 * @property {string} id The id of the profile.
 * @property {string} name The unique name of the profile.
 * @property {boolean} isRestricted Whether a pin is required to enter the profile.
 * @property {boolean} purchaseEnabled Whether the profile can make purchases with the account payment options.
 * @property {string} color Hex color value assigned to the profile.
 * @property {string[]} segments The segments a profile has been placed under
 * @property {module:types.ClassificationSummary} maxRatingContentFilter The maximum rating (inclusive) of content to return in feeds.
 *
 * 	**DEPRECATED** - It's no longer recommended filtering content globally as apps can end up
 * 	with pages without content, even the homepage. Instead using features like segmentation
 * 	tags to target demographics like kids means content curation can be more thought out.
 * @property {module:types.ClassificationSummary} minRatingPlaybackGuard The minumum rating (inclusive) of content where an account pin should be presented before entring playback.
 * @property {string} languageCode The code of the preferred language for the profile.
 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
 * 	one of the languages specified in the app config.
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @property {string} audioLanguage The preferred audio language for the profile.
 * @property {string} subtitleLanguage The preferred subtitle language for the profile.
 * @property {module:types.ProfileRecommendationSettings} recommendationSettings The settings for recommendation engine.
 * @property {string} downloadVideoQuality The quality of a video.
 */

/**
 * @typedef ProfileTokenRequest
 * @memberof module:types
 *
 * @property {string} profileId The id of the profile the token should grant access rights to.
 * @property {string} pin The pin of the account
 * @property {string[]} scopes The scope(s) of the token(s) required.
 * @property {string} cookieType If you specify a cookie type then a content filter cookie will be returned
 * 	along with the token(s). This is only intended for web based clients which
 * 	need to pass the cookies to a server to render a page based on the user's
 * 	content filters e.g subscription code.
 *
 * 	If type `Session` the cookie will be session based.
 * 	If type `Persistent` the cookie will have a medium term lifespan.
 * 	If undefined no cookies will be set.
 */

/**
 * @typedef ProfileUpdateRequest
 * @memberof module:types
 *
 * @property {string} name The unique name of the profile.
 * @property {boolean} isRestricted Whether an account pin is required to enter the profile.
 *
 * 	If no account pin is defined this has no impact.
 * @property {boolean} purchaseEnabled Whether the profile can make purchases with the account payment options.
 * @property {string[]} segments The segments a profile should be placed under
 * @property {string} languageCode The code of the preferred language for the profile.
 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
 * 	one of the languages specified in the app config.
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @property {string} audioLanguage The preferred language for audio
 * @property {string} subtitleLanguage The preferred language for audio
 * @property {string} minRatingPlaybackGuard The classification rating defining the minimum rating level a user should be
 * 	forced to enter the account pin code for playback. Anything at this rating
 * 	level or above will require the pin for playback.
 *
 * 	e.g. AUOFLC-MA15+
 *
 * 	If you want to disable this guard, call `DELETE /account/profiles/{id}/playback-guard`.
 * @property {module:types.ProfileRecommendationSettings} recommendationSettings The settings for recommendation engine.
 * @property {string} downloadVideoQuality The quality of a video.
 */

/**
 * @typedef Purchase
 * @memberof module:types
 *
 * @property {string} id The identifier of the purchase.
 * @property {string} title The title of the purchase.
 * @property {date} authorizationDate The date the purchase was authorized.
 * @property {number} total The total cost of the purchase.
 * @property {string} currency The currency code used to make the purchase.
 */

/**
 * @typedef PurchaseExtended
 * @memberof module:types
 *
 * @property {string} id The identifier of the purchase.
 * @property {string} title The title of the purchase.
 * @property {date} authorizationDate The date the purchase was authorized.
 * @property {module:types.PaymentMethod} paymentMethod Payment method which was used to complete the purchase.
 * @property {number} total The total cost of the purchase.
 * @property {string} currency The currency code used to make the purchase.
 */

/**
 * @typedef PurchaseItems
 * @memberof module:types
 *
 * @property {number} size The total number of items.
 * @property {module:types.Purchase[]} items A list of purchases.
 * @property {module:types.Pagination} paging
 */

/**
 * @typedef PurchaseItemsExtended
 * @memberof module:types
 *
 * @property {number} size The total number of items.
 * @property {module:types.PurchaseExtended[]} items A list of purchases with more details including payment method.
 * @property {module:types.Pagination} paging
 */

/**
 * @typedef PurchaseReceiptRequest
 * @memberof module:types
 *
 * @property {string} subscriptionId The identifier of the subscription membership to the plan.
 * @property {string} provider The payment gateway name for the In-App billing service to be used.
 * @property {string} receiptId A unique identifier that was provided by the In-App billing service to validate the purchase.
 */

/**
 * @typedef PurchaseRequest
 * @memberof module:types
 *
 * @property {string} subscriptionId The identifier of the subscription membership to the plan.
 * @property {string} paymentType The type of a payment.
 * @property {string} promocode
 * @property {string} paymentMethodId
 */

/**
 * @typedef PurchaseResponse
 * @memberof module:types
 *
 * @property {string} paymentUrl The url to redirect.
 * @property {string} sessionData Session data of purchase.
 * @property {string} sessionId Id of purchase.
 */

/**
 * @typedef PurchaseVerifyRequest
 * @memberof module:types
 *
 * @property {string} redirectResult Redirection result after an Adyen payment is made.
 * 	Used to verify the payment result.
 */

/**
 * @typedef PurchaseVerifyResponse
 * @memberof module:types
 *
 * @property {string} status The status of purchase.
 * @property {string} resultCode The result code of purchase.
 */

/**
 * @typedef RecommendationSettingsUpdateRequest
 * @memberof module:types
 *
 * @property {string[]} genreAliases The cold start genre selection for recommendation engine.
 * @property {string[]} itemIds The cold start item selection for recommendation engine.
 */

/**
 * @typedef RecommendationsListData
 * @memberof module:types
 *
 * @property {object} itemInclusions Object where keys are itemIds for the items in the list and values are objects
 * 	containing additional information of items like click tracking URLs.
 */

/**
 * @typedef RecommendationsListDataExpansion
 * @memberof module:types
 *
 * @property {string} clickUrl The cxense click url.
 * @property {string} clickImage The cxense click image.
 */

/**
 * @typedef RecommendationsListDataExpansionZoom
 * @memberof module:types
 *
 * @property {string} clickThroughUrl The ZOOM click through url.
 * @property {string} clickUrl The ZOOM click url.
 */

/**
 * @typedef RecommendationsListDataZoom
 * @memberof module:types
 *
 * @property {object} itemInclusions Object where keys are itemIds for the items in the list and values are objects
 * 	containing additional information of items like click tracking URLs.
 */

/**
 * @typedef RegistrationRequest
 * @memberof module:types
 *
 * @property {string} deviceId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 * @property {string} dateOfBirth
 * @property {boolean} termsCondition
 * @property {string[]} newsletters Newsletter shortcodes from `/newsletters` endpoint.
 * @property {string} gender
 * @property {string} pin The pin used for parental control
 * @property {string[]} segments The segments to apply to the primary profile.
 * @property {string} languageCode The code of the preferred language for the primary profile.
 * 	Must be a valid ISO language code e.g. "en-US" and must match the code of
 * 	one of the languages specified in the app config.
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */

/**
 * @typedef Reminder
 * @memberof module:types
 *
 * @property {string} id The unique identifier.
 * @property {module:types.ItemSchedule} schedule The name for this reminder's asset.
 * @property {module:types.ItemSummary} channel The ItemSchedule custom id.
 */

/**
 * @typedef ReminderRequest
 * @memberof module:types
 *
 * @property {string} customId The asset Id for the reminder.
 */

/**
 * @typedef RewardsInfo
 * @memberof module:types
 *
 * @property {module:types.RewardsInfoItem} RewardPoints The meReward points.
 * @property {module:types.RewardsInfoItem} RewardCashback The meRewards cashback.
 * @property {module:types.RewardsInfoItem} RewardCoupons The meRewards coupons.
 * @property {module:types.RewardsInfoItem} RewardSurvey The meRewards survey.
 * @property {module:types.RewardsInfoItem} RewardTransactions The meRewards transcations.
 */

/**
 * @typedef RewardsInfoItem
 * @memberof module:types
 *
 * @property {string} url The meRewards item url.
 * @property {number} value The meRewards item value.
 */

/**
 * @typedef ScheduleItemSummary
 * @memberof module:types
 *
 * @property {string} watchPath The path to watch this item, if the item is a watchable type, e.g. a `movie`, `program` and `episode`.
 * 	If VOD item is not available then empty.
 * @property {string} path The path to the detail page of this item. Can be used to load the item detail page via the /page endpoint.
 * 	If VOD item is not available then empty.
 * @property {string} title The display title of the item.
 * @property {string} description A description of the item.
 * @property {string} broadcastChannel The name of the channel.
 * @property {string} category The program category.
 * @property {module:types.ClassificationSummary} classification The classification rating of this item.
 * @property {string} genreCode The program genre code.
 * @property {string} prdNumber The program prd_number.
 * @property {date} broadcastChannelStart The broadcast channel start.
 * @property {boolean} blackout Whether the item is blackout.
 * @property {string} blackoutMessage The blackout message.
 * @property {boolean} enableCatchUp Whether catch up is enabled for this item.
 * @property {boolean} enableStartOver Whether start over is enabled for this item.
 * @property {boolean} enableStartOverV2 Whether start over is enabled for this item.
 * @property {boolean} enableSeeking Whether trick play/seeking is enabled for this item.
 * @property {string} programSource For old CTVs does not support DRM, blackout will be based on programSource flag.
 * @property {string} masterReferenceKey The master reference key
 * @property {string} simulcast For web, mobile app, new CTVs, hbbTV, blackout will be based on Simulcast flag.
 * @property {string} id Unique identifier for a VOD Item
 * @property {object} images images from VOD item if EPG-VOD link exists or fallback images otherwise.
 * @property {string} type The type of item.
 * @property {number} seasonNumber The number of a season, if the item is a season.
 * @property {number} episodeNumber The number of an episode, if the item is an episode.
 * @property {string} episodeTitle The title of an episode.
 * @property {string} secondaryLanguageTitle Title of an alternate language.
 * @property {string} url Url metadata of the schedule item.
 * @property {string} taxonomyTier1 TaxonomyTier1 metadata of the schedule item.
 * @property {string} taxonomyTier2 TaxonomyTier2 metadata of the schedule item.
 */

/**
 * @typedef SearchListQueryOptions
 * @memberof module:types
 *
 * @property {string} term
 * @property {string} max_rating
 * @property {string} item_types
 * @property {string} item_sub_types
 * @property {string} exclude_item_sub_types
 * @property {string} device
 * @property {string} sub
 * @property {string} segments
 * @property {string} ff
 * @property {string} lang
 */

/**
 * @typedef SearchListsResult
 * @memberof module:types
 *
 * @property {module:types.ItemList} list The ItemList containing the requested search query results.
 */

/**
 * @typedef SearchListsResults
 * @memberof module:types
 *
 * @property {module:types.SearchListsResult[]} data An array of search query results
 */

/**
 * @typedef SearchResults
 * @memberof module:types
 *
 * @property {string} term The search term.
 * @property {string} itemAudioLanguage Applied item audio language filter.
 *
 * 	Missing value mean the filter was not applied.
 * @property {number} total The total number of results.
 * @property {module:types.ItemList} items The list of all items relevant to the search term.
 *
 * 	If this is present then the `movies` and `tv` lists won't be.
 * @property {module:types.ItemList} movies The list of movie items relevant to the search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} tv The list of tv items (shows + programs) relevant to the search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} extras The list of extras items (programs of subtype ProgramExtra) relevant to the search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} sports The list of sports items (shows of subtype SportsEventSeries) relevant to the search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} other The list of other items (`customAsset`s) relevant to the search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.Person[]} people The list of people (credits only) relevant to the search term.
 * @property {module:types.ItemList} persons The list of persons relevant to the search term.
 *
 * 	The list is returned only when `sv2` feature flag is set and it
 * 	contains `Persona` and `Credit` item types.
 * @property {module:types.ItemList} events The list of events relevant to search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} competitions The list of competitions relevant to search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} teams The list of teams relevant to search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} confederations The list of confederations relevant to search term.
 *
 * 	If this is present then the `items` list won't be.
 * @property {module:types.ItemList} newsHighlights The list of news and highlights relevant to search term.
 * 	This list may include different asset types, and will build based on asset subtype value
 *
 * 	If this is present then the `items` list won't be.
 */

/**
 * @typedef SeasonInfo
 * @memberof module:types
 *
 * @property {string} id Season id
 * @property {number} seasonNumber Season number
 * @property {number} episodeCount Episode count of this season
 */

/**
 * @typedef ServiceError
 * @memberof module:types
 *
 * @property {string} message A description of the error.
 * @property {number} code An optional code classifying the error. Should be taken in the context of the http status code.
 * @property {string} source A source of the error.
 */

/**
 * @typedef SettingsTokenRequest
 * @memberof module:types
 *
 * @property {string} oneTimePassword The Mediacorp OTP
 */

/**
 * @typedef ShowEpisodesResponse
 * @memberof module:types
 *
 * @property {string} id The id of this list
 * @property {module:types.SeasonInfo[]} seasons The seasons information
 * @property {string} path The path of this list
 * @property {number} size The total size of the list
 * @property {module:types.ItemSummary[]} items A list of items
 * @property {module:types.Pagination} paging Metadata describing how to load the next or previous page of the list
 */

/**
 * @typedef SingleSignOnRequest
 * @memberof module:types
 *
 * @property {string} provider The third party single-sign-on provider.
 * @property {string} socialProvider The social provider specification when token was generated directly with Mediacorp API
 * 	using either https://ssoapi.mediacorp.sg/#signin-using-a-google-account or
 * 	https://ssoapi.mediacorp.sg/#signin-using-a-facebook-account
 * @property {string} token A token from the third party single-sign-on provider e.g. an identity token from Facebook.
 * @property {string[]} scopes The scope(s) of the tokens required.
 * 	For each scope listed an Account and Profile token of that scope will be returned.
 * @property {string} deviceId Device unique identifier
 * @property {string} cookieType If you specify a cookie type then a content filter cookie will be returned
 * 	along with the token(s). This is only intended for web based clients which
 * 	need to pass the cookies to a server to render a page based on the user's
 * 	content filters e.g subscription code.
 *
 * 	If type `Session` the cookie will be session based.
 * 	If type `Persistent` the cookie will have a medium term lifespan.
 * 	If undefined no cookies will be set.
 * @property {boolean} linkAccounts When a user attempts to sign in using single-sign-on, we may find an account created
 * 	previously through the manual sign up flow with the same email. If this is the
 * 	case then an option to link the two accounts can be made available.
 *
 * 	If this flag is set to true then accounts will be linked automatically.
 *
 * 	If this flag is not set or set to false and an existing account is found
 * 	then an http 401 with subcode `6001` will be returned. Client apps can then present the
 * 	option to link the accounts. If the user decides to accept, then the same call
 * 	can be repeated with this flag set to true.
 */

/**
 * @typedef SocialLinkEntry
 * @memberof module:types
 *
 * @property {string} link link url
 * @property {string} title link title.
 * @property {object} images
 */

/**
 * @typedef SsoDeviceRegistration
 * @memberof module:types
 *
 * @property {string} message The message for device registration.
 */

/**
 * @typedef SsoDeviceRegistrationRequest
 * @memberof module:types
 *
 * @property {string} id The unique identifier for this device e.g. serial number.
 * @property {string} type The type for this device e.g. web, mobile, tv, others.
 * @property {string} name A human recognisable name for this device.
 * @property {string} manufacturer Manufacturer for this device.
 * @property {string} model Model for this device.
 * @property {string} os OS for this device.
 * @property {string} browser Browser.
 */

/**
 * @typedef Subscription
 * @memberof module:types
 *
 * @property {string} code The unique subscription code.
 * @property {date} startDate The start date of a subscription.
 * @property {date} endDate The end date of a subscription.
 *
 * 	After this date the subscription will become expired. If this is a recurring
 * 	subscription which has not been cancelled then the account holder will be
 * 	automatically charged and a new subscription will be activated.
 *
 * 	Some subscriptions may not have an end date, in which case this
 * 	property will not exist.
 * @property {boolean} isTrialPeriod True if a subscription is in its trial period, false if not.
 * @property {string} planId The plan a subscription belongs to.
 * @property {string} status The status of a subscription.
 */

/**
 * @typedef SubscriptionDetail
 * @memberof module:types
 * @extends Subscription
 *
 * @property {string} id Unique identifier for the subscription.
 * @property {boolean} isRenewable True if a subscription is renewable and not one-off.
 * @property {boolean} isCancellationEnabled True if a subscription is can be cancelled.
 * @property {date} nextRenewalDate The date of next renewal.
 * @property {string} image Subscription image.
 * @property {string} name Subscription name.
 * @property {string} description Subscription description.
 * @property {boolean} canResubscribe True if a subscription can be resumed
 * @property {string} paymentMethod The payment method
 * @property {string} purchaseId The identifier of purchase
 * @property {number} recurringCost The recurring cost
 * @property {string} currency The recurring cost currency
 */

/**
 * @typedef SubscriptionPlan
 * @memberof module:types
 *
 * @property {string} externalId The external ID.
 * @property {string} description The description of subscription plan.
 * @property {string} packageHeaderText1 The package header text (1).
 * @property {string} packageHeaderText2 The package header text (2).
 * @property {string} packageHeaderText3 The package header text (3).
 * @property {string} bonusText1 The bonus text (1).
 * @property {string} bonusText1Link The bonus text link (1).
 * @property {string} bonusText2 The bonus text (2).
 * @property {string} bonusText2Link The bonus text link (2).
 * @property {module:types.PricePlan[]} pricePlans List of available subscription plans (from Kaltura).
 * @property {string[]} conflictingPlans List of conflicting plan ids.
 */

/**
 * @typedef Theme
 * @memberof module:types
 *
 * @property {module:types.ThemeColor[]} colors The list of colors defined for the theme.
 * @property {string} type The type of theme.
 */

/**
 * @typedef ThemeColor
 * @memberof module:types
 *
 * @property {string} name The name of the theme color.
 * @property {number} opacity The opacity of the theme color from 0 to 1.
 *
 * 	When omitted, no opacity level is to be applied to the color, or in other words we
 * 	assume the color has an opacity of 1
 * @property {string} value The hex value of the theme color.
 */

/**
 * @typedef TokenRefreshRequest
 * @memberof module:types
 *
 * @property {string} token The token to refresh.
 * @property {string} cookieType If you specify a cookie type then a content filter cookie will be returned
 * 	along with the token(s). This is only intended for web based clients which
 * 	need to pass the cookies to a server to render a page based on the user's
 * 	content filters e.g subscription code.
 *
 * 	If type `Session` the cookie will be session based.
 * 	If type `Persistent` the cookie will have a medium term lifespan.
 * 	If undefined no cookies will be set.
 */

/**
 * @typedef UserExistsRequest
 * @memberof module:types
 *
 * @property {string} username
 */

/**
 * @typedef UserExistsResult
 * @memberof module:types
 *
 * @property {boolean} value True if username is already registered, false if not.
 * @property {string} message Additional information for user, such as user deleted.
 */

/**
 * @typedef UserRating
 * @memberof module:types
 *
 * @property {string} itemId The id of the item rated.
 * @property {number} rating The rating out of 10
 */

/**
 * @typedef VerifyPromoCodeRequest
 * @memberof module:types
 *
 * @property {string} promocode
 */

/**
 * @typedef VerifyPromoCodeResult
 * @memberof module:types
 *
 * @property {number} price Price of the subscription plan after application of promo code.
 */

/**
 * @typedef VerifyRecaptchaRequest
 * @memberof module:types
 *
 * @property {string} response The user response token provided by the reCAPTCHA client-side integration.
 * @property {number} type The type of reCAPTCHA type. Checkbox = 1, invisible = 2.
 */

/**
 * @typedef VerifyRecaptchaResult
 * @memberof module:types
 *
 * @property {boolean} success True if verify successfully, false if not.
 * @property {string[]} errorCodes Error codes if fail to verify.
 */

/**
 * @typedef Watched
 * @memberof module:types
 *
 * @property {string} itemId The id of the item watched.
 * @property {number} position The last playhead position watched for the item.
 * @property {date} firstWatchedDate
 * @property {date} lastWatchedDate
 * @property {boolean} isFullyWatched True - if the item is fully watched, False - otherwise.
 */

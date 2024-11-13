type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Global variable.
 * True when in development mode.
 */
declare const _DEV_: boolean;

/**
 * Global variable.
 * True when in tv mode.
 */
declare const _TV_: boolean;

/**
 * Global variable.
 * Disable animations.
 */
declare const _NO_CSS_TRANSITION_: boolean;

/**
 * Global variable.
 * True when res is 1080p.
 */
declare const _FHD_: boolean;

/**
 * Global variable.
 * True if need to discover client service
 */
declare const _DISCOVER_: string;

/**
 * Global variable.
 * TV performance measurement
 */
declare const _PERF_: Redux.Middleware;

/**
 * Global variable.
 * True when in qa mode.
 */
declare const _QA_: boolean;

/**
 * Global variable.
 * True when running on the server.
 */
declare const _SERVER_: boolean;

/**
 * Global variable.
 * True when server side rendering.
 */
declare const _SSR_: boolean;

declare const _BRAND_NAME_: string | undefined;

declare const ReactIntlLocaleData: any;

declare const System: {
	import: (val: string) => Promise<any>;
};

declare type ClientService = {
	name?: string;
	internal?: boolean;
	rocket: string;
	rocketCDN: string;
	description?: string;
};

/**
 * Application Theme
 *
 * Defines the basic aesthetics of the page shell, agnostic of
 * the content contained within each page.
 */
type AppTheme = 'default' | 'auth' | 'registration' | 'account' | 'profiles' | 'watch';

type NotificationPosition = 'top' | 'bottom';

interface PassiveNotificationConfig {
	className?: string;
	content: string | React.ReactElement<any>;
	position?: NotificationPosition;
}

/**
 * Global variable.
 * Cast namespace to interact with Chromecast API
 */
declare const cast: any;

/**
 * Global variable.
 * Chrome namespace to interact with Chromecast API
 */
declare const chrome: any;

// Redux App State

interface ModalConfig {
	// uniquely identifies the modal so it can be closed again
	id: string | number;
	// The type of modal to be shown
	type: string;
	// Called when background is clicked and the modal is to be closed
	onClose?: () => void;
	// Disables the close on background click
	disableAutoClose?: boolean;
	// The element to be rendered in the event modal type custom is selected
	element?: React.ReactElement<any>;
	componentProps?: {
		// The children to be shown on the template of the type given
		children?: any;
		// Any other modal properties to be passed
		// to the component
		[x: string]: any;
	};
	enableScroll?: boolean;
	target?: 'app' | 'player' | 'linearPlayer';
	transparentOverlay?: boolean;
}

// Redux App State
declare namespace state {
	interface Root {
		app: App;
		cache: Cache;
		page: Page;
		list: List;
		session: Session;
		account?: Account;
		profile: Profile;
		schedule: Schedule;
		search: Search;
		player: Player;
		purchase: Purchase;
		paymentMethod: PaymentMethod;
		uiLayer: UILayerState;
		notifications?: Notifications;
	}

	interface ModalDescription {
		id: string;
		contents: React.ComponentClass<any>;
		parameters: any;
	}

	interface AppBgImageData {
		sources?: image.Source[];
		appWallpaperCssModifier?: string; // The value is applied as a BEM modifier for '.app-background' (e.g. '.app-background--dh1')
	}

	interface AppBGImagePrimaryData {
		label?: string;
		type?: string | undefined;
		onClick?: () => void;
		data?: api.ItemDetail;
	}

	interface AppPrimaryData {
		primaryData?: AppBGImagePrimaryData;
	}

	interface Header {
		positionTop?: number;
		height?: number;
		positionTrackingEnabled?: boolean;
	}

	interface App {
		primaryData?: AppPrimaryData;
		i18n: I18n;
		config: Config;
		contentFilters: ContentFilters;
		clientSide?: boolean;
		retainShowDetailScroll: boolean;
		online: boolean;
		erroredActions: Action<any>[];
		chunkLoading?: boolean;
		backgroundImage?: AppBgImageData;
		theme?: AppTheme;
		header?: Header;
		countryCode: string;
	}

	interface I18n {
		lang: string;
		strings: { [id: string]: string };
		stringsLocale: string;
		languages: Array<api.Language>;
		loading: boolean;
	}

	interface Config extends api.AppConfig {
		sitemapByTemplate?: { [key: string]: api.PageSummary[] };
		sitemapByKey?: { [key: string]: api.PageSummary };
	}

	interface ContentFilters {
		sub?: string;
		maxRating?: string;
		device: string;
		accountSegments?: string[];
		profileSegments?: string[];
		/**
		 * A sorted array of account and profile segments with any duplicates removed.
		 */
		segments?: string[];
	}
	interface Filters {
		audio?: string;
		genres?: string;
		rating?: string;
		sorting?: string;
	}

	interface Page {
		history: PageHistory;
		loading?: boolean;
		requestBackNavigation: string | undefined;
		savedState: any;
		showPageNotFound?: boolean;
		subscriptionEntryPoint?: string;
	}

	interface PageHistory {
		filters: Filters;
		filtersSize: number;
		entries: PageHistoryEntry[];
		index: number;
		location: HistoryLocation;
		pageSummary: api.PageSummary;
	}

	interface PageHistoryEntry {
		state: any;
		path: string;
		key: string;
		index: number;
	}

	interface List {
		/**
		 * A lookup of actively loading item list pages.
		 *
		 * Key is the `list.key`.
		 * Value is an array of item list page numbers currently loading for that list.
		 */
		loading: ListsLoadingMap;
	}

	type ListsLoadingMap = { [key: string]: number[] };

	interface Cache {
		page: { [path: string]: api.PageSummary | api.Page };
		list: { [id: string]: ListCache };
		itemDetail: { [id: string]: ItemDetailCache };
		nextItem: { [id: string]: NextItemCache };
		search: SearchCache;
		enhanceSearch?: { [id: string]: ListCache };
		pathHistory: string[];
		index?: number;
	}

	interface UILayerState {
		modals: { [key: string]: Array<ModalConfig> };
		passiveNotification?: PassiveNotificationConfig;
		showContent: boolean;
		isBannerVisible: boolean;
		sharedSocialPlatform: string;
	}

	interface Notifications {
		show: boolean;
		entries: api.PageEntry[];
		position: NotificationPosition;
	}

	interface SearchCache {
		/**
		 * A list/queue of recent grouped search results. Oldest at index 0.
		 *
		 * This list will be restriced in size with oldest ones being expelled
		 * if limit breached.
		 *
		 * If a search already exists it will be moved to the top if searched again.
		 */
		recentResults: api.SearchResults[];

		/**
		 * A list/queue of recent ungrouped search results. Oldest at index 0.
		 *
		 * This list will be restriced in size with oldest ones being expelled
		 * if limit breached.
		 *
		 * If a search already exists it will be moved to the top if searched again.
		 */
		recentResultsUngrouped: api.SearchResults[];

		/**
		 * The resolved path to the search page.
		 */
		pagePath?: string;
	}

	interface ListCache {
		pageRefs: string[];
		list: api.ItemList;
		updateTime?: number;
	}

	interface ItemDetailCache {
		pageRefs: string[];
		childIds?: string[];
		item: api.ItemDetail;
	}

	interface NextItemCache {
		checked: boolean;
		item: api.ItemDetail;
		suggestionType: string;
	}

	interface Session {
		authPrompts?: AuthPrompt[];
		tokens: api.AccessToken[];
		remember?: boolean;
		profileSelected?: boolean;
		showLoading?: boolean;
		filters: {};
		itemListingTracking?: ItemListingTracking;
		refreshInProgress?: boolean;
		ssoTokenEnc?: string;
		ssoTokenEncError?: boolean;
		cxRandomId?: string;
	}

	interface Account {
		sendingVerification: boolean;
		active: boolean;
		info?: api.Account;
		profile?: api.ProfileDetail;
		paymentMethods?: api.PaymentMethod[];
		paymentData?: api.PaymentMethods;
		updating: boolean;
		updateError: boolean;
		loading?: boolean;
		purchases?: {
			items: api.PurchaseExtended[];
			size?: number;
			paging?: api.Pagination;
		};
		purchasesLoaded?: boolean;
		deviceInfo: {
			maxRegistered: any;
			devices: api.Device[];
			isLoaded: boolean;
		};
		subscriptionDetails: api.SubscriptionDetail[];
		ssoFormMounted?: boolean;
		selectedPricePlan?: api.PricePlan;
		adyenSession?: api.PurchaseResponse;
		maintenanceMode?: boolean;
	}

	interface MCAccount {
		first_name: string;
		last_name: string;
		username: string;
		password: string;
		terms_condition: boolean;
		is_subscribed: boolean;
		gender?: string;
	}

	interface ContinueWatchingState {
		/**
		 * Current state of Continue Watching page.
		 * To prevent prop drilling of CW components and directly
		 * inform CWItem of page state changes
		 */
		deleteList: api.ItemSummary[];
		editList?: api.ItemSummary[];
		editMode?: boolean;
	}

	interface Profile {
		info?: api.ProfileDetail;
		watchedUpdateTime?: number;
		pendingAction: ProfilePendingAction;
		reminders: api.Reminder[];
		attemptedLoginUserName: string;
		continueWatching?: ContinueWatchingState;
	}

	interface ProfilePendingAction {
		type: ProfileActionType;
		args: any[];
	}

	type ProfileActionType = 'rate' | 'bookmark';

	interface Search {
		recentSearches?: string[];
	}

	interface PlayerItem {
		site: string;
		item?: api.ItemSummary;
		data?: api.MediaFile[];
		error?: any;
		relatedItems?: api.ItemList;
		nextItem?: api.ItemDetail;
		nextItemError?: boolean;
	}

	type CastConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected' | 'No devices';

	interface CastStatus {
		connectionStatus: CastConnectionStatus;
		noDevice: boolean;
		castDevice: string;
		showIntroduction: boolean;
	}

	interface MediaResponse {
		media?: api.MediaFile[];
		error?: api.MediaFileError | string;
	}

	interface Player {
		players: {
			[playerSite: string]: PlayerItem;
		};
		volume: number;
		thumbnailVisible: boolean;
		realVideoPosition: {
			[itemId: string]: number;
		};
		isInitialised: boolean;
		isMuted: boolean;
		muteInteraction: boolean;
		cast: CastStatus;
		channelSelectorVisible: boolean;
		startover: boolean;
		startoverProgram?: api.ItemSchedule | undefined;
		customId?: number;
		limitationError?: object | undefined;
		activeSubtitleLang: string;
		selectedPlaybackSpeed: number;
		tokenClassification: string;
		currentTime: number;
		startTime?: Date;
		isSessionValid: boolean;
		sessionExpiredTimeout?: undefined;
		iOSExpiryTimestamp?: undefined;
		xt1ChainPlayList?: number | string;
		chainPlayOrigin?: string;
		entryId?: string;
		entryPoint?: string;
		playedAudioLang?: PlayerTrackInformation;
		playedSubtitleLang?: PlayerTrackInformation;
		playedTrackSpeed?: PlayerPlaybackRateInformation;
		videoQuality?: string;
	}

	interface PlayerPlaybackRateInformation {
		id: number;
		label: string;
		value: number;
	}

	interface PlayerTrackInformation {
		id: number | string;
		lang: string;
		label: string;
		active: boolean;
	}

	interface PaymentMethod {
		loading?: boolean;
		paymentMethods?: Array<api.PaymentMethod>;
	}

	interface Purchase {
		loading?: boolean;
		purchases?: api.PurchaseExtended[];
	}

	interface ChannelScheduleInfo {
		list: api.ItemSchedule[];
		contextLimit: number;
		loading: boolean;
	}

	interface Schedule {
		[channelId: string]: ChannelScheduleInfo;
	}

	interface Analytics {
		events: AnalyticsEvent[];
	}

	interface AnalyticsEvent {
		event: string;
		data: AnalyticsEventData;
	}

	interface AnalyticsEventData {
		path: string;
		type: 'Page' | 'Video';
	}
}

type RenderEntryType = React.Component<any, any> | JSX.Element;

interface ItemDetailWithLoading extends api.ItemDetail {
	loading: boolean;
}
/**
 * Properties passed into a Page component.
 */
interface PageProps extends api.Page {
	/**
	 * Used to store state for restoring a page to its previous state when returning to it.
	 * e.g. A page entry scroll position.
	 */
	savedState: any;
	/**
	 * True when page is loading, false if loaded.
	 */
	loading: boolean;
	/**
	 * Renders all row entries on the page.
	 */
	renderEntries: (entryProps?: any) => RenderEntryType[];
	/**
	 * Renders individual row entries on the page.
	 */
	renderEntry: (entry: api.PageEntry, index: number, entryProps?: any) => RenderEntryType;
	/**
	 * The strings bundle for the current active locale.
	 */
	strings: { [id: string]: string };
	/**
	 * The language code for the current active locale.
	 */
	lang: string;
	/**
	 * The active user profile when signed in.
	 */
	activeProfile?: api.ProfileDetail;
	/**
	 * True when we're ready to render client side specifc components, like sign in/out
	 * or bookmark buttons.
	 *
	 * These are items we can't render on the server as we don't know if the user is signed in.
	 */
	clientSide?: boolean;

	children?: React.ReactNode;
	ref?: React.Ref<any>;

	location?: HistoryLocation;

	/**
	 * True if there's an active session.
	 */
	isSessionActive: boolean;

	/**
	 * Allows for additional dynamic properties to be added.
	 */
	// [propName: string]: any;

	/**
	 * pageKey to identify page template type
	 */
	pageKey?: string;
}

/**
 * Properties fed to a List based page entry.
 */
type PageEntryListProps = TPageEntryListProps<any>;

interface TPageEntryListProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * The list of items to render.
	 */
	list: api.ItemList;
	loadNextListPage: (list: api.ItemList) => {};
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {};
	/**
	 * Contains the list item page numbers which are currently loading in.
	 *
	 * When no items are loading for a list the value will be undefined.
	 */
	loading?: number[];
}

type PageEntryItemProps = TPageEntryItemProps<any>;

interface TPageEntryItemProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * The item summary to render.
	 */
	item: api.ItemSummary;
	index?: number;
}

type PageEntryItemDetailProps = TPageEntryItemDetailProps<any>;

interface TPageEntryItemDetailProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * The item summary to render.
	 */
	item: api.ItemDetail;
	itemDetailCache: { [id: string]: state.ItemDetailCache };
	pageKey?: string;
}

type PageEntryTextProps = TPageEntryTextProps<any>;

interface TPageEntryTextProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * The textual value of a page entry if any.
	 *
	 * For example the contents of a `TextEntry`.
	 */
	text: string;
}

type PageEntryImageProps = TPageEntryImageProps<any>;

interface TPageEntryImageProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * An object with page entry type and src url key-value pairs.
	 */
	images: any;
}

type PageEntryPeopleProps = TPageEntryPeopleProps<any>;

interface TPageEntryPeopleProps<T> extends TPageEntryPropsBase<T> {
	/**
	 * The list of people relevant to the search term.
	 */
	people?: api.Credit[];
}

type PageEntryPropsBase = TPageEntryPropsBase<any>;

interface TPageEntryPropsBase<T> extends React.Props<any> {
	/**
	 * The page entry index.
	 */
	index?: number;

	/**
	 * The page entry id.
	 */
	id: string;
	/**
	 * The title of the page entry.
	 */
	title: string;
	/**
	 * The page entry template type.
	 */
	template: string;

	/**
	 * The page entry Type.
	 */
	type?: api.PageEntry['type'];

	/**
	 * An object which can be used to persist internal state of a page entry.
	 *
	 * For example the propery `scrollY` could be set for a carousel and then restored on page reload.
	 *
	 * Note this is a mutable object and is not designed to be used for controlled components.
	 *
	 * Its value is persisted to session storage when a page changes or the site exited.
	 */
	savedState: any;

	/**
	 * The active user profile when signed in.
	 */
	activeProfile?: api.ProfileDetail;
	/**
	 * True when we're ready to render client side specifc components, like sign in/out
	 * or bookmark buttons.
	 *
	 * These are items we can't render on the server as we don't know if the user is signed in.
	 */
	clientSide?: boolean;

	/**
	 * Css class name.
	 */
	className?: string;

	/**
	 * The current active location.
	 */
	location?: HistoryLocation;

	/**
	 * A map of custom fields defined by a curator for a page entry.
	 */
	customFields?: T;
}

type PlayNextHandler = (nextItem: api.ItemDetail, canPlayItem: boolean, countdownRemaining: number) => void;

declare namespace input {
	type Mode = 'mouse' | 'key' | 'touch';
	type Modes = { [K in Mode]?: string };
}

// FSA-compliant action.
// See: https://github.com/acdlite/flux-standard-action
interface Action<Payload> {
	type: string;
	payload?: Payload;
	error?: boolean;
	meta?: any;
}

interface ActionMeta<Payload, Meta> extends Action<Payload> {
	meta: Meta;
}

interface ServiceAction<Payload> extends ActionMeta<Payload, api.ServiceMeta> {}

type HistoryLocation = {
	pathname: string;
	search: string;
	query: { [key: string]: string };
	state: any;
	key: string;
	basename?: string;
	action: 'PUSH' | 'POP' | 'REPLACE';
	index: number;
};

type PromptType =
	| 'gencode'
	| 'gencode_ok'
	| 'code_expired'
	| 'action_request'
	| 'signin_suc'
	| 'signIn'
	| 'signOut'
	| 'password'
	| 'pin'
	| 'choose_profile'
	| 'edit_profile_start'
	| 'edit_profile'
	| 'delete_profile'
	| 'new_profile';

interface Prompt<TBody> {
	id: string;
	type: PromptType;
	submitting?: boolean;
	body?: TBody;
	tokenType?: TokenType;
	error?: any;
	resolve?: (data?: any) => any;
	reject?: (data?: any) => any;
	redirectPath?: string;
}

type AuthPrompt = Prompt<TokenScope[]>;

type TokenType = 'Anonymous' | 'UserAccount' | 'UserProfile';
type TokenScope = 'Catalog' | 'Settings';
type PlaybackTokenScope = 'Playback';

declare namespace form {
	type DisplayState = 'default' | 'success' | 'error' | 'disabled';

	/**
	 * On Screen Keyboard (OSK) Layout (for touch devices)
	 *
	 * 'default': Alphabet on first screen. Numbers and punctuation on second screen.
	 * 'numeric': Numbers and punctuation on first screen. Alphabet on second screen.
	 * 'email': Alphabet on first screen with the `@` key for convenience. Numbers and punctuation on second screen.
	 * 'url': Alphabet on the first screen with the `.`, `/`, and `.com` keys for convenience. Numbers and additional punctuation on second screen.
	 * 'numpad': 0-9 numbers only.
	 * 'phone': 0-9 numbers and telephone supported characters (+*#).
	 */
	type OskType = 'default' | 'numeric' | 'email' | 'url' | 'numpad' | 'phone';

	/**
	 * Automatic capitalisation (Safari only)
	 *
	 * Deprecated 'on' == 'sentences', 'off' == 'none'.
	 */
	type SafariAutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';

	/**
	 * Autocomplete values supported by HTML.
	 * Note: this is not an exhaustive set.
	 */
	type AutoCorrect =
		| 'off'
		| 'on'
		| 'name'
		| 'given-name'
		| 'family-name'
		| 'email'
		| 'username'
		| 'cc-name'
		| 'bday-day'
		| 'bday-month'
		| 'bday-year'
		| 'tel';
}

declare namespace grid {
	type Breakpoint = { [key: string]: number }; // Pixel widths e.g. `{ phone: 320 }`
	type BreakpointColumn = { [key: string]: number }; // Column count e.g. `{ phone: 12 }`
	type BreakpointWidthRange = { min: number; max?: number; name?: string }; // Pixel range e.g. `{ name: 'phone', min: 320, max: 479 }`
}

declare namespace customFields {
	// Common types used within `customFields` on rows
	type ImageLayoutPosition = 'fullWidth' | 'widthPercentage' | 'contentWidth';
	type ImageVerticalSpacing = 'ignoreBottom' | 'ignoreTop' | 'ignoreBoth' | 'Default';
	type AspectRatio = 'pixels' | '1x1' | '16x9' | '2x1' | '3x1' | '7x1';

	interface Color {
		color: string; // Hexadecimal string e.g. '#000000'
		opacity: number; // 0-100
	}
}

declare namespace position {
	type AlignX = 'left' | 'center' | 'right';
	type AlignY = 'top' | 'middle' | 'bottom';
	type AssetTitle = 'below' | 'overlay' | 'none';
}

type AssetTitlePosition = position.AssetTitle;

declare namespace image {
	type Type =
		| 'poster'
		| 'tile'
		| 'block'
		| 'square'
		| 'wallpaper'
		| 'hero7x1'
		| 'hero3x1'
		| 'hero4x3'
		| 'banner'
		| 'tall'
		| 'brand'
		| 'badge'
		| 'logo'
		| 'logodark'
		| 'icon'
		| 'custom';

	type AlignX = position.AlignX;
	type AlignY = 'top' | 'center' | 'bottom';
	type Format = 'jpg' | 'png';
	type ScaleMode = 'stretch' | 'letterbox' | 'zoom' | 'none';

	type MimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'image/svg+xml';

	interface Options {
		width?: number;
		height?: number;
		alignX?: AlignX;
		alignY?: AlignY;
		scaleMode?: ScaleMode;
		format?: Format;
		quality?: number; // Between 0 - 1
		maxWidth?: number;
		maxHeight?: number;
		fallbackURI?: string;
	}

	interface Resource extends Source {
		width: number;
		height: number;
		pixelRatio?: number;
		displayWidth?: number; // e.g. width / pixelRatio
		displayHeight?: number;
		type?: Type;
		resolved?: boolean; // when false a fallback image uri was returned
	}

	interface SrcSet {
		url: string;
		pixelRatio?: number; // e.g. 1.5 for '1.5x', 2 for '2x' etc
		width?: number; // e.g. 500 for '500w' etc
	}

	interface SrcSetSize {
		length: string; // e.g. 33vw, 200px
		mediaCondition?: string; // e.g. (max-width: 480px)
	}

	interface Source {
		src?: string;
		srcSet?: SrcSet[];
		sizes?: SrcSetSize[];
		mediaQuery?: string;
		mimeType?: MimeType;
		isDefaultPlaceholder?: boolean;
	}
}

declare namespace api {
	interface PageSummary {
		pattern?: string;
		regex?: RegExp;
		refId?: string;
	}

	interface ItemSummary {
		/**
		 * The current timestamp of the media in seconds.
		 */
		currentTime?: number;
	}

	interface SecurityDefinition {
		refreshUrl?: string;
	}

	interface AccessToken {
		scope?: TokenScope;
		profileId?: string;
	}

	type CookieType = 'Persistent' | 'Session';

	interface ItemList {
		/**
		 * The unique key for an item list.
		 *
		 * This is made up the the list id together with the list parameter if one exists.
		 *
		 * e.g. `24254_genre:action`
		 */
		key: string;
	}

	interface Person {
		key?: string;
	}

	type ProfileUpdateType =
		| 'savingRating'
		| 'addingBookmark'
		| 'removingBookmark'
		| 'removingBookmarks'
		| 'savingResumePositon'
		| 'addingReminder'
		| 'removingReminder';

	interface ProfileDetail {
		pendingUpdates: ProfilePendingUpdate[];
	}

	type ProfilePendingUpdate = {
		type: ProfileUpdateType;
		value: any;
		itemId: string;
	};

	interface RequestPlaybackToken {
		scopes: Array<TokenScope> | ['Playback'];
		pin: string;
		tokenType: TokenType;
		onSuccess: (payload: any) => void;
		onError: (payload: any) => void;
	}

	interface RequestSwitchToken {
		pin: string;
		onSuccess: (payload: any) => void;
		onError: (payload: any) => void;
	}

	interface RegistrationRequestOmited extends Omit<RegistrationRequest, 'deviceId' | 'gender' | 'dateOfBirth'> {}

	interface SingleSignOnRequestOmited extends Omit<SingleSignOnRequest, 'deviceId'> {}

	interface MediaFileError extends api.MediaFile {
		/**
		 * Error Property: error message
		 */
		message?: string;
		/**
		 * Error Property: unique error code
		 */
		code?: number;
		/**
		 * Error Property: status code
		 */
		status?: number;
	}
}

type VideoResolution = 'SD' | 'HD-720' | 'HD-1080' | 'External';

// Augment NodeModule for hot module replacement (HMR) e.g. module.hot.accept()
interface NodeModule {
	hot: any;
}

// Augment Window with react-addons-perf global access
// This is best used via the Chrome plugin to start / stop profiling (see README)
interface Window {
	Perf: any;
	picturefill: () => void;
	dataLayer: any;
	_satellite: DTMSatellite;
	MSMediaKeys?: any;
	webkitGenerateKeyRequest?: any;
}

// Augment addEventListener to support event listener options
interface HTMLElement {
	addEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		useCapture?: boolean | EventListenerOptions
	): void;

	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		useCapture?: boolean | EventListenerOptions
	): void;
}

interface DTMSatellite {
	track: (a: string, additionalProps?: any) => boolean;
	getVisitorId: () => any;
}

interface ItemListingAttribute {
	continuousScrollEpisodeCount: number;
}

interface ItemListingTracking {
	[id: string]: ItemListingAttribute;
}

declare namespace appboy {
	interface InAppMessage {
		subscribeToDismissedEvent(subscriber: () => void): string;
	}

	interface ControlMessage {}
}

interface LearnActionData {
	actionTime: number;
	contentItemId?: string;
	contentItemInstanceId?: string;
	contentSourceId?: number | number[];
	countryCode: string;
	deviceType: number;
	language?: string;
	refUsecase?: string;
	sourceId?: string;
	subgenre?: string;
	tz: string;
}

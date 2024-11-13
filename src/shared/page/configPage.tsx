import * as React from 'react';
import * as Redux from 'redux';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'shared/util/objects';
import { loadListPage, loadNextListPage } from '../list/listWorkflow';
import { selectActivePage, selectPageState } from './pageUtil';
import { restoreScrollPosition } from './pageWorkflow';
import { truncateSentences } from '../util/strings';
import { Helmet } from 'react-helmet';
import { setAppTheme } from 'shared/app/appWorkflow';
import * as entryTemplate from './pageEntryTemplate';
import * as pageTemplate from './pageTemplate';
import createRichSnippet from './richSnippetsUtil';
import { createOpenGraphMetadata, createCanonicalUrl } from './pageMetadataUtil';
import wrapPageEntries from '../component/pageEntryWrapper';
import warning from '../util/warning';
import { memoize } from 'shared/util/performance';
import { isAnonymousUser } from '../account/sessionWorkflow';
import { getRegisteredProfileInfo } from 'shared/account/profileUtil';
import { Watch, EpisodeDetail, Embed, ESearch } from 'shared/page/pageKey';

const UnsupportedEntry = _DEV_ || _QA_ ? require('../component/UnsupportedEntry').default : undefined;
const ListLoadingLogger =
	process.env.CLIENT_DISPLAY_LIST_LOADING_LOGGER && _QA_
		? require('../component/ListLoadingLogger').default
		: undefined;
const buildCustomInfoBetweenEntries = _TV_
	? require('shared/util/platforms/rowUtil').buildCustomInfoBetweenEntries
	: undefined;

type PageWrapperProps = api.Page & {
	savedState: any;
	loading: boolean;
	loadingLists: boolean;
	listCache: { [id: string]: state.ListCache };
	enhanceSearchCache: { [id: string]: state.ListCache };
	strings: { [id: string]: string };
	lang: string;
	clientSide: boolean;
	currencyCode: string;
	isSessionActive: boolean;
	activeProfile?: api.ProfileDetail;
	location: HistoryLocation;
	pageKey: string;
	theme: AppTheme;
	item: api.ItemDetail;
	list: api.ItemList;
	setAppTheme: typeof setAppTheme;
	restoreScroll: () => void;
	loadListPage: typeof loadListPage;
	loadNextListPage: typeof loadNextListPage;
};

/**
 * Responsible for wiring up a page with both its page data
 * and page state. The state should be used for things like
 * recording scroll positions of a row so they can be
 * restored when navigating back to the page.
 */

const mapStateToProps = (state: state.Root, props) => {
	const page = selectActivePage(state);
	return {
		savedState: selectPageState(state),
		loading: !!state.page.loading || !!state.app.i18n.loading,
		loadingLists: state.list.loading,
		listCache: state.cache.list,
		enhanceSearchCache: state.cache.enhanceSearch,
		strings: state.app.i18n.strings,
		lang: state.app.i18n.lang,
		clientSide: state.app.clientSide,
		currencyCode: state.app.config.general.currencyCode,
		isSessionActive: !!state.session.tokens.length && !isAnonymousUser(state),
		activeProfile: getRegisteredProfileInfo(state.profile),
		// this location updates faster than the react-router one
		// so we use it for tighter consistency
		location: state.page.history.location,
		pageKey: page.key,
		...page,
		// Override the Page key to ensure we provide a consistent component key to the PageWrapper
		key: 'page-wrapper'
	};
};

const mapDispatchToProps = dispatch => {
	return {
		loadListPage: (list, pageNo, options?) => dispatch(loadListPage(list, pageNo, options)),
		loadNextListPage: list => dispatch(loadNextListPage(list)),
		restoreScroll: () => dispatch(restoreScrollPosition()),
		setAppTheme: theme => dispatch(setAppTheme(theme))
	};
};

export interface ConfigPageOptions {
	/**
	 * The name or names of the page templates the Page component should render.
	 */
	template: string | string[];
	/**
	 * When a page is assigned the generic 'Static' template you must also provide
	 * its page key here to uniquely identify it.
	 */
	key?: string;
	/**
	 * The array of page entry row components to render the entries of a Page.
	 */
	entryRenderers?: any[];

	mapStateToProps?: (state: state.Root, ownProps?: any) => { [key: string]: any };
	mapDispatchToProps?: (dispatch: Redux.Dispatch<any>, ownProps?: any) => { [key: string]: any };
	theme?: AppTheme;
	preventScrollRestoration?: boolean;
}

export default function configPage<P = {}>(Page: React.ComponentType<PageProps & P>, options: ConfigPageOptions) {
	options = formatOptions(options);

	class PageWrapper extends React.Component<PageWrapperProps, {}> {
		componentDidMount() {
			if (!options.preventScrollRestoration) this.props.restoreScroll();
			const nextTheme = options.theme || 'default';
			if (this.props.theme !== nextTheme) {
				this.props.setAppTheme(nextTheme);
			}
		}

		shouldComponentUpdate({ pageKey, template, location }) {
			return !!location.pathname && isTargetPage(pageKey, template);
		}

		componentDidUpdate(prevProps) {
			const { refId, restoreScroll } = this.props;
			if (refId && prevProps.refId !== refId && !options.preventScrollRestoration) restoreScroll();
		}

		render() {
			const { strings, lang } = this.props;

			const title = getTitle(this.props);

			// shouldComponentUpdate takes care of avoiding unwanted renders
			// except for the first, so we cover that one here.
			if (!this.shouldComponentUpdate(this.props)) {
				return <div className="page" />;
			}
			return (
				<div className="page">
					<Helmet
						titleTemplate={`%s - ${strings.app_title}`}
						title={title}
						htmlAttributes={{ lang }}
						meta={getPageMeta(this.props)}
						script={[createRichSnippet(this.props)]}
						link={getPageLinks(this.props)}
					/>
					<Page renderEntries={this.renderEntries} renderEntry={this.renderEntry} {...this.props as any} />
				</div>
			);
		}

		private renderEntries = (customEntryProps?: any) => {
			const entries = this.props.entries || [];
			if (_TV_) buildCustomInfoBetweenEntries(entries);

			const propdata: any = [...entries];

			return propdata.map((entry, index) => this.renderEntry(entry, index, customEntryProps));
		};

		private renderEntry = (entry: api.PageEntry, index: number, customEntryProps?: any) => {
			const { clientSide, loadingLists } = this.props;
			const customList = get(customEntryProps, 'customFields.analytics.entry.list');
			if (entry.type === 'UserEntry' && !clientSide) return undefined;
			let entryState;
			if (_SERVER_) {
				// When server rendering there's no need to retain state for each row
				// so we stub out these objects to avoid sending them over the wire
				// to the client as part of the serialized Redux state.
				entryState = {};
			} else {
				entryState = this.props.savedState[entry.id] || (this.props.savedState[entry.id] = {});
			}
			const { activeProfile, location } = this.props;
			const entryProps = Object.assign(
				{},
				entry,
				{
					savedState: entryState,
					clientSide,
					location,
					activeProfile,
					index
				},
				customEntryProps
			);
			if (entryProps.list) {
				const {
					listCache,
					loadingLists,
					loadListPage,
					loadNextListPage,
					item,
					enhanceSearchCache,
					pageKey
				} = this.props;
				const cache = pageKey === ESearch ? enhanceSearchCache : listCache;
				// always use cached item lists to drive list entries
				// a cached list may be getting items loaded in the background
				let listKey = entryProps.list.key;
				if (entryState.listKey) {
					if (cache[entryState.listKey]) {
						listKey = entryState.listKey;
					} else {
						delete entryState.listKey;
					}
				}

				const cachedList = cache[listKey];
				const loading = loadingLists[listKey];

				if (cachedList) {
					const cachedListLength = get(cachedList, 'list.items.length');
					const customListLength = get(customList, 'items.length');
					entryProps.list = cachedList.list;
					if (customList && customListLength && !cachedListLength) {
						entryProps.list = customList;
					}
				}

				if (loading) entryProps.loading = loading;
				entryProps.loadListPage = loadListPage;
				entryProps.loadNextListPage = loadNextListPage;
				entryProps.item = item;
			}

			// Custom fields are optional and only some page entries leverage them.
			// Components which don't require custom fields them can ignore the fallback, and components which do
			// require custom fields can trust that the object exists when destructuring its properties.
			if (!entry.customFields && !entryProps.customFields) entryProps.customFields = {};

			const View = findPageEntryView(options.entryRenderers, entry);
			const key = getPageEntryKey(entry);
			if (View) {
				const EntryProviderComponent = <EntryProvider key={key} entryProps={entryProps} component={View} />;

				if (ListLoadingLogger) {
					return [<ListLoadingLogger loadingLists={loadingLists} entryProps={entryProps} />, EntryProviderComponent];
				}
				return EntryProviderComponent;
			} else {
				return UnsupportedEntry ? <UnsupportedEntry key={key} index={index} {...entryProps} /> : undefined;
			}
		};
	}

	if (_DEV_) {
		(PageWrapper as any).displayName = `PageWrapper(${Page.displayName || Page.name})`;
	}

	function isTargetPage(pageKey: string, template: string): boolean {
		if (!pageKey && !template) return false;
		if (options.key && pageKey === options.key) return true;
		const templateIds = options.template;
		return (templateIds as string[]).some(id => template === id || pageTemplate[id] === template);
	}

	return connect(
		options.mapStateToProps,
		options.mapDispatchToProps
	)(PageWrapper);
}

const defaultReturn = (...args: any[]): any => ({});
const defaultTemplate = [];
function formatOptions(options: ConfigPageOptions): ConfigPageOptions {
	if (options.template) {
		if (!Array.isArray(options.template)) {
			options.template = [options.template];
		}
	} else {
		options.template = defaultTemplate;
	}
	options.entryRenderers = wrapPageEntries(options.entryRenderers || []);
	const childMapStateToProps = options.mapStateToProps || defaultReturn;
	options.mapStateToProps = (state: state.Root, ownProps: any) => {
		return {
			...childMapStateToProps(state, ownProps),
			...mapStateToProps(state, ownProps)
		};
	};
	const childMapDispatchToProps = options.mapDispatchToProps || defaultReturn;
	options.mapDispatchToProps = dispatch => {
		return {
			...childMapDispatchToProps(dispatch),
			...mapDispatchToProps(dispatch)
		};
	};

	if (_DEV_) {
		if (!options.template.length) {
			warning(`A page template must be supplied to 'configPage`);
		}
		if (!options.key && (options.template as string[]).some(t => t === pageTemplate.STATIC)) {
			warning(`A page key must be defined when the page template is ${pageTemplate.STATIC}`);
		}
		if (!options.key && !options.template.length) {
			warning(`You must define the page template(s) or page key as 'configPage' options`);
		}
	}

	return options;
}

export function findPageEntryView(views, entry: api.PageEntry) {
	return views.find(view => {
		// A page entry component may define its name through the property 'template'
		// or name itself after the page entry component it renders. The latter is
		// recommended and must follow the naming of variables defined in
		// 'src/shared/page/pageEntryTemplate' e.g. 'H1Standard'
		const template = view.template || view.name;
		if (!template) throw new Error(`Missing page entry template name`);
		return (
			template === entry.template ||
			entryTemplate[template] === entry.template ||
			isSupportedDeprecatedEntry(entry, template)
		);
	});
}

function isSupportedDeprecatedEntry(entry: api.PageEntry, templateKey: string) {
	// Temporary mapping to maintain backwards compatibility during the transition from old to new template names
	return (
		!!entryTemplate[templateKey] && entryTemplate.DEPRECATED_KEY_MAP[entry.template] === entryTemplate[templateKey]
	);
}

const getPageMeta = memoize((props: PageProps) => {
	const meta = [];
	const { metadata, item, entries, list, template, pageKey } = props;

	const noIndex = pageKey === Embed;
	if (noIndex) {
		meta.push({ name: 'robots', content: 'noindex,follow' });
	}

	let description;
	if (metadata) {
		if (metadata.description) description = metadata.description;
		if (metadata.keywords && metadata.keywords.length) {
			meta.push({ name: 'keywords', content: metadata.keywords.join(',') });
		}
	}
	if (item && !description) {
		description = item.shortDescription || truncateSentences(item.description || '', 200);
	} else if (list && !description) {
		description = list.shortDescription || truncateSentences(list.description || '', 200);
	} else if (template === 'Watch') {
		const entryItem = entries && entries.length && entries[0].item;
		description = entryItem && entryItem.shortDescription;
	}

	if (description) {
		meta.push({ name: 'description', content: description });
		meta.push({ property: 'og:description', content: description });
	}

	return meta.concat(createOpenGraphMetadata(props));
});

const getTitle = memoize((props: PageProps) => {
	if (![Watch, EpisodeDetail].includes(props.pageKey)) return props.title;

	try {
		let show;
		if (props.pageKey === Watch) {
			const pageEntries = get(props, 'entries');
			const pageEntry = pageEntries[0];
			let { item } = pageEntry;
			show = get(item, 'season.show');
		} else {
			let item = get(props, 'item');
			show = { title: get(item, 'contextualTitle') };
		}

		if (show) return `${show.title} - ${props.title}`;
	} catch {
		return props.title;
	}

	return props.title;
});

const getPageLinks = ({ location }: PageWrapperProps) => {
	return [{ rel: 'canonical', href: createCanonicalUrl(location) }];
};

function getPageEntryKey(entry: api.PageEntry): string {
	switch (entry.template) {
		case entryTemplate.ItemDetailStandard:
			return 'item-detail';
		case entryTemplate.XCHD1:
			return 'XCHD1';
		default:
			return entry.id;
	}
}

type RowEntryProps = {
	entryProps: PageEntryPropsBase | PageEntryListProps;
	component: React.ComponentType<any>;
};

class EntryProvider extends React.Component<RowEntryProps, {}> {
	static contextTypes: any = {
		store: PropTypes.object.isRequired
	};

	static childContextTypes: any = {
		entry: PropTypes.object
	};

	context: { store: Redux.Store<state.Root>; entry: PageEntryPropsBase | PageEntryListProps };

	getChildContext() {
		const entry = {
			...this.props.entryProps
		};

		return {
			entry
		};
	}

	render() {
		const { entryProps, component: View } = this.props;
		return <View {...entryProps} />;
	}
}

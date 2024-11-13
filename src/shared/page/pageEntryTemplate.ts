/**
 * Page Entry Templates
 *
 * This file contains all of the known page entry template keys (the values returned by Rocket for `entry.template`)
 * used when scheduling rows of content within Presentation Manager.
 *
 * WARNING:
 * This file is consumed by Webpack during compilation to mark reserved names which should not be mangled during uglification.
 * DO NOT move or remove this file from this location!
 */

/**
 * Hero
 *
 * Rows presented at the top of the page. These are of mixed aspect ratio.
 */
import { AccountProfileBookmarks } from 'shared/page/pageKey';

export const H1Standard = 'H1';
export const H2Peeking = 'H2';
export const H3Tower = 'H3';
export const H4Stacked = 'H4';
export const H5Thumbnails = 'H5';
export const H6Peeking = 'H6';
export const H7Mosaic = 'H7';
export const H8Signup = 'H8';
export const H9Image = 'H9';
export const H10Text = 'H10';
export const H11PageTitle = 'H11';
export const Xh1WebView = 'XH1';
export const Xh2Autoplay = 'XH2';

/**
 * Subscription entries
 *
 * Subscription plan
 */
export const SX2SubscriptionPlan = 'SX2';
/**
 * Subscription price plan plan
 */
export const SX1ActiveSubscription = 'SX1';

/**
 * Poster
 *
 * Rows primarily presenting items with a 2:3 aspect ratio.
 */
export const P1Standard = 'P1';
export const P2Large = 'P2';

export const Pb1Cover = 'PB1';
export const Pb2Text = 'PB2';
export const Pb3Background = 'PB3';
export const Pb4Image = 'PB4';
export const XCS4 = 'XCS4';
export const XED3 = 'XED3';
export const XPB1 = 'XPB1';
export const XPB2 = 'XPB2';
export const XPB3 = 'XPB3';
export const XPB4 = 'XPB4';

/**
 * Tile
 *
 * Rows primarily presenting items with a 16:9 aspect ratio.
 */
export const T1Standard = 'T1';
export const T2Large = 'T2';
export const T3Double = 'T3';
export const T4DoubleLarge = 'T4';
export const T5DoubleFeatured = 'T5';
export const XT1 = 'XT1';

export const Tb1Cover = 'TB1';
export const Tb2Text = 'TB2';
export const Tb3Background = 'TB3';
export const Tb4Image = 'TB4';
export const XTB1 = 'XTB1';
export const XTB2 = 'XTB2';
export const XTB3 = 'XTB3';
export const XTB4 = 'XTB4';

export const Xed6 = 'XED6';

/**
 * Block
 *
 * Rows primarily presenting items with a 4:3 aspect ratio.
 */
export const B1Standard = 'B1';
export const B2Large = 'B2';
export const B3Double = 'B3';

/**
 * Square
 *
 * Rows primarily presenting items with a 1:1 aspect ratio.
 */
export const S1Standard = 'S1';
export const S2Large = 'S2';
export const S3Double = 'S3';
export const SX5 = 'SX5';

export const Sb1Cover = 'SB1';
export const Sb2Text = 'SB2';
export const Sb3Background = 'SB3';
export const Sb4Image = 'SB4';
export const XSB1 = 'XSB1';
export const XSB2 = 'XSB2';
export const XSB3 = 'XSB3';
export const XSB4 = 'XSB4';

/**
 * Tall
 *
 * Rows primarily presenting items with a 1:2 aspect ratio.
 */
export const Tl1Standard = 'TL1';

/**
 * Item Detail
 *
 * Rows presented on pages using the item detail page template. These are of mixed aspect ratio.
 */
export const Dh1Standard = 'DH1';
export const Dh2Centered = 'DH2';
export const Dh3Player = 'DH3';

export const D1EpisodeGrid = 'D1';
export const D2EpisodeList = 'D2';
export const D3EpisodeRow = 'D3';
export const D4Trailers = 'D4';
export const D5RecommendationsTile = 'D5';
export const D6RecommendationsPoster = 'D6';
export const D7RecommendationsSquare = 'D7';
export const D8CastCrew = 'D8';
export const D9CastCrewText = 'D9';
export const D10Info = 'D10';

/**
 * Continuous
 *
 * Continuous scroll rows. These are of mixed aspect ratio.
 */

export const Cs1ContinuousPoster = 'CS1';
export const Cs2ContinuousTile = 'CS2';
export const Cs3ContinuousBlock = 'CS3';
export const Cs4ContinuousSquare = 'CS4';
export const Cs5ContinuousAutomatic = 'CS5';

/**
 * List Hero
 *
 * Rows presented at the top of the list page. These are of mixed aspect ratio.
 */

export const Lh1Standard = 'LH1';
export const Lh2Centered = 'LH2';
export const Lfh1Standard = 'LFH1';
export const Lfh2Centered = 'LFH2';

/**
 * Promotional
 *
 * These are of mixed aspect ratio.
 */
export const Pr1Banner = 'PR1';

/**
 * Editorial & Support
 *
 * These are of mixed aspect ratio.
 */
export const Ed1Image = 'ED1';
export const Ed2Text = 'ED2';
export const Ed3SupportText = 'ED3';
export const Ed4ImageText = 'ED4';
export const Ed5Button = 'ED5';

/**
 * Text
 *
 * These are of mixed aspect ratio.
 */
export const Tx1Links = 'TX1';

/**
 * User
 *
 * Rows consisting of user generated content. These are of mixed aspect ratio.
 */
export const U1Poster = 'U1';
export const U2Tile = 'U2';
export const U3Block = 'U3';
export const U4Square = 'U4';
export const UX1Recommendation = 'UX1';
export const UX2Recommendation = 'UX2';
export const UX3Recommendation = 'UX3';
export const UX4Recommendation = 'UX4';
export const UX5Recommendation = 'UX5';
export const UX6Recommendation = 'UX6';
export const UX7Recommendation = 'UX7';
export const UX8Recommendation = 'UX8';

export const XD1 = 'XD1';
export const XD2 = 'XD2';

/**
 * Account Hero
 *
 * Rows displaying account or profile information with user generated content.
 */
export const Ah1Poster = 'AH1';
export const Ah2Tile = 'AH2';
export const Ah3Text = 'AH3';

/**
 * Account
 *
 * Rows displaying account or profile information.
 */
export const A1Details = 'A1';
export const A2Billing = 'A2';
export const A3Devices = 'A3';
export const A4Profiles = 'A4';
export const A5ParentalLock = 'A5';
export const A6Preferences = 'A6';

export const AX1ProfileLanguageSelection = 'AX1';
export const AX2ProfilelaybackSettings = 'AX2';
export const AX3ProfilePersonalisation = 'AX3';

// A99 is for demonstration and not expected to be used within a production app
export const A99Segments = 'A99';

// Advertising
export const XAD1Advertising = 'XAD1';
export const XAD2Advertising = 'XAD2';

/**
 * Search
 *
 * Rows used on the search results page.
 */
export const ResultsMovies = 'results-movies';
export const ResultsTv = 'results-tv';
export const ResultsPeople = 'results-people';
export const ResultsSports = 'results-sports';
export const ResultsExtras = 'results-extras';

/** Enhanced Search Page entry template **/
export const SR1 = 'SR1';
export const SR2 = 'SR2';
export const SRP1 = 'SRP1';
export const SSB1 = 'SSB1';

/**
 * Linear
 *
 * Rows presented on the electronic program guide page.
 */
export const Epg3 = 'EPG3';
export const CH2 = 'CH2';
export const EPG2 = 'EPG2';
export const XCHD1 = 'XCHD1';
export const XCHD2 = 'XCHD2';
export const CHD2 = 'CHD2';
export const XEPG5 = 'XEPG5';
export const XEPG6 = 'XEPG6';
export const CHD1 = 'CHD1';
export const CHD3 = 'CHD3';

/**
 * Custom
 *
 * Rows specific to your environment.
 */
export const X1Custom = 'X1';
export const X2WebView = 'X2';
export const X3WebViewFullscreen = 'X3';
export const XUS1 = 'XUS1';
export const XOS1 = 'XOS1';

/**
 * Player
 *
 * Player related rows
 */

export const EmbedPlayer = 'EmbedPlayer';

/**
 * Test if a page entry template is a hero type.
 *
 * @param template the template to test
 * @return true if hero template, false if not
 */
export function isHeroEntryTemplate(template: string): boolean {
	return /^(H\d+|DH\d+|XH\d+|LF?H\d+|AH\d+|XCHD\d+)$/.test(template);
}

/**
 * Test if a page entry template is a continuous type.
 *
 * @param template the template to test
 * @return true if continuous template, false if not
 */
export function isContinuousEntryTemplate(template) {
	return /^CS\d+$/.test(template);
}

/**
 * @deprecated Legacy row keys
 *
 * These remain for backwards compatibility to avoid a breaking change during the transition to the new key values.
 *
 * @see `DEPRECATED_KEY_MAP` to learn their new replacements.
 */
export const HeroFullScreen = 'Hero (Full Screen)';
export const HeroStandard3x1 = '3:1 Hero (Standard)';
export const PosterHero2x3 = '2:3 Poster (Hero)';
export const PosterHeroBlock2x3 = '2:3 Poster (Block Hero)';
export const PosterStandard2x3 = '2:3 Poster (Standard)';
export const PosterTitle2x3 = '2:3 Poster (Title)';
export const BlockHero4x3 = '4:3 Block (Hero)';
export const BlockStandard4x3 = '4:3 Block (Standard)';
export const BlockReduced4x3 = '4:3 Block (Reduced)';
export const HeroBanner7x1 = '7:1 Hero (Banner)';
export const TallStandard1x2 = '1:2 Tall (Standard)';
export const TileHero16x9 = '16:9 Tile (Hero)';
export const TileStandard16x9 = '16:9 Tile (Standard)';
export const TileReduced16x9 = '16:9 Tile (Reduced)';
export const TileHeroBlock16x9 = '16:9 Tile (Block Hero)';
export const TileBlock16x9 = '16:9 Tile (Block)';
export const TileTitle16x9 = '16:9 Tile (Title)';
export const TextReduced = 'Text (Reduced)';
export const TextStandard = 'Text (Standard)';

export const UserTileReduced16x9 = 'User (16:9 Tile Reduced)';
export const UserTileStandard16x9 = 'User (16:9 Tile Standard)';
export const UserBlockStandard4x3 = 'User (4:3 Block Standard)';
export const UserBlockReduced4x3 = 'User (4:3 Block Reduced)';
export const UserPosterStandard4x3 = 'User (2:3 Poster Standard)';

export const ContinuousScrollAutomatic = 'Continuous Scroll Automatic';
export const ContinuousScrollPoster2x3 = '2:3 Poster (Continuous Scroll)';
export const ContinuousScrollTile16x9 = '16:9 Tile (Continuous Scroll)';
export const ContinuousScrollBlock4x3 = '4:3 Block (Continuous Scroll)';

export const Article = 'Article';
export const EditorialText = 'Editorial Text';
export const TextHeading = 'Text Heading';

export const EditorialImage = 'Editorial Image';

export const PlayerStandard = 'Player Standard';

// Games Schedule
export const SXT1 = 'SXT1';

// Stories  --- late we will change this as per BE metadata
export const STORIES = 'stories';
export const MOMENTS = 'moments';
export const XED1 = 'XED1';

// Note this entry is currently added by Rocket so we can embed an item
// detail in the Item detail page. In future this page entry name may
// change when Presentation Manager supports managing of Item Detail pages.
export const ItemDetailStandard = 'Item Detail Standard';

/**
 * Legacy PageEntry Mapping
 *
 * Maintain backwards compatibility by mapping legacy template keys to their new components.
 */
export const DEPRECATED_KEY_MAP = {
	// Hero
	[HeroStandard3x1]: H1Standard,
	'3:1 Carousel (Standard)': H2Peeking,
	[HeroFullScreen]: H5Thumbnails,
	'Image Heading': H9Image,
	[TextHeading]: H10Text,
	// Poster
	[PosterStandard2x3]: P1Standard,
	[PosterHeroBlock2x3]: Pb1Cover,
	// Tile
	[TileReduced16x9]: T1Standard,
	[TileStandard16x9]: T3Double,
	[TileHero16x9]: T5DoubleFeatured,
	[TileHeroBlock16x9]: Tb1Cover,
	// Block
	[BlockReduced4x3]: B1Standard,
	[BlockStandard4x3]: B3Double,
	// Square
	'1:1 Square': S1Standard,
	// Tall
	[TallStandard1x2]: Tl1Standard,
	// Text
	[TextReduced]: Tx1Links,
	[TextStandard]: Tx1Links,
	// Promotional
	[HeroBanner7x1]: Pr1Banner,
	// User
	[UserTileReduced16x9]: U2Tile,
	[UserBlockReduced4x3]: U3Block,
	[UserPosterStandard4x3]: U1Poster,
	// Editorial
	[Article]: Ed3SupportText,
	[EditorialImage]: Ed1Image,
	[EditorialText]: Ed2Text,
	// System
	[ContinuousScrollAutomatic]: Cs5ContinuousAutomatic,
	[ContinuousScrollPoster2x3]: Cs1ContinuousPoster,
	[ContinuousScrollTile16x9]: Cs2ContinuousTile,
	[ContinuousScrollBlock4x3]: Cs3ContinuousBlock,
	// Custom
	'Custom Row': X1Custom,
	iFrame: X2WebView,
	// Unsupported
	[PosterHero2x3]: undefined,
	[PosterTitle2x3]: undefined,
	[TileBlock16x9]: undefined,
	[TileTitle16x9]: undefined,
	[BlockHero4x3]: undefined,
	[UserTileStandard16x9]: undefined,
	[UserBlockStandard4x3]: undefined
};

/**
 * The list of row templates we can show progress bars for
 */
export const ROW_TEMPLATES_WITH_PROGRESS_BAR = [U1Poster, U2Tile, U3Block, U4Square, Ah1Poster, Ah2Tile];

/**
 * The list of row templates we can directly watch item from
 */
export const LIST_ROW_TEMPLATES = [U1Poster, U2Tile, U3Block, U4Square];

export const SEARCH_RESULT_TEMPLATES = [ResultsExtras, ResultsMovies, ResultsTv, ResultsPeople, ResultsSports];

export const CAROUSEL_TEMPLATES = [H1Standard, Xh2Autoplay];

export const CLICK_TO_WATCH_TEMPLATES = [
	Cs2ContinuousTile,
	Cs5ContinuousAutomatic,
	H1Standard,
	XPB1,
	XPB2,
	XPB3,
	XPB4,
	XSB1,
	XSB2,
	XSB3,
	XSB4,
	XT1,
	XTB1,
	XTB2,
	XTB3,
	XTB4
];

export const LIST_CARD_TEMPLATES = [
	Cs1ContinuousPoster,
	Cs2ContinuousTile,
	Cs3ContinuousBlock,
	Cs4ContinuousSquare,
	Cs5ContinuousAutomatic
];

export const RAIL_CARD_TEMPLATES = [
	B1Standard,
	B2Large,
	B3Double,
	CHD2,
	D1EpisodeGrid,
	D2EpisodeList,
	D3EpisodeRow,
	D4Trailers,
	Pb1Cover,
	Pb2Text,
	Pb3Background,
	Pb4Image,
	P1Standard,
	P2Large,
	Sb1Cover,
	Sb2Text,
	Sb3Background,
	Sb4Image,
	S1Standard,
	S2Large,
	S3Double,
	Tb1Cover,
	Tb2Text,
	Tb3Background,
	Tb4Image,
	Tl1Standard,
	T1Standard,
	T2Large,
	T3Double,
	UX5Recommendation,
	UX6Recommendation,
	UX7Recommendation,
	UX8Recommendation,

	XCS4,
	XD1,
	XD2,
	XEPG5,
	XEPG6,
	XPB1,
	XPB2,
	XPB3,
	XPB4,
	XSB1,
	XSB2,
	XSB3,
	XSB4,
	XT1,
	XTB1,
	XTB2,
	XTB3,
	XTB4,
	XED1
];

export const ENHANCED_SEARCH_TEMPLATES = [SR1, SR2, SRP1, SSB1];

export function isClickToPlayPageEntry(pageEntryTemplate: string) {
	return CLICK_TO_WATCH_TEMPLATES.includes(pageEntryTemplate);
}

export function isCarousel(pageEntryTemplate: string) {
	return CAROUSEL_TEMPLATES.indexOf(pageEntryTemplate) > -1;
}

export function isListingCard(pageEntryTemplate: string, pageKey: string) {
	return LIST_CARD_TEMPLATES.indexOf(pageEntryTemplate) > -1 && pageKey !== AccountProfileBookmarks;
}

export function isRailCard(pageEntryTemplate: string) {
	return RAIL_CARD_TEMPLATES.indexOf(pageEntryTemplate) > -1;
}

export function isEpisodeCard(pageEntryTemplate: string) {
	return [D1EpisodeGrid, D2EpisodeList, D3EpisodeRow].indexOf(pageEntryTemplate) > -1;
}

export function isEnhancedSearchCard(pageEntryTemplate: string) {
	return ENHANCED_SEARCH_TEMPLATES.includes(pageEntryTemplate);
}

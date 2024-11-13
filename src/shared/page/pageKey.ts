/**
 * Page Keys
 *
 * This file contains all of the known page keys. Keys are unique and are maintained across environments.
 *
 * They can be optionally attached to a page within Presentation Manager. Once attached they become reserved. Keys can
 * only be assigned to one page at a time.
 *
 * We use page keys to identify known system pages so that we can treat them differently within the app.
 */

export const Home = 'Home';
export const List = 'List';
export const Watch = 'Watch';
export const Embed = 'Embed';

export const Credit = 'Credit';
export const CreditMovies = 'CreditMovies';
export const CreditShows = 'CreditShows';
export const CreditSeasons = 'CreditSeasons';
export const CreditEpisodes = 'CreditEpisodes';

export const Movies = 'Movies';
export const MoviesAz = 'MoviesAZ';
export const MoviesAzChild = 'MoviesAZChild';
export const MovieGenres = 'MoviesGenres';
export const MovieGenresChild = 'MoviesGenresChild';

export const Tv = 'TV';
export const TvAz = 'TVAZ';
export const TvAzChild = 'TVAZChild';
export const TvGenres = 'TVGenres';
export const TvGenresChild = 'TVGenresChild';

export const MovieDetail = 'MovieDetail';
export const SeasonDetail = 'SeasonDetail';
export const EpisodeDetail = 'EpisodeDetail';
export const ProgramDetail = 'ProgramDetail';
// Named CustomDetail for consistency, AXIS currently returns CustomAssetDetail
export const CustomDetail = 'CustomAssetDetail';
export const BundleDetail = 'BundleDetail';
export const ScheduleDetail = 'ScheduleDetail';
export const ShowDetail = 'ShowDetail';
export const TrailerDetail = 'TrailerDetail';
export const ChannelDetail = 'ChannelDetail';

export const Account = 'Account';
export const Register = 'Register';
export const SignIn = 'SignIn';
export const ResetPassword = 'ResetPassword';
export const ConfirmAccount = 'ConfirmAccount';
export const ConfirmEmail = 'ConfirmEmail';
export const CreatePin = 'CreatePIN';
export const AccountEdit = 'AccountEdit';
export const AccountChangePassword = 'AccountChangePassword';
export const AccountProfileChangePin = 'AccountProfileChangePIN';
export const AccountProfileResetPin = 'AccountProfileResetPIN';
export const AccountProfileAdd = 'AccountProfileAdd';
export const AccountProfileEdit = 'AccountProfileEdit';
export const AccountProfilePersonalisation = 'AccountProfilePersonalisation';
export const AccountDevices = 'AccountDevices';
export const AccountDeviceAuthorization = 'AccountDeviceAuthorization';
export const AccountDownloads = 'AccountDownloads';
export const AccountBilling = 'AccountBilling';
export const AccountBillingHistory = 'AccountBillingHistory';
export const AccountAddCredit = 'AccountAddCredit';
export const AccountProfiles = 'AccountProfiles';
export const AccountAddCard = 'AccountAddCard';
export const AccountPreferences = 'AccountPreferences';
export const AccountParentalLock = 'AccountParentalLock';

export const AccountLibrary = 'AccountLibrary';
export const AccountLibraryMovies = 'AccountLibraryMovies';
export const AccountLibraryShows = 'AccountLibraryShows';
export const AccountLibrarySeasons = 'AccountLibrarySeasons';
export const AccountLibraryEpisodes = 'AccountLibraryEpisodes';
export const AccountLibraryPrograms = 'AccountLibraryPrograms';

export const AccountProfileWatched = 'AccountProfileWatched';
export const AccountProfileWatchedMovies = 'AccountProfileWatchedMovies';
export const AccountProfileWatchedShows = 'AccountProfileWatchedShows';
export const AccountProfileWatchedSeasons = 'AccountProfileWatchedSeasons';
export const AccountProfileWatchedEpisodes = 'AccountProfileWatchedEpisodes';
export const AccountProfileWatchedPrograms = 'AccountProfileWatchedPrograms';

export const AccountProfileBookmarks = 'AccountProfileBookmarks';
export const AccountProfileBookmarksMovies = 'AccountProfileBookmarksMovies';
export const AccountProfileBookmarksShows = 'AccountProfileBookmarksShows';
export const AccountProfileBookmarksSeasons = 'AccountProfileBookmarksSeasons';
export const AccountProfileBookmarksEpisodes = 'AccountProfileBookmarksEpisodes';
export const AccountProfileBookmarksPrograms = 'AccountProfileBookmarksPrograms';

export const PlanSelection = 'Plans';
export const PlanBilling = 'PlanBilling';
export const PricePlan = 'Subscription';

export const About = 'About';
export const TermsAndConditions = 'TermsAndConditions';
export const Privacy = 'Privacy';
export const RefundPolicy = 'RefundPolicy';
export const Search = 'Search';
export const ESearch = 'ESearch';

export const EPG = 'EPG';

export const ColdStart = 'ColdStart';

export const SubscriptionStaff = 'SubscriptionStaff';
export const UpsellScreen = 'UpsellScreen';
export const OnboardingScreen = 'OnboardingScreen';

export const Notification = 'Notification';
export const Payment = 'AdyenPay';
export const AccountProfileCW = 'AccountProfileCW';
export const AnonymousCW = 'AnonymousCW';

export const EXCLUDED_PAGES_FOR_PAGE_LOAD_EVENT = [
	AccountProfileBookmarks,
	CustomDetail,
	EpisodeDetail,
	List,
	Movies,
	MovieDetail,
	Payment,
	PricePlan,
	ProgramDetail,
	SeasonDetail,
	ShowDetail
];

import { ContinueWatching as continueWatchingListId } from '../../list/listId';
export const LIST_ITEM_EPISODE_DATA: api.ItemDetail = {
	averageUserRating: 6.5,
	classification: { code: 'MPAA-R', name: 'R' },
	contextualTitle: '1. A Scandal in Belgravia',
	customId: '254sherlock_S2_E1',
	duration: 5400,
	episodeName: 'A Scandal in Belgravia',
	episodeNumber: 1,
	genres: ['crime', 'drama', 'mystery'],
	id: '2141',
	images: {
		wallpaper: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
		tile: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test'
	},
	offers: [],
	path: '/episode/Sherlock_S2_E1_2141',
	releaseYear: 2012,
	scopes: ['2141', '2140', '214'],
	seasonId: '2140',
	shortDescription:
		'Compromising photographs and a case of blackmail threaten the very heart of the British establishment, but for Sherlock and John',
	showId: '442',
	tagline: 'Tag line A Scandal in Belgravia ',
	title: 'Sherlock S2 E1',
	type: 'episode',
	watchPath: '/watch/Sherlock_S2_E1_2141'
};

export const LIST_ITEM_MOVIE_DATA: api.ItemDetail = {
	averageUserRating: 7.5,
	classification: { code: 'MPAA-PG-13', name: 'PG-13' },
	customId: '254181808',
	duration: 7200,
	genres: ['action', 'adventure', 'fantasy', 'science fiction'],
	id: '1171',
	images: {
		hero7x1: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
		wallpaper: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
		poster: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
		hero3x1: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test'
	},
	offers: [],
	path: '/movie/Star_Wars_The_Last_Jedi_1171',
	releaseYear: 2017,
	scopes: ['1171', '214'],
	shortDescription: 'Having taken her first steps into a larger world in',
	title: 'Star Wars: The Last Jedi',
	type: 'movie',
	watchPath: '/watch/Star_Wars_The_Last_Jedi_1171'
};

export const CONTINUE_WATCHING_TEST_LIST_DATA: api.ItemList = {
	id: continueWatchingListId,
	path: '/account/profiles/watched',
	key: continueWatchingListId,
	title: 'Continue Watching',
	items: [
		{
			averageUserRating: 6.5,
			classification: { code: 'MPAA-R', name: 'R' },
			contextualTitle: '1. A Scandal in Belgravia',
			customId: '254sherlock_S2_E1',
			duration: 5400,
			episodeName: 'A Scandal in Belgravia',
			episodeNumber: 1,
			genres: ['crime', 'drama', 'mystery'],
			id: '2141',
			images: {
				wallpaper:
					'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				tile: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test'
			},
			offers: [],
			path: '/episode/Sherlock_S2_E1_2141',
			releaseYear: 2012,
			scopes: ['2141', '2140', '214'],
			seasonId: '2140',
			shortDescription:
				'Compromising photographs and a case of blackmail threaten the very heart of the British establishment, but for Sherlock and John',
			showId: '442',
			tagline: 'Tag line A Scandal in Belgravia ',
			title: 'Sherlock S2 E1',
			type: 'episode',
			watchPath: '/watch/Sherlock_S2_E1_2141'
		},
		{
			averageUserRating: 7.5,
			classification: { code: 'MPAA-PG-13', name: 'PG-13' },
			customId: '254181808',
			duration: 7200,
			genres: ['action', 'adventure', 'fantasy', 'science fiction'],
			id: '1171',
			images: {
				hero7x1: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				wallpaper:
					'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				poster: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				hero3x1: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test'
			},
			offers: [],
			path: '/movie/Star_Wars_The_Last_Jedi_1171',
			releaseYear: 2017,
			scopes: ['1171', '214'],
			shortDescription: 'Having taken her first steps into a larger world in',
			title: 'Star Wars: The Last Jedi',
			type: 'movie',
			watchPath: '/watch/Star_Wars_The_Last_Jedi_1171'
		},
		{
			averageUserRating: 5.14,
			classification: { code: 'MPAA-PG', name: 'PG' },
			customId: '254133701',
			duration: 720,
			genres: ['science fiction'],
			id: '2062',
			images: {
				wallpaper:
					'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				poster: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test',
				tile: 'https://external.axisstatic.com/isl/api/v1/dataser…wser&subscriptions=Standard&segmentationTags=test'
			},
			offers: [],
			path: '/movie/Tears_of_Steel_2062',
			releaseYear: 2012,
			scopes: ['2062', '214'],
			shortDescription: 'A group of warriors and scientists attempt to rescue the world from destructive robots',
			title: 'Tears of Steel',
			type: 'movie',
			watchPath: '/watch/Tears_of_Steel_2062'
		}
	],
	size: 3,
	paging: {
		total: 1,
		page: 1,
		size: 12
	}
};

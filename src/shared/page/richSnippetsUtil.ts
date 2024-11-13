import { listDetailTemplate, itemDetailTemplate, itemIDPDetailTemplate, Watch, ChannelDetail } from './pageTemplate';
import { MovieDetail, SeasonDetail, EpisodeDetail, ProgramDetail, ShowDetail } from 'shared/page/pageKey';
import { durationISO8601, toISO8601 } from 'shared/util/dates';
import { Ownership } from 'toggle/responsive/pageEntry/util/offer';
import { get } from '../util/objects';
/**
 * Creates the rich snippets JSON-LD object to be placed in a head script for search engines.
 *
 * The schema.org vocabulary for each item type can be found at:
 * http://schema.org/Movie
 * http://schema.org/TVSeries
 * http://schema.org/TVSeason
 * http://schema.org/TVEpisode
 * http://schema.org/CreativeWork
 *
 * Rich snippets can be tested at:
 * https://search.google.com/structured-data/testing-tool
 */

export default function createRichSnippet({ template, item, list, currencyCode, entries, pageKey }): any {
	let richSnippet;
	if (list && listDetailTemplate[template]) {
		richSnippet = createListRichSnippet(list, currencyCode);
	} else if (item && template === ChannelDetail) {
		richSnippet = createChannelRichSnippet(item);
	} else if (item && itemIDPDetailTemplate[template]) {
		richSnippet = createIDPDetailRichSnippet(item, pageKey);
	} else if (item && itemDetailTemplate[template]) {
		richSnippet = createItemRichSnippet(item, currencyCode);
	} else if (template === Watch && entries && entries.length) {
		richSnippet = createItemRichSnippet(get(entries[0], 'item'), currencyCode);
	}

	if (richSnippet) {
		return {
			type: 'application/ld+json',
			innerHTML: JSON.stringify(richSnippet)
		};
	}
	return {};
}

function createListRichSnippet(list: api.ItemList, currencyCode: string): any {
	if (!list.items || !list.items.length) return undefined;

	const itemListElement = list.items.slice(0, 10).map((item, index) => ({
		'@type': 'ListItem',
		position: index,
		item: createItemRichSnippet(item, currencyCode)
	}));

	return {
		'@context': 'http://schema.org',
		'@type': 'ItemList',
		itemListElement
	};
}

export function getHostURL() {
	return typeof window !== 'undefined' ? window.location.origin : process.env.WEBSITE_URL;
}

function createItemRichSnippet(item: api.ItemDetail, currencyCode: string): any {
	const director: any = (item.credits || []).find(person => person.role === 'director');
	const actors: any[] = (item.credits || []).filter(person => person.role === 'actor').slice(0, 5);
	const name = item.type === 'episode' ? `${item.contextualTitle} ${item.title}` : item.title;
	const thumbnailUrl = item.images ? item.images.tile : '';
	const hostURL = getHostURL();
	let baseMetadata: any = {
		name,
		description: item.description || item.shortDescription,
		thumbnailUrl,
		genre: (item.genres || []).join(', '),
		image: (item.images || {}).poster,
		director: (director || {}).name,
		actor: actors.map(actor => actor.name),
		copyrightYear: item.releaseYear,
		url: `${hostURL}${item.path}`
	};

	if (item.offers && item.offers.length) {
		const offers = getOffers(item);

		if (offers.length) {
			baseMetadata.offers = {
				'@type': 'Offer',
				price: offers[0].price,
				priceCurrency: currencyCode
			};

			if (item.type !== 'channel') {
				baseMetadata.expires = toISO8601(offers[0].endDate);
			} else {
				baseMetadata.publication = {
					'@type': 'BroadcastEvent',
					name: offers[0].name,
					isLiveBroadcast: true,
					startDate: toISO8601(offers[0].startDate),
					endDate: toISO8601(offers[0].endDate)
				};
			}
		}
	}

	if (item.averageUserRating) {
		baseMetadata.aggregateRating = {
			'@type': 'AggregateRating',
			bestRating: 10,
			ratingValue: item.averageUserRating
		};
	}

	if (item.type !== 'season') {
		baseMetadata.contentRating = (item.classification || ({} as any)).name;
		baseMetadata.duration = durationISO8601(item.duration);
	}

	let extraMetadata;

	switch (item.type) {
		case 'movie':
			extraMetadata = {
				'@type': 'Movie',
				dateCreated: item.releaseYear
			};
			break;
		case 'episode':
			extraMetadata = {
				'@type': 'TVEpisode',
				contentRating: (item.classification || ({} as any)).name,
				copyrightYear: 0,
				episodeNumber: item.episodeNumber
			};
			break;
		case 'season':
			extraMetadata = {
				'@type': 'TVSeason',
				numberOfEpisodes: item.episodeCount || (item.episodes && item.episodes.size) || 0,
				seasonNumber: item.seasonNumber
			};
			break;
		default:
			break;
	}

	const typeSpecificJSON = Object.assign(baseMetadata, extraMetadata);
	const graphMetaData = [{ ...typeSpecificJSON }];

	// VideoObject JSON
	if (item.watchPath) {
		const imageEntries = item.images && Object.entries(item.images);
		graphMetaData.push(
			Object.assign(baseMetadata, {
				'@type': 'VideoObject',
				thumbnailUrl:
					imageEntries && imageEntries.length
						? Object.entries(item.images).map(entry => {
								return entry[1];
						  })
						: [],
				uploadDate: toISO8601(item.customFields.LicensingWindowStart),
				contentUrl: `${hostURL}${item.path}`,
				embedUrl: `${hostURL}/embed/${item.id}`,
				regionsAllowed: getRegionAllowed(item.customFields.Territory)
			})
		);
	}

	return {
		'@context': 'http://schema.org',
		'@graph': graphMetaData
	};
}

function createChannelRichSnippet(item: api.ItemDetail) {
	const hostURL = getHostURL();
	const { path, description, shortDescription, images, title } = item;
	const licensingWindowStart = get(item, 'customFields.LicensingWindowStart');

	const richSnippet: any = {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		contentURL: `${hostURL}${path}`,
		description: description || shortDescription,
		name: title,
		thumbnailUrl: images ? images.tile : '',
		uploadDate: toISO8601(licensingWindowStart)
	};

	const publicationObject: any = {
		'@type': 'BroadcastEvent',
		isLiveBroadcast: true
	};

	const offers = getOffers(item);
	if (offers.length > 0) {
		const firstOffer = offers[0];
		const { startDate, endDate } = firstOffer;
		const formattedStartDate = toISO8601(startDate);
		const formattedEndDate = toISO8601(endDate);

		richSnippet.expires = formattedEndDate;

		publicationObject.startDate = formattedStartDate;
		publicationObject.endDate = formattedEndDate;
	}

	richSnippet.publication = [publicationObject];

	return richSnippet;
}

function createIDPDetailRichSnippet(item: api.ItemDetail, pageKey: String): any {
	const { title, images, description, shortDescription, path, releaseYear, duration, contextualTitle } = item;
	const name = pageKey === EpisodeDetail ? `${contextualTitle} ${title}` : title;
	const image = images ? images.tile : '';
	const datePublished = String(releaseYear);
	const actor = [{ '@type': 'Person', name: getNamesByRole(item, 'actor') }];
	let baseMetadata: any = {
		name,
		description: description || shortDescription,
		url: pageKey === ShowDetail ? get(item, 'show.path') : path
	};
	let extraMetadata;
	switch (pageKey) {
		case MovieDetail:
			extraMetadata = {
				'@type': 'Movie',
				genre: getGenresAndCapitalize(item),
				datePublished,
				image,
				duration: durationISO8601(duration),
				director: [
					{
						'@type': 'Person',
						name: getNamesByRole(item, 'director')
					}
				],
				actor
			};
			break;
		case EpisodeDetail:
			extraMetadata = {
				'@type': 'TVEpisode',
				datePublished,
				duration: durationISO8601(duration),
				image,
				actor
			};
			break;
		case ShowDetail:
			extraMetadata = {
				'@type': 'TVSeries',
				genre: getGenresAndCapitalize(item),
				startDate: datePublished,
				actor
			};
			break;
		case SeasonDetail:
			extraMetadata = {
				'@type': 'TVSeason',
				genre: getGenresAndCapitalize(item),
				startDate: datePublished,
				actor
			};
			break;
		case ProgramDetail:
			extraMetadata = {
				'@type': 'Clip',
				uploadDate: datePublished,
				thumbnailUrl: image
			};
			break;
		default:
			break;
	}

	return {
		'@context': 'http://schema.org',
		...baseMetadata,
		...extraMetadata
	};
}

function getRegionAllowed(territory: string): string {
	return territory && territory.indexOf('Singapore') > -1 ? 'SG' : '';
}

function getNamesByRole(item, role) {
	return (item.credits || [])
		.filter(credit => credit.role === role)
		.map(credit => credit.name)
		.join(', ');
}

function getGenresAndCapitalize(item) {
	const formattedGenres = (item.genres || [])
		.map(genre =>
			genre
				.split(' ')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
		)
		.join(', ');

	return [formattedGenres];
}

function getOffers(item) {
	if (item.offers && item.offers.length > 0) {
		const validOwnerships = [Ownership.Free, Ownership.Rent, Ownership.Own, Ownership.Subscription];
		const offers = item.offers
			.filter(offer => validOwnerships.includes(offer.ownership))
			.sort((a, b) => a.price - b.price);
		return offers;
	}
	return [];
}

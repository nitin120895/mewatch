import * as allPageTemplates from 'shared/page/pageTemplate';
import * as allPageEntryTemplates from 'shared/page/pageEntryTemplate';
import { findPageEntryView } from 'shared/page/configPage';

export const getSupportedEntries = (pageTemplate: string, entries: api.PageEntry[]): api.PageEntry[] => {
	let pageTemplateEntries;

	switch (pageTemplate) {
		case allPageTemplates.Home:
		case allPageTemplates.Category:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.H1Standard },
				{ template: allPageEntryTemplates.H2Peeking },
				{ template: allPageEntryTemplates.H5Thumbnails },
				{ template: allPageEntryTemplates.H6Peeking },
				{ template: allPageEntryTemplates.H7Mosaic },
				{ template: allPageEntryTemplates.H9Image },
				{ template: allPageEntryTemplates.H10Text },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.P1Standard },
				{ template: allPageEntryTemplates.P2Large },
				{ template: allPageEntryTemplates.Pb1Cover },
				{ template: allPageEntryTemplates.Pb2Text },
				{ template: allPageEntryTemplates.Pb3Background },
				{ template: allPageEntryTemplates.Pb4Image },
				{ template: allPageEntryTemplates.B1Standard },
				{ template: allPageEntryTemplates.B2Large },
				{ template: allPageEntryTemplates.B3Double },
				{ template: allPageEntryTemplates.T1Standard },
				{ template: allPageEntryTemplates.T2Large },
				{ template: allPageEntryTemplates.T3Double },
				{ template: allPageEntryTemplates.T4DoubleLarge },
				{ template: allPageEntryTemplates.T5DoubleFeatured },
				{ template: allPageEntryTemplates.Tb1Cover },
				{ template: allPageEntryTemplates.Tb2Text },
				{ template: allPageEntryTemplates.Tb3Background },
				{ template: allPageEntryTemplates.Tb4Image },
				{ template: allPageEntryTemplates.Tl1Standard },
				{ template: allPageEntryTemplates.S1Standard },
				{ template: allPageEntryTemplates.S2Large },
				{ template: allPageEntryTemplates.S3Double },
				{ template: allPageEntryTemplates.Sb1Cover },
				{ template: allPageEntryTemplates.Sb2Text },
				{ template: allPageEntryTemplates.Sb3Background },
				{ template: allPageEntryTemplates.Sb4Image },
				{ template: allPageEntryTemplates.Ed1Image },
				{ template: allPageEntryTemplates.Ed2Text },
				{ template: allPageEntryTemplates.Tx1Links },
				{ template: allPageEntryTemplates.Pr1Banner },
				{ template: allPageEntryTemplates.U1Poster },
				{ template: allPageEntryTemplates.U2Tile },
				{ template: allPageEntryTemplates.U3Block },
				{ template: allPageEntryTemplates.U4Square }
			];
			break;

		case allPageTemplates.SubCategory:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.H9Image },
				{ template: allPageEntryTemplates.H10Text },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.P1Standard },
				{ template: allPageEntryTemplates.B1Standard },
				{ template: allPageEntryTemplates.T1Standard },
				{ template: allPageEntryTemplates.S1Standard },
				{ template: allPageEntryTemplates.Tx1Links },
				{ template: allPageEntryTemplates.Pr1Banner }
			];
			break;

		case allPageTemplates.ListDetail:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.Lh1Standard },
				{ template: allPageEntryTemplates.Lh2Centered },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.Cs5ContinuousAutomatic }
			];
			break;

		case allPageTemplates.ListDetailFeatured:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.H1Standard },
				{ template: allPageEntryTemplates.H2Peeking },
				{ template: allPageEntryTemplates.H9Image },
				{ template: allPageEntryTemplates.H10Text },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.Cs1ContinuousPoster },
				{ template: allPageEntryTemplates.Cs2ContinuousTile },
				{ template: allPageEntryTemplates.Cs3ContinuousBlock },
				{ template: allPageEntryTemplates.Cs4ContinuousSquare },
				{ template: allPageEntryTemplates.P1Standard },
				{ template: allPageEntryTemplates.T1Standard },
				{ template: allPageEntryTemplates.B1Standard },
				{ template: allPageEntryTemplates.S1Standard },
				{ template: allPageEntryTemplates.Tl1Standard },
				{ template: allPageEntryTemplates.Ed1Image },
				{ template: allPageEntryTemplates.Ed2Text },
				{ template: allPageEntryTemplates.Tx1Links }
			];
			break;

		case allPageTemplates.ItemDetail:
		case allPageTemplates.MovieDetail:
		case allPageTemplates.ProgramDetail:
		case allPageTemplates.CustomDetail:
		case allPageTemplates.ShowDetail:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.Dh1Standard },
				{ template: allPageEntryTemplates.Dh2Centered },
				{ template: allPageEntryTemplates.D1EpisodeGrid },
				{ template: allPageEntryTemplates.D2EpisodeList },
				{ template: allPageEntryTemplates.D3EpisodeRow },
				{ template: allPageEntryTemplates.D4Trailers },
				{ template: allPageEntryTemplates.D5RecommendationsTile },
				{ template: allPageEntryTemplates.D6RecommendationsPoster },
				{ template: allPageEntryTemplates.D7RecommendationsSquare },
				{ template: allPageEntryTemplates.D8CastCrew },
				{ template: allPageEntryTemplates.D9CastCrewText },
				{ template: allPageEntryTemplates.D10Info }
			];
			break;

		case allPageTemplates.Editorial:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.H9Image },
				{ template: allPageEntryTemplates.H10Text },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.Ed1Image },
				{ template: allPageEntryTemplates.Ed2Text }
			];
			break;

		case allPageTemplates.Support:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.H10Text },
				{ template: allPageEntryTemplates.H11PageTitle },
				{ template: allPageEntryTemplates.Ed3SupportText }
			];
			break;

		case allPageTemplates.Account:
			pageTemplateEntries = [
				{ template: allPageEntryTemplates.Ah1Poster },
				{ template: allPageEntryTemplates.Ah2Tile },
				{ template: allPageEntryTemplates.Ah3Text },
				{ template: allPageEntryTemplates.A1Details },
				{ template: allPageEntryTemplates.A4Profiles },
				{ template: allPageEntryTemplates.A5ParentalLock },
				{ template: allPageEntryTemplates.P1Standard },
				{ template: allPageEntryTemplates.B1Standard },
				{ template: allPageEntryTemplates.S1Standard },
				{ template: allPageEntryTemplates.T1Standard },
				{ template: allPageEntryTemplates.Tl1Standard },
				{ template: allPageEntryTemplates.U1Poster },
				{ template: allPageEntryTemplates.U2Tile },
				{ template: allPageEntryTemplates.U3Block },
				{ template: allPageEntryTemplates.U4Square },
				{ template: allPageEntryTemplates.Ed1Image },
				{ template: allPageEntryTemplates.Ed2Text },
				{ template: allPageEntryTemplates.Tx1Links },
				{ template: allPageEntryTemplates.Pr1Banner }
			];
			break;

		case allPageTemplates.Watch:
			pageTemplateEntries = [{ template: allPageEntryTemplates.PlayerStandard }];
			break;

		default:
			break;
	}

	if (!pageTemplateEntries) {
		return entries;
	}

	return entries.filter(entry => findPageEntryView(pageTemplateEntries, entry));
};

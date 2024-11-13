import { get } from 'shared/util/objects';

export enum PersonalisationModalCta {
	coldStart = '@{successful-update-personalisation_cta}',
	profileManagement = '@{account_common_row_toggleButton_active_label}'
}

export const enum PersonalizationCategoriesMode {
	preview = 'preview',
	edit = 'edit'
}

export const pageSize = 50;

export const isCategorySelected = (category: string, selectedCategories: string[]): boolean =>
	selectedCategories.some(item => item === category);

export const findCategoryByGenreAliases = (categories: api.ItemList[], targetGenreAlias: string): api.ItemList =>
	categories.find(category => get(category, 'customFields.genreAlias') === targetGenreAlias);

export const genreStringToArray = (genre: string): string[] => genre.split(' ');

export function getUpdatedGenres(oldGenres: string[], newGenres: string[]): string[] {
	const genresArray = [...oldGenres];

	newGenres.forEach(element => {
		const index = genresArray.indexOf(element);
		if (index === -1) {
			genresArray.push(element);
		} else {
			genresArray.splice(index, 1);
		}
	});

	return genresArray;
}

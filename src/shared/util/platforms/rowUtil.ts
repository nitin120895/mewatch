import { Ed1Image } from 'shared/page/pageEntryTemplate';

export const buildCustomInfoBetweenEntries = (entries: api.PageEntry[]) => {
	for (let i = 0; i < entries.length; i++) {
		const curEntry = entries[i];
		if (curEntry.template === Ed1Image) {
			const imageVerticalSpacing = curEntry.customFields && curEntry.customFields.imageVerticalSpacing;

			if (imageVerticalSpacing) {
				const preEntry = i > 0 && entries[i - 1];
				const nextEntry = i < entries.length - 1 && entries[i + 1];

				if (preEntry) preEntry.customFields = preEntry.customFields || {};
				if (nextEntry) nextEntry.customFields = nextEntry.customFields || {};

				switch (imageVerticalSpacing) {
					case 'ignoreBoth':
						if (preEntry) preEntry.customFields.noBottomPadding = true;
						curEntry.customFields.noBottomPadding = true;
						if (nextEntry) nextEntry.customFields.noTopPadding = true;
						break;
					case 'ignoreTop':
						if (preEntry) preEntry.customFields.noBottomPadding = true;
						break;
					case 'ignoreBottom':
						curEntry.customFields.noBottomPadding = true;
						if (nextEntry) nextEntry.customFields.noTopPadding = true;
						break;
					default:
						break;
				}
			}
		}
	}

	return entries;
};

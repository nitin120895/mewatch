/**
 * Create mock data for component viewer
 */
export default function createMockPageEntry(
	id: string,
	title: string,
	template: string,
	customFields?: object,
	savedState: object = {}
): PageEntryPropsBase {
	return { id, title, template, savedState, customFields };
}

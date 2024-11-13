/*
 * Simple api to perform change on a profile relating to the kids segment.
 * This works under the condition that the const KIDS matches the
 * same value returned from the PM for a row segment.
 * */

/* This needs to match the kids segment value set in the PM.*/
export const KIDS = 'kids';

export function setKidsProfile(segments: string[]): string[] {
	const segmentSet = new Set(segments);
	segmentSet.add(KIDS);
	return Array.from(segmentSet);
}

export function unsetKidsProfile(segments: string[]): string[] {
	return segments.filter(segment => segment !== KIDS);
}

export function isKidsProfile(segments: string[]): boolean {
	return !!~segments.indexOf(KIDS);
}

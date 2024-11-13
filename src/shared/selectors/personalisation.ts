import { isKidsProfile } from 'ref/responsive/util/kids';
import { get } from 'shared/util/objects';

export const selectFirstName = (account: state.Account): string => get(account, 'info.firstName');
export const selectLastName = (account: state.Account): string => get(account, 'info.lastName');

export const selectFullName = (account: state.Account): string => {
	const firstName = selectFirstName(account);
	const lastName = selectLastName(account);

	return `${firstName} ${lastName}`;
};

export const selectPersonalisationGenreListId = (
	profile: api.ProfileSummary,
	personalisation: api.AppConfigPersonalisation
): string => {
	const segments = profile ? profile.segments : [];
	const { personalisationGenreListId, personalisationGenreListIdForKids } = personalisation;

	if (segments.length) {
		return isKidsProfile(segments) ? personalisationGenreListIdForKids : personalisationGenreListId;
	}
};

export const getProfiles = (account: state.Account) => get(account, 'info.profiles') || [];

export const getProfileById = (profiles: api.ProfileSummary[], profileId: string): api.ProfileSummary =>
	profiles.find(p => p.id === profileId);

export const getProfileSegment = (profile): string[] => profile.segments;

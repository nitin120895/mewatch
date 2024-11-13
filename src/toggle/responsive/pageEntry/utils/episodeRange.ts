import { EPISODES_PER_OPTION } from '../itemDetail/d2/EpisodeRangeSelector';

export interface EpisodeRange {
	from: number;
	to: number;
	key: string;
}

export function calcEpisodeGroupsByIndex(amount: number): EpisodeRange[] {
	if (amount === 0) return [];
	const groups = Math.ceil(amount / EPISODES_PER_OPTION);
	const arrayGroups = [];
	let lastIndex = 0;
	for (let i = 0; i < groups; i++) {
		const lastGroup = i === groups - 1;
		const to = lastGroup ? amount : lastIndex + EPISODES_PER_OPTION;
		let key;
		if (lastGroup && lastIndex === amount - 1) {
			key = `${amount}`;
		} else if (lastGroup) {
			key = `${lastIndex + 1}-${amount}`;
		} else {
			key = `${lastIndex + 1}-${lastIndex + EPISODES_PER_OPTION}`;
		}

		arrayGroups.push({
			from: lastIndex + 1,
			to: to,
			key: key
		});
		lastIndex += EPISODES_PER_OPTION;
	}

	arrayGroups.unshift({
		from: 1,
		to: amount,
		key: '@{itemDetail_episode_range_option_all}'
	});
	return arrayGroups;
}

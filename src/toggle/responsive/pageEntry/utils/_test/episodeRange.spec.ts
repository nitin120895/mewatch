import { calcEpisodeGroupsByIndex } from '../episodeRange';
import { expect } from 'chai';

describe.only('episode range', () => {
	describe('calcEpisodeGroups', () => {
		it('should return empty array if group size bigger then the episode count', () => {
			const result = calcEpisodeGroupsByIndex(0);
			expect(result).to.deep.equal([]);
		});

		it('should return grouped episodes', () => {
			const result = calcEpisodeGroupsByIndex(3);
			expect(result.length).to.equal(2);
			expect(result).to.deep.equal([
				{
					key: `@{itemDetail_episode_range_option_all}`,
					from: 1,
					to: 3
				},
				{
					key: `1-3`,
					from: 1,
					to: 3
				}
			]);
		});

		it('should return grouped episodes and left over handled properly', () => {
			const result = calcEpisodeGroupsByIndex(25);
			expect(result.length).to.equal(3);
			expect(result).to.deep.equal([
				{
					key: `@{itemDetail_episode_range_option_all}`,
					from: 1,
					to: 25
				},
				{
					key: `1-24`,
					from: 1,
					to: 24
				},
				{
					key: `25`,
					from: 25,
					to: 25
				}
			]);
		});

		it('should handle multiple items in last group ', () => {
			const result = calcEpisodeGroupsByIndex(48);
			expect(result.length).to.equal(3);
			expect(result).to.deep.equal([
				{
					key: `@{itemDetail_episode_range_option_all}`,
					from: 1,
					to: 48
				},
				{
					key: `1-24`,
					from: 1,
					to: 24
				},
				{
					key: `25-48`,
					from: 25,
					to: 48
				}
			]);
		});
	});
});

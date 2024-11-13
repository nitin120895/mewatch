import { truncateSentences } from '../strings';
import { expect } from 'chai';

describe('strings', () => {
	describe('truncateSentences', () => {
		const S1 =
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat vulputate rutrum. Mauris posuere elit ullamcorper ante feugiat pellentesque. Morbi quis elementum magna, non finibus lectus. Duis vel eros eget nunc cursus suscipit.';
		const S2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

		it('shoud truncate around char 10', () => {
			const text = truncateSentences(S1, 10);
			expect(text).to.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
		});
		it('shoud truncate around char 100', () => {
			const text = truncateSentences(S1, 60);
			expect(text).to.equal(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat vulputate rutrum.'
			);
		});
		it('should handle a single sentance', () => {
			const text = truncateSentences(S2);
			expect(text).to.equal(S2);
		});
		it('should handle a single sentance with large min char', () => {
			const text = truncateSentences(S2, 200);
			expect(text).to.equal(S2);
		});
	});
});

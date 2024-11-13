import { expect } from 'chai';
import { convertTimeToSeconds } from '../time';

describe('Converting Time to Seconds', () => {
	it('Must not attempt to convert strings that do not meet the HH:mm:ss format', () => {
		const invalidTimeStrings = ['Lizard', '', '11:to:33', 'aa:22:33', 'aa:cc:33', '11:22:33:44', ':::'];

		invalidTimeStrings.forEach(string => {
			expect(convertTimeToSeconds(string)).to.equal(undefined);
		});
	});

	it('Must convert times to the correct value', () => {
		expect(convertTimeToSeconds('00:00:00')).to.equal(0);
		expect(convertTimeToSeconds('00:00:01')).to.equal(1);
		expect(convertTimeToSeconds('00:00:10')).to.equal(10);
		expect(convertTimeToSeconds('00:01:00')).to.equal(60);
		expect(convertTimeToSeconds('00:10:00')).to.equal(600);
		expect(convertTimeToSeconds('01:00:00')).to.equal(3600);
		expect(convertTimeToSeconds('10:00:00')).to.equal(36000);

		expect(convertTimeToSeconds('58:95:80')).to.equal(214580);
		expect(convertTimeToSeconds('77:14:28')).to.equal(278068);
		expect(convertTimeToSeconds('26:90:43')).to.equal(99043);
		expect(convertTimeToSeconds('19:31:42')).to.equal(70302);
		expect(convertTimeToSeconds('37:26:57')).to.equal(134817);
		expect(convertTimeToSeconds('92:31:94')).to.equal(333154);
		expect(convertTimeToSeconds('51:55:62')).to.equal(186962);
		expect(convertTimeToSeconds('99:13:34')).to.equal(357214);

		expect(convertTimeToSeconds('00:13:57')).to.equal(837);
		expect(convertTimeToSeconds('00:22:29')).to.equal(1349);
		expect(convertTimeToSeconds('00:34:41')).to.equal(2081);
	});

	it('Must be able to handle missing hours', () => {
		expect(convertTimeToSeconds('00:00')).to.equal(0);
		expect(convertTimeToSeconds('00:01')).to.equal(1);
		expect(convertTimeToSeconds('00:10')).to.equal(10);
		expect(convertTimeToSeconds('01:00')).to.equal(60);
		expect(convertTimeToSeconds('10:00')).to.equal(600);
	});
});

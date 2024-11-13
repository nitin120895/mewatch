import { addSecurityHeaders, getRobotsBody } from '../util';
import { expect } from 'chai';

const resMock = {
	headers: [],
	setHeader: function(name, value) {
		let index = this.headers.length;
		let deleteCount = 0;
		let header = this.headers.find((header, currIndex) => {
			if (header.name === name) {
				index = currIndex;
				deleteCount = 1;
				return header;
			}
		});

		if (!header) {
			header = {
				name
			};
		}

		header.value = value;

		this.headers.splice(index, deleteCount, header);
	}
};

describe('Security Headers', () => {
	it('should only accept integers', () => {
		['a', 'false', ' ', ''].forEach(val => {
			const res = Object.assign({}, resMock);
			process.env.STRICT_TRANSPORT_SECURITY_MAX_AGE = val;
			addSecurityHeaders(res);
			expect(res.headers.length).to.equal(0);
		});
	});

	it('should not include the header if the value is -1 or less', () => {
		const res = Object.assign({}, resMock);
		['-1', '-1661', '-658093', '-3493491'].forEach(val => {
			process.env.STRICT_TRANSPORT_SECURITY_MAX_AGE = val;
			addSecurityHeaders(res);
			expect(res.headers.length).to.equal(0);
		});
	});

	it('should include the header if and the value should be the value of the env var if it is 0 or greater', () => {
		['0', '100', '1000000', '0100000'].forEach(val => {
			const res = Object.assign({}, resMock);
			process.env.STRICT_TRANSPORT_SECURITY_MAX_AGE = val;
			addSecurityHeaders(res);
			const maxAge = parseInt(val, 10);
			expect(res.headers.find(header => header.name === 'Strict-Transport-Security').value).to.equal(
				`max-age=${maxAge}`
			);
		});
	});
});

describe('Robots.txt', () => {
	const robotsData = {
		'*': 'User-agent: *\\nDisallow: *',
		'dev.preso.toggle.sg': 'User-agent: *\\nDisallow: *',
		localhost: "If you're seeing this on localhost it's working properly"
	};

	describe('ROBOTS_TXT has content', () => {
		beforeEach(() => {
			process.env.ROBOTS_TXT = JSON.stringify(robotsData);
		});

		afterEach(() => {
			delete process.env.ROBOTS_TXT;
		});

		it('should return the default response if the host is not found', () => {
			expect(getRobotsBody(undefined)).to.equal('User-agent: *\\nDisallow: *');
			expect(getRobotsBody('google.com')).to.equal('User-agent: *\\nDisallow: *');
		});

		it('should return the correct response if the host is present in the list', () => {
			expect(getRobotsBody('localhost')).to.equal(`If you're seeing this on localhost it's working properly`);
			expect(getRobotsBody('dev.preso.toggle.sg')).to.equal('User-agent: *\\nDisallow: *');
		});
	});

	describe('ROBOTS_TXT does not have content', () => {
		beforeEach(() => {
			process.env.ROBOTS_TXT = '';
		});

		afterEach(() => {
			delete process.env.ROBOTS_TXT;
		});

		it('must not fail if the environment variable is empty', () => {
			process.env.ROBOTS_TXT = '';

			expect(getRobotsBody(undefined)).to.equal('');
			expect(getRobotsBody('localhost')).to.equal('');
		});
	});

	describe('ROBOTS_TXT is not set', () => {
		it('must not fail if the environment variable does not exist', () => {
			beforeEach(() => {
				delete process.env.ROBOTS_TXT;
			});

			expect(getRobotsBody(undefined)).to.equal('');
			expect(getRobotsBody('localhost')).to.equal('');
		});
	});
});

if (process.env.TEST_REPORT_PATH) {
	const junit = require('jest-junit-reporter');
	module.exports = reports => {
		junit(reports);
		return reports;
	};
} else {
	module.exports = results => results;
}

require('shelljs/global');
const openapi = require('openapi-client');
require('dotenv').config();

openapi
	.genCode({
		src: `${process.env.CLIENT_SERVICE_URL}/spec`,
		outDir: './src/shared/service',
		language: 'ts',
		indent: 'tab',
		semicolon: true,
		redux: true
	})
	.then(complete, error);

function complete(spec) {
	console.info('Service generation complete');
	console.info('Formatting generated code');
	exec('yarn format:js');
	process.exit(0);
}

function error(e) {
	const msg = e instanceof Error ? e.message : e;
	console.error(msg);
	process.exit(1);
}

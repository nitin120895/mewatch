const bunyan = require('bunyan');
const path = require('path');

let streams;
if (_DEV_ || process.stdout.isTTY) {
	streams = [
		{
			type: 'raw',
			stream: require('bunyan-debug-stream')({
				basepath: path.resolve('./'),
				forceColor: true
			})
		}
	];
}
const level = process.env.NODE_ENV === 'production' ? bunyan.INFO : _SSR_ ? bunyan.DEBUG : bunyan.ERROR; // when not in prod, and not server rendering, only show errors +

export const logger = bunyan.createLogger({
	name: 'slingshot',
	level,
	streams,
	src: false
});

export function debug(data, message?: string) {
	logger.debug.apply(logger, arguments);
}

export function info(data, message?: string) {
	logger.info.apply(logger, arguments);
}

export function warn(data, message?: string) {
	logger.warn.apply(logger, arguments);
}

export function error(e, message?: string) {
	logger.error.apply(logger, arguments);
}

export function fatal(e, message?: string) {
	logger.fatal.apply(logger, arguments);
}

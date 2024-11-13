require('shelljs/global');

/**
 * Clean one or more directories under bin.
 *
 * You can pass these in at the command line or define them in an npm script.
 *
 * e.g. `npm run clean app docker` // clean the bin/app and bin/docker folders.
 *
 * If no folders are specificed then 'docker', 'app' and 'nuget' will be cleaned.
 *
 * Note that we don't want to clean bin directly in many cases as our tests
 * sit under bin/test and we need to parse those under CI.
 */
const BASE_DIR = './bin';
const DEFAULT_DIRS = ['docker', 'app', 'nuget'];

const dirs = process.argv.slice(2);
(dirs.length ? dirs : DEFAULT_DIRS).forEach(dir => rm('-rf', `${BASE_DIR}/${dir}`));

require('shelljs/global');
const fs = require('fs');
const path = require('path');

const vars = require(path.resolve('./build/variables'));

config.fatal = true; // shelljs/global throw if failure occurs

// Copy Version

// We don't want to require the entire 'package.json' in the server
// as this can grow quite large and consume valuable memory.
// Instead we copy up the version number from package.json to a
// text file containing just this value. The server then reads this in
// and returns it in responses under the 'Server' header.

const SERVER_DIR = './bin/app/server';
const VERSION_FILE = `${SERVER_DIR}/version`;
const VERSION = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
mkdir('-p', SERVER_DIR);
fs.writeFileSync(VERSION_FILE, VERSION, 'utf8');

// Copy Strings

const STRINGS_DIR = './bin/app/server/string';
mkdir('-p', STRINGS_DIR);
cp('-R', path.join(vars.resources.stringsBase, '*.json'), STRINGS_DIR);

// Copy SSL certificate for development

const SSL_DIR = './bin/app/server/ssl';
mkdir('-p', SSL_DIR);
cp('-R', './resource/ssl/*', SSL_DIR);

// Copy any thrid party scripts
cp('./resource/monitor/newrelic.js', SERVER_DIR);
cp('./resource/toggle/scripts/conviva-core-sdk.min.js', SERVER_DIR);

// Copy conviva manually for dev build
const PUB_DIR = './bin/app/pub';
mkdir('-p', PUB_DIR);
cp('./resource/toggle/scripts/conviva-core-sdk.min.js', PUB_DIR);

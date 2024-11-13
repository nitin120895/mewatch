/*
Prepare the component explorer for a release to a Docker registry.

While the component explorer is primarily for development purposes, it can
be useful to deploy it so external parties can view the progress of components
being built.
*/
require('shelljs/global');
const fs = require('fs');

config.fatal = true; // shelljs/global throw if failure occurs

exec('npm run build:qa');

const DOCKER_DIR = './bin/docker';
const EXPLORER_DIR = `${DOCKER_DIR}/explorer`;
const PUB_DIR = `${EXPLORER_DIR}/pub`;

mkdir('-p', EXPLORER_DIR);
mkdir('-p', PUB_DIR);

// Copy over our compiled explorer along with required dependencies
cp('-rf', './build/docker/explorer/*', EXPLORER_DIR);
cp('-rf', './bin/app/pub/**/*', PUB_DIR);

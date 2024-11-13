require('shelljs/global');
const fs = require('fs');
const path = require('path');

const vars = require(path.resolve('./build/variables'));

config.fatal = true; // shelljs/global throw if failure occurs

const args = process.argv.slice(2);

// An option to state that assets will be served from an S3 bucket.
//
// If static assets are being uploaded to S3 instead of served
// from the node server then there's no need to include them in
// the docker image. We do still include js and css as these
// may be inlined into the html page if below a given size.
const s3 = args.some(arg => arg === 's3');

// Compile the production version of the app and server
exec('npm run clean');
exec('npm run build');

/// PREP DOCKER

const DOCKER_DIR = './bin/docker';
const APP_DIR = `${DOCKER_DIR}/app`;
const PUB_DIR = `${APP_DIR}/pub`;
const NGINX_DIR = `${DOCKER_DIR}/nginx`;

// clear our root directory where we'll set up our docker images
mkdir('-p', APP_DIR);
mkdir('-p', PUB_DIR);
mkdir('-p', NGINX_DIR);

// Remove our development ssl certificate
rm('-rf', './bin/app/server/ssl');

// Copy over our compiled app along with dependencies needed for the web app image.
cp('-rf', './build/docker/app/*', APP_DIR);
cp('-rf', './bin/app/server', `${APP_DIR}/server`);

// If we're going to offload static asset serving to S3 then only copy
// in assets we may decide to inline into the html page.
// Otherwise copy all assets in and we'll serve them up directly.
if (s3) cp('-rf', './bin/app/pub/*(*.js|*.css|*.json)', PUB_DIR);
else cp('-rf', './bin/app/pub/**/*', PUB_DIR);

cp(vars.resources.favicon, PUB_DIR);
cp('package.json', APP_DIR);
cp('yarn.lock', APP_DIR);
cp('.env-sample', APP_DIR);

// See https://github.com/yarnpkg/yarn/issues/761
// Note this issue is fixed in yarn now but not yet released
const pkg = JSON.parse(fs.readFileSync(`${APP_DIR}/package.json`, 'utf8'));
delete pkg.devDependencies;
fs.writeFileSync(`${APP_DIR}/package.json`, JSON.stringify(pkg), 'utf8');

// Copy over our NGiNX configuration and Dockerfile
cp('-R', './build/docker/nginx/*', NGINX_DIR);

// Copy over our docker compose file so we can run our setup locally
cp('./build/docker/docker-compose.yml', DOCKER_DIR);

/// PREP NUGET

const NUGET_DIR = './bin/nuget';
const ASSET_DIR = `${NUGET_DIR}/asset`;

mkdir('-p', ASSET_DIR);

cp('./build/docker/taskdef.json', NUGET_DIR);
cp('-rf', './build/nuget/*', NUGET_DIR);
cp('-rf', './bin/app/pub/*', ASSET_DIR);

rm(`${ASSET_DIR}/sw.js`);
rm(`${ASSET_DIR}/stats.json`);

#!/bin/bash

set -e

yarn install

yarn lint

# Run tests and generate results and coverage report
yarn test:ci

# If a SemverVersion has not been passed in then we'll attempt to determine it
if [ -z "$SemverVersion" ]; then
    yarn global add bitbucket-semver@1

    echo "determining Semver version based on merged pull requests"
    BbSemverOut="$(bbsemver -v)"
    echo "$BbSemverOut"
    # Grab new version from last line of output
    SemverVersion=$(echo "$BbSemverOut" | tail -n1)

    # If there's no new version then exit
    if [ "$SemverVersion" = "unchanged" ]; then
        echo "no version change found, aborting release"
        exit 1
    fi
else
    # If SemverVersion has a `<buildNumber>` placeholder, replace with `buildNumber`
    SemverVersion=${SemverVersion/\<buildNumber>/$buildNumber}
fi

# Update the project.json version
sed -i -E "s/(version\":).+\",/\1 \"$SemverVersion\",/" package.json
#sed -i '' -E "s/(version\":).+\",/\1 \"$SemverVersion\",/" package.json # osx version


# Transpile production js of the generic TV version
# move files according to the current tv-preview deployment:

#   /index.html
#   /index-x.x.x.html
#   /apps/x.x.x/app.#######.js
#   /apps/x.x.x/app.#######.css etc.

CLIENT_BASENAME=/apps/$SemverVersion yarn build:tv

mkdir bin/app/apps
mv bin/app/pub/index.html bin/app/index.html
cp bin/app/index.html bin/app/index-$SemverVersion.html
mv bin/app/pub bin/app/apps/$SemverVersion

# Push changes and tag
./build/script/ci/tag-release.sh $SemverVersion

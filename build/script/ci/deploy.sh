#!/bin/bash

set -e

CurrentBranch=$repository_git_branch

echo "The current branch is: $CurrentBranch"

# If current branch is master, take SemverVersion from package.json
if [ $CurrentBranch == "master" ]; then
    git checkout master
    SemverVersion=$(node -p "require('./package.json').version")
else
    if [ -z "$SemverVersion" ]; then
        echo "no version change found, aborting release"
        exit 1
    else
        # If SemverVersion has a `<buildNumber>` placeholder, replace with `buildNumber`
        SemverVersion=${SemverVersion/\<buildNumber>/$buildNumber}
    fi
fi

echo "Create Octopus release"
mono /usr/local/bin/octo.exe create-release \
  --project "$OctopusProject" \
  --channel "$OctopusChannel" \
  --version $SemverVersion \
	--package Axis.Web.Server:${SemverVersion} \
	--package Axis.Web.NGinx:${NginxVersion} \
  --server $OctopusServer \
  --apiKey $OctopusDeployApiKey \
  --releaseNotes "Automated release $SemverVersion"

echo "Deploy Octopus release"
mono /usr/local/bin/octo.exe deploy-release \
  --project "$OctopusProject" \
  --channel "$OctopusChannel" \
  --deployTo "$OctopusDeployEnv" \
  --version $SemverVersion \
  --server=$OctopusServer \
  --apikey=$OctopusDeployApiKey \
  --progress

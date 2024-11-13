
#!/bin/bash

set -e

SemverVersion=$1

if [ -z "$SemverVersion" ]
then
    echo "No version specified"
    exit 1
fi

# Get current branch
CurrentBranch=$repository_git_branch

echo "Release branch $CurrentBranch with tag $SemverVersion"

# Only tag master branch
if [ "$CurrentBranch" != "master" ]
then
    echo "SKIP: not master"
    exit 0
fi

# Ignore if tag already exists
if [ $(git tag -l "$SemverVersion") ]; then
    echo "SKIP: tag $SemverVersion already exists"
    exit 0
else
    echo "Tag does not yet exist."
fi

# Add and push package.json and changelog
git config --global user.email "builduser@massiveinteractive.com"
git config --global user.name "builduser"
git remote set-url origin ${planRepository_repositoryUrl}
git add package.json
git commit -m "${planName} ${SemverVersion}" --no-verify
git push origin master --no-verify

# Tag release
git tag -f -a ${SemverVersion} -m "${planName} ${SemverVersion}"
git push origin ${SemverVersion} --no-verify
git ls-remote --exit-code --tags origin ${SemverVersion}

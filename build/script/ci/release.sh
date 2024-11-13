#!/bin/bash

set -e

yarn install

yarn lint

# Run tests and generate results and coverage report
yarn test:ci

# If SemverVersion has a `<buildNumber>` placeholder, replace with `buildNumber`
SemverVersion=${SemverVersion/\<buildNumber>/$buildNumber}

# Update the project.json version
sed -i -E "s/(version\":).+\",/\1 \"$SemverVersion\",/" package.json
#sed -i '' -E "s/(version\":).+\",/\1 \"$SemverVersion\",/" package.json # osx version

# Transpile production js
yarn prep:release s3

cd ./bin/docker/app

docker build -t $DockerTag:$SemverVersion .

echo "Logging into ECR"

# Docker login to ECR
# $(aws ecr get-login --region $AwsRegion)
# See https://github.com/aws/aws-cli/issues/1926
$(aws ecr get-login --region $AwsRegion | sed -e 's/-e none//g')

# Upload the docker image to ECR
docker push $DockerTag:$SemverVersion

cd ../../../

cat > bin/nuget/docker.info <<EOF
tag=$DockerTag:$SemverVersion
EOF

# Pack Nuget package
mono /usr/local/bin/nuget.exe pack bin/nuget/Axis.Web.Server.nuspec \
	-BasePath bin/nuget \
	-Version $SemverVersion

# Publish Nuget package to Nexus
mono /usr/local/bin/nuget.exe push Axis.Web.Server.$SemverVersion.nupkg \
	-Source http://nexus.massiveinteractive.com/service/local/nuget/$NugetFolder/ \
	-ApiKey $NugetApiKey

# Push changes and tag
./build/script/ci/tag-release.sh $SemverVersion

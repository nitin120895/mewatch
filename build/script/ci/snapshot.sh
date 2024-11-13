#!/bin/bash

set -e

yarn global add s3-deploy@0.7.5
yarn global add ecs-task-deploy@1.1.0

echo "Preparing $DockerTagVersion release"

yarn install
yarn lint
yarn test:ci

yarn prep:release s3

# Add build revision number to base version so "/__info" path can
# tell us the latest build released
echo -n "-r$buildNumber" >> bin/docker/app/server/version

cd ./bin/docker/app

echo "Building Docker image $DockerTag:$DockerTagVersion"
docker build -t $DockerTag:$DockerTagVersion .

echo "Logging into ECR"
# Docker login to ECR
# $(aws ecr get-login --region $AwsRegion)
# See https://github.com/aws/aws-cli/issues/1926
$(aws ecr get-login --region $AwsEcrRegion | sed -e 's/-e none//g')

# Upload the docker image to ECR
echo "Pushing Docker image $DockerTag:$DockerTagVersion to ECR"
docker push $DockerTag:$DockerTagVersion

cd ../../../

# Upload assets to s3

echo "Replacing CLIENT_ASSET_URL varaible in compiled js and css"
find bin/nuget/asset -name '*.js' -o -name '*.css'|while read file; do
	sed -i "s;{{CLIENT_ASSET_URL}};$CLIENT_ASSET_URL;g" "$file"
	# sed -i '' "s;${{CLIENT_ASSET_URL}};$CLIENT_ASSET_URL;g" "$file" # osx version
done

echo "Uploading static assets to s3 bucket $AwsS3Bucket"

# limitation of 's3-deploy' you can't name the folder you're uploading to,
# instead it inherits the name you have locally. Since we need to target
# 'assets' on s3 we rename/move it from 'asset'
mv bin/nuget/asset bin/nuget/assets

s3-deploy './bin/nuget/assets/**' \
	--cwd './bin/nuget/' \
	--region $AwsS3Region \
	--bucket $AwsS3Bucket \
	--cache 31536000

echo "Deploying $DockerTag:$DockerTagVersion to ECS"
ecs-task-deploy \
    -r $AwsEcsRegion \
    -c $AwsEcsCluster \
    -n $AwsEcsService \
    -i $DockerTag:$DockerTagVersion \
    -v

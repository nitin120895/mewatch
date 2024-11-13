#!/bin/bash

set -e

yarn install --force
yarn lint
# Run tests and generate results and coverage report
yarn test:ci
# Build the static qa version of the app
yarn build:qa

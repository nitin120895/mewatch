#!/bin/sh
set -e

OUT=$1

ares-package $OUT -v -n -o bin/app
mv bin/app/*.ipk bin/webos.ipk
ls -la bin/*.ipk
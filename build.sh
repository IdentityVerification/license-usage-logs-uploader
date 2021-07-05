#!/bin/bash

VERSION=0.4.2
BUILD=0
VERSION="$VERSION.$BUILD"
echo "VERSION=$VERSION"

DOCKER_IMAGE="docker.microblink.com/license-usage-logs-uploader"
echo "DOCKER_IMAGE=$DOCKER_IMAGE"

IFS='.'
read -ra VER <<< "$VERSION"

MAJOR="${VER[0]}"
echo "MAJOR=$MAJOR"

MINOR="${VER[0]}.${VER[1]}"
echo "MINOR=$MINOR"

PATCH="${VER[0]}.${VER[1]}.${VER[2]}"
echo "PATCH=$PATCH"

docker-compose -f docker-compose.build.yml build

declare -a DOCKER_TAGS=("$VERSION" "$MAJOR" "$MINOR" "$PATCH")
for DOCKER_TAG in "${DOCKER_TAGS[@]}"
do
	docker tag "$DOCKER_IMAGE:latest" "$DOCKER_IMAGE:$DOCKER_TAG"
	echo "$DOCKER_IMAGE:$DOCKER_TAG"
done

echo "------- BUILD DONE -------"
echo ""

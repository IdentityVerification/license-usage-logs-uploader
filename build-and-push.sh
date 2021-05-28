#!/bin/bash

source ./build.sh

# Private
DOCKER_IMAGE_GCR="eu.gcr.io/blinkid-verify/license-usage-logs-uploader-private"

for DOCKER_TAG in "${DOCKER_TAGS[@]}"
do
	docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
	echo "docker push $DOCKER_IMAGE_GCR:$DOCKER_TAG"
	docker push "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
done

# Public
DOCKER_IMAGE_DOCKER_HUB="microblink/license-usage-logs-uploader"
for DOCKER_TAG in "${DOCKER_TAGS[@]}"
do
	docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
	echo "docker push $DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
	docker push "$DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
done

# Set tag
git tag "v$VERSION"
git push --tags

echo "------- BUILD & PUSH DONE -------"
echo ""

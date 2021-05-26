#!/bin/bash

source ./build.sh

DOCKER_IMAGE_GCR="eu.gcr.io/blinkid-verify/license-usage-logs-uploader-private"

for DOCKER_TAG in "${DOCKER_TAGS[@]}"
do
	docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
	echo "docker push $DOCKER_IMAGE_GCR:$DOCKER_TAG"
	docker push "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
done

echo "------- BUILD & PUSH DONE -------"
echo ""

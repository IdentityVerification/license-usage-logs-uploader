#!/bin/bash

source ./build.sh

# Private
DOCKER_IMAGE_GCR="eu.gcr.io/blinkid-verify/license-usage-logs-uploader-private"

if [ -z ${PRIVATE_RELEASE+x} ];
then
  echo "PRIVATE release skipped!";
else
  for DOCKER_TAG in "${DOCKER_TAGS[@]}"
  do
    docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
    echo "docker push $DOCKER_IMAGE_GCR:$DOCKER_TAG"
    docker push "$DOCKER_IMAGE_GCR:$DOCKER_TAG"
  done
fi

# Protected
DOCKER_IMAGE_MICROBLINK="docker.microblink.com/license-usage-logs-uploader"

if [ -z ${PROTECTED_RELEASE+x} ];
then
  echo "PROTECTED release skipped!";
else
  for DOCKER_TAG in "${DOCKER_TAGS[@]}"
  do
    docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_MICROBLINK:$DOCKER_TAG"
    echo "docker push $DOCKER_IMAGE_MICROBLINK:$DOCKER_TAG"
    docker push "$DOCKER_IMAGE_MICROBLINK:$DOCKER_TAG"
  done
fi

# Public
DOCKER_IMAGE_DOCKER_HUB="microblink/license-usage-logs-uploader"

if [ -z ${PUBLIC_RELEASE+x} ];
then
  echo "PUBLIC release skipped!";
else
  for DOCKER_TAG in "${DOCKER_TAGS[@]}"
  do
    docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
    echo "docker push $DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
    docker push "$DOCKER_IMAGE_DOCKER_HUB:$DOCKER_TAG"
  done
fi

# Set tag
git tag -f "v$VERSION"

# Source - private
if [ -z ${SOURCE_PRIVATE_PUSH+x} ];
then
  echo "Source private push skipped!";
else
  git push -f origin --tags
fi

# Source - public
if [ -z ${SOURCE_PUBLIC_PUSH+x} ];
then
  echo "Source public push skipped!";
else
  git push -f github --tags
fi

echo "------- BUILD & PUSH DONE -------"
echo ""

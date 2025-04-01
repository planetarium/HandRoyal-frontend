#!/bin/bash

# Docker image build script for testing on localhost

set -e

GIT_SHA=$(git rev-parse HEAD)
IMAGE_NAME="planetariumhq/hand-royal-frontend"
cp .env.production .env.production.backup
restore_env() {
    mv .env.production.backup .env.production
}

trap restore_env EXIT
cp .env.docker .env.production
npm run build
docker build -t "$IMAGE_NAME:$GIT_SHA" .
docker tag "$IMAGE_NAME:$GIT_SHA" "$IMAGE_NAME:latest"

echo "Docker image built and tagged as:"
echo "  $IMAGE_NAME:$GIT_SHA"
echo "  $IMAGE_NAME:latest"

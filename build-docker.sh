#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the current Git HEAD SHA
GIT_SHA=$(git rev-parse HEAD)

# Define the Docker image name
IMAGE_NAME="planetariumhq/hand-royal-frontend"

# Build the project
npm run build

# Build the Docker image with the Git SHA as the tag
docker build -t "$IMAGE_NAME:$GIT_SHA" .

# Optionally, tag the image as "latest"
docker tag "$IMAGE_NAME:$GIT_SHA" "$IMAGE_NAME:latest"

# Print success message
echo "Docker image built and tagged as:"
echo "  $IMAGE_NAME:$GIT_SHA"
echo "  $IMAGE_NAME:latest"

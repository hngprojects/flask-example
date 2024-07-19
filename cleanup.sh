#!/bin/bash

PR_NUMBER=$1

echo "Cleaning up deployment for PR #$PR_NUMBER"

# Stop and remove Docker container
docker stop flask-app-$PR_NUMBER
docker rm flask-app-$PR_NUMBER
docker rmi flask-app:$PR_NUMBER

echo "Cleaned up deployment for PR #$PR_NUMBER"

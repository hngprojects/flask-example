#!/bin/bash

BRANCH=$1
PR_NUMBER=$2

echo "Deploying branch $BRANCH for PR #$PR_NUMBER"

# Build Docker image
docker build -t flask-app:$PR_NUMBER .

# Run Docker container on a specific external port
docker run -d --name flask-app-$PR_NUMBER -p 8080:5000 flask-app:$PR_NUMBER

echo "Flask app for PR #$PR_NUMBER deployed at http://3.85.175.73:8080"

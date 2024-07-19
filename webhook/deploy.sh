#!/bin/bash
branch_name=$1
repo_url=$2
container_name="flask-example-$branch_name"

git clone -b $branch_name $repo_url
cd flask-example
docker build -t $container_name .
docker run -d --name $container_name -p 5000:5000 $container_name


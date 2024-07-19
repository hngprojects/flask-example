#!/bin/bash
branch_name=$1
container_name="flask-example-$branch_name"

docker stop $container_name
docker rm $container_name
docker rmi $container_name


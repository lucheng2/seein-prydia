#!/bin/sh
git pull
docker-compose -f docker-compose-prod.yml build 
docker-compose -f docker-compose-prod.yml up -d 
docker system prune -a -f
docker load -i /root/env/nodejs/nodejs.tar
#!/bin/bash
docker compose down -v  # Stop and remove containers and volumes
docker compose up --build  # Rebuild and start the containers

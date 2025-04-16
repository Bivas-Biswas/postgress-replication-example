# postgress-replication-example

### Basic details

1. api request go to the pg-pool container

2. pg-pool distrubuted the load
  a. if write it goes to the primary
  b. if read based on the load it balance

3. streaming asynchronus replica used.
4. to add initalize database use init.sql


### How to run database server

```
docker compose down -v  # Stop and remove containers and volumes
docker compose up --build  # Rebuild and start the containers
```

it will create 4 containers
- a. pgpool
- b. pg_primary
- c. pg_replica_1
- d. pg_replica_2

### How to run the app.js

```
node app.js
```


### Todo:

have to enable the log in pgpool for each request, like for each request which postress used that kind.

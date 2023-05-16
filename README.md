# diagrams

diagrams is a service to manage BPMN diagrams.

![language](https://img.shields.io/github/languages/top/flow-build/diagrams)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=flow-build_diagrams&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=flow-build_diagrams) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

## Environment variables

Add a .env file with the following variables:

- JWT_KEY (default = 1234)
- KNEX_ENV (suggested value = docker)
- NODE_ENV (suggested value = docker)
- POSTGRES_USER (default = postgres)
- POSTGRES_PASSWORD (default = postgres)
- POSTGRES_DB (default = diagrams)
- POSTGRES_HOST (default = localhost)
- POSTGRES_PORT (default = 5432)
- DIAGRAMS_LOG_LEVEL (default = info)
- CORE_LOG_LEVEL (default = info)

## Run the project on docker

To run app on docker, just run the command:

```
docker-compose up
```

Make sure ports 5000 and 5432 are free to use on your localhost.

## Tests

You can run tests by running: 

```
npm run test
```

Note: some tests will fail if you don't have the database running.

## Swagger

When the app is running along with the database you can access the following 
swagger to check out the API routes and test them yourself:

http://localhost:5000/swagger

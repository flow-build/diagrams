# Diagrams Manager

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

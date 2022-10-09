# Express Jobly Backend

[Live API Demo](https://jobly-zhl.herokuapp.com)

Project: Backend Express application with a RESTful API for users to view companies and apply to jobs, as well as admins to manage listings for companies and jobs.

Frontend react application that utilizes this backend server:\
[React Jobly Live Demo](http://jobly-zhl.surge.sh)\
[React Jobly GitHub](https://github.com/zhenhua01/react-jobly)

## Available Scripts

Requires PostgreSQL database setup.
To create/seed the app database, and create a test database with psql:

- `psql -f jobly.sql`

### In the project directory, you can:

Install required dependencies from package.json:

- `npm install`

Run the app in the development mode on port 3001, [http://localhost:3001](http://localhost:3001):

- `npm start`

Run all tests:

- `npm test`

Run all tests and display coverage report:

- `jest -i --coverage`

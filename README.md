# NEO Tracker

[![CircleCI](https://circleci.com/gh/neotracker/neotracker.svg?style=shield)](https://circleci.com/gh/neotracker/neotracker) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)

NEO Tracker is a NEO blockchain explorer and wallet.

## Contributing

Welcome to the NEO Tracker community! We're always looking for more contributors and are happy to have you. Documentation on how to contribute can be found [here](.github/CONTRIBUTING.md).

## Environment Setup

The following instructions for how to setup your development environment for NEO Tracker are known to work on Mac, but should work on any Unix-like system.

### Requirements

- [Node 10.16.0](https://github.com/creationix/nvm)
- [NEO•ONE](https://neo-one.io/)

### Start a NEO•ONE private network

NEO Tracker is best developed against a private network, which we can setup easily with NEO•ONE.

- `yarn install` (install dependencies, including `@neo-one/cli`)
- `yarn neo-one start network` (starts a private network)

By default, NEO•ONE will create a private network with the RPC url `http://localhost:9040/rpc`, but this can be configured in a [NEO•ONE configuration file](https://neo-one.io/docs/config-options). Note for this purpose, only the `network` option is relevant.

### Start NEO Tracker

- `yarn install` (install dependencies)
- `yarn develop` (starts a watched instance of NEO Tracker for development)

By default, `yarn develop` sets up a [SQLite](https://www.sqlite.org/index.html) database in the neotracker root directory. If you'd prefer to work with [Postgres 10.3](https://www.postgresql.org/download/), this and other options can be configured in a `.neotrackerrc` file. See below for the full list of configurable options.

### Setup Postgres

If you'd like to use [Postgres 10.3](https://www.postgresql.org/download/), here are some instructions for getting started.

We will use the `$PGDATA` environment variable in the following examples. You may set this variable with `export PGDATA=<directory to store database>` if it's not set. For example, on Mac you can use the default data directory with `export PGDATA=/usr/local/var/postgres`

- `initdb $PGDATA` (initialize the data directory)
- `pg_ctl -D $PGDATA start` (start postgres)
- `createdb neotracker_priv` (create the database for NEO Tracker)

To connect this database with neotracker, in the `.neotrackerrc` file, set `dbClient` to `pg` and `dbPort` to the port the postgres server was started on (defaults to 5432).

### General Tips

- To reset the local database, simply run `yarn develop --resetDB`.

### Options

The full list of configurable options in the `.neotrackerrc` file. These can be added to the file or passed in as cli arguments.

```js
{
  "type": "all", Components to run: "all" | "scrape" | "web"
  "port": 1340, // Port the website will be on
  "network": "priv", // NEO network to run on
  "ci": false, // Running as part of continuous integration
  "prod": false, // Compile for production
  "nodeRpcUrl": "http://localhost:9040/rpc", // NEO•ONE Node RPC URL
  "dbClient": "sqlite3", // Database Client - "sqlite3" or "pg"
  "dbFileName": "db.sqlite", // Database file - only for SQLite
  "dbHost": "localhost", // Database host - only for Postgres
  "dbPort": 5432, // Database port - only for Postgres
  "dbUser": undefined, // Database username - only for Postgres
  "dbPassword": undefined, // Database password - only for Postgres
  "database": "neotracker_prv", // Database name
  "resetDB": false // Resets database
}
```

## License

NEO Tracker is [MIT licensed](./LICENSE).

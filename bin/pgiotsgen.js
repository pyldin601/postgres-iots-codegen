#!/usr/bin/env node
const { docopt } = require('docopt');
const generate = require('../lib/generate');

const POSTGRESQL_DEFAULT_PORT = 5432;

const doc = `
Generates io-ts contracts from postgresql database schema.

Usage:
  pgiotsgen --host=<host> [--port=<port>] --username=<username> --password=<password> --database=<database> --outdir=<outdir> [--capital] [--nosuffix] [--index] [--ignore=<tables>]
  pgiotsgen --help

Options:
  --help                      Show this screen.
  -h --host=<host>            Specifies the host name of the machine on which the server is running. 
  -p --port=<port>            Specifies the TCP port on which the server is listening for connections.
  -u --username=<username>    User name to connect as.
  -w --password=<password>    Password used to connect.
  -d --database=<database>    Database name to connect to.
  -o --outdir=<outdir>        Directory to generate contracts to.
  -i --index                  Also generate root index.ts file for generated contracts.
  -c --capital                Name contract files with a capital letter.
  -s --nosuffix               Don't append contract file names with "Contract" suffix.
  -t --ignore=<tables>        Comma separated list of tables that should be ignored.
`;

const {
  '--host': hostname,
  '--port': port = POSTGRESQL_DEFAULT_PORT,
  '--username': username,
  '--password': password,
  '--database': database,
  '--outdir': outDir,
  '--index': createIndexFile,
  '--capital': capitalLetter,
  '--nosuffix': noSuffix,
  '--ignore': rawListOfIgnoredTables,
} = docopt(doc);

const listOfIgnoredTables = rawListOfIgnoredTables ? rawListOfIgnoredTables.split(',') : [];

generate(
  hostname,
  port,
  username,
  password,
  database,
  outDir,
  createIndexFile,
  capitalLetter,
  noSuffix,
  listOfIgnoredTables,
).then(
  () => {
    process.exit(0);
  },
  err => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  },
);

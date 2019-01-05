# postgres-iots-codegen
Command line utility that generates io-ts contracts from postgresql database schema.

## How to use
Type in your console `npx pgiotsgen --help` to get help:
```shell
Generates io-ts contracts from postgresql database schema.

Usage:
  pgiotsgen --host=<host> [--port=<port>] --username=<username> --password=<password> --database=<database> --outdir=<outdir> [--index]
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
  ```

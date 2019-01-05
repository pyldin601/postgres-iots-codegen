const knex = require('knex');

module.exports = function createKnex(host, port, user, password, database) {
  return knex({
    client: 'postgresql',
    connection: { host, port, user, password, database },
  });
};

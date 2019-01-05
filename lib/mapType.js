module.exports = function mapType(columnType) {
  switch (columnType) {
    case 'boolean':
      return 't.boolean';

    case 'serial':
    case 'bigserial':
    case 'smallserial':
    case 'integer':
    case 'bigint':
    case 'smallint':
      return 't.number';

    case 'numeric':
      return 't.string';

    case 'json':
    case 'jsonb':
      return 't.object';

    case 'ARRAY':
      return 't.array(t.any)';

    case 'character':
    case 'character varying':
    case 'text':
      return 't.string';

    case 'timestamp with time zone':
    case 'timestamp':
      return 't.string';

    default:
      return 't.any';
  }
};

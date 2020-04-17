const { keys, groupBy, upperFirst, camelCase } = require('lodash');
const { Project, VariableDeclarationKind, IndentationText } = require('ts-morph');
const shell = require('shelljs');
const createKnexClient = require('./knex');
const mapType = require('./mapType');

const classCase = str => upperFirst(camelCase(str));

module.exports = async function generate(
  host,
  port,
  user,
  password,
  database,
  outDir,
  createIndexFile,
  capitalLetter,
  noSuffix,
  listOfIgnoredTables,
  createEnum,
) {
  const knexClient = createKnexClient(host, port, user, password, database);
  const rawSchemaColumns = knexClient.raw('INFORMATION_SCHEMA.COLUMNS');
  const tables = await knexClient(rawSchemaColumns)
    .select('table_name', 'column_name', 'data_type', 'is_nullable')
    .where('table_catalog', database)
    .where('table_schema', 'public')
    .whereNotIn('table_name', listOfIgnoredTables);

  shell.mkdir('-p', outDir);

  const groupedTables = groupBy(tables, table => table.table_name);
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
    },
  });

  const tableNames = keys(groupedTables);

  const generatedContractFileNames = tableNames.map(tableName => {
    const columns = groupedTables[tableName];

    const contractVarName = `${classCase(tableName)}EntityContract`;
    const contractTypeName = `I${classCase(tableName)}Entity`;
    const contractFileName = getContractFileName(tableName, { capitalLetter, noSuffix });

    const contractFile = project.createSourceFile(
      `${outDir}/${contractFileName}.ts`,
      {},
      { overwrite: true },
    );

    contractFile.addImportDeclaration({ namespaceImport: 't', moduleSpecifier: 'io-ts' });

    const initializer = `t.interface({
        ${columns
          .map(({ column_name, data_type, is_nullable }) => {
            let propertyType = mapType(data_type);

            if (is_nullable === 'YES') {
              propertyType = `t.union([t.null, ${propertyType}])`;
            }

            return `${column_name}: ${propertyType}, // ${data_type} nullable: ${is_nullable}`;
          })
          .join('\n')}
      })`;

    contractFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [{ name: contractVarName, initializer }],
    });

    contractFile.addTypeAlias({
      isExported: true,
      name: contractTypeName,
      type: `t.TypeOf<typeof ${contractVarName}>`,
    });

    const enumVarName = `${classCase(tableName)}Props`;
    const enumExpression = contractFile.addEnum({
      isExported: true,
      name: enumVarName,
    });

    columns.forEach(({ column_name }) => {
      enumExpression.addMember({
        name: classCase(column_name),
        value: column_name,
      });
    });

    return contractFileName;
  });

  if (createIndexFile) {
    const indexFile = project.createSourceFile(`${outDir}/index.ts`, {}, { overwrite: true });

    generatedContractFileNames.forEach(contractFileName => {
      indexFile.addExportDeclaration({
        moduleSpecifier: `./${contractFileName}`,
      });
    });

    if (createEnum) {
      const enumExpression = indexFile.addEnum({
        isExported: true,
        name: 'TableName',
      });

      tableNames.forEach(tableName => {
        enumExpression.addMember({
          name: classCase(tableName),
          value: tableName,
        });
      });
    }
  }

  await project.save();
};

function getContractFileName(tableName, { capitalLetter, noSuffix }) {
  const entityName = (capitalLetter ? classCase : camelCase)(tableName);
  const suffix = noSuffix ? '' : 'Contract';
  return `${entityName}Entity${suffix}`;
}

main(Deno.args);

function main(args: string[]) {
  if (args.length != 1) {
    console.log('Usage: generate_ast <output directory>');
    Deno.exit(64);
  }
  const outputDir = args[0];

  defineAst(outputDir, 'Expr', [
    'Binary   : Expr left, Token operator, Expr right',
    'Grouping : Expr expression',
    'Literal  : Object value',
    'Unary    : Token operator, Expr right',
  ]);
}

function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = outputDir + '/' + baseName.toLowerCase() + '.ts';
  let str = `import Token from './Token.ts';\n\n`;

  // Define the base class
  str += `export abstract class ${baseName} {\n`;
  str += `  abstract accept<R>(visitor: Visitor<R>): R;\n`;
  str += `}\n`;

  // Define the visitor interface.
  str += defineVisitor(baseName, types);

  // The AST classes.
  for (const type of types) {
    const className = type.split(':')[0].trim();
    const fields = type.split(':')[1].trim();
    str += defineType(baseName, className, fields);
  }

  Deno.writeTextFileSync(path, str);
}

function defineVisitor(baseName: string, types: string[]) {
  let str = `export interface Visitor<R> {\n`;

  for (const type of types) {
    const typeName = type.split(':')[0].trim();
    str +=
      `  visit${typeName}${baseName}(` +
      `${baseName.toLowerCase()}: ${typeName})` +
      ': R;\n';
  }

  str += '}\n';
  return str;
}

function defineType(baseName: string, className: string, fieldList: string) {
  let str = `export class ${className} extends ${baseName} {\n`;

  // Constructor.
  const fields = fieldList
    .split(', ')
    .map((field) => field.split(' ').reverse().join(':'));
  str += `  constructor(${fields.map((s) => 'readonly ' + s).join(', ')}) {\n`;
  str += '   super();\n';
  str += '  }\n';

  // Visitor accept method
  str += `  accept<R>(visitor: Visitor<R>): R {\n`;
  str += `    return visitor.visit${className}${baseName}(this);\n`;
  str += `  }\n`;

  str += '}\n';
  return str;
}

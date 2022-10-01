
const { parse } = require('acorn')
const MagicString = require('magic-string')
const analyse = require('./ast/analyse')
class Module {
  constructor({ code, path }) {
    this.magicCode = new MagicString(code, { filename: path })
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    })
    this.analyse()
  }
  analyse() {
    this.imports = {}
    this.exports = {}
    this.ast.body?.forEach(node => {
      if (node.type === 'ImportDeclaration') { // 导入模块
        const importPath = node.source.value // 导入模块的文件路径
        const specifiers = node.specifiers // 导入模块的变量
        for (const specifier of specifiers) {
          const name = specifier.imported.name // 导入时变量的名称
          const localName = specifier.local.name // 在本地的名称
          this.imports[localName] = { name, importPath }
        }
      } else if (node.type === 'ExportNamedDeclaration') { // 分量导出模块 export const a = '1'
        const declaration = node.declaration
        if (declaration.type === 'VariableDeclaration') {
          const name = declaration.declarations[0].id.name
          this.exports = {
            localName: name,
            node,
            expression: declaration
          }
        }

      }
    })
    analyse({ ast: this.ast, magicCode: this.magicCode })
  }
  expandAllStatements() {
    const allStatements = []
    this.ast.body?.forEach(statement => {
      const statements = this.expandStatement(statement)
      allStatements.push(...statements)
    })
    return allStatements
  }
  expandStatement(statement) {
    const statements = []
    statement._include = true
    statements.push(statement)
    return statements
  }
}

module.exports = Module
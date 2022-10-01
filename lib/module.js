
const { parse } = require('acorn')
const MagicString = require('magic-string')
const analyse = require('./ast/analyse')
class Module {
  constructor({ code, path, bundle }) {
    this.magicCode = new MagicString(code, { filename: path })
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    })
    this.path = path
    this.bundle = bundle
    this.imports = {}
    this.exports = {}
    this.analyse()
  }
  analyse() {
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

    this.definitions = {} // 存放所有全局变量
    this.ast.body.forEach(statement => {
      Object.keys(statement._defines).forEach(name => {
        this.definitions[name] = statement
      })
    })
  }
  expandAllStatements() {
    const allStatements = []

    this.ast.body?.forEach(statement => {
      if (statement.type != 'ImportDeclaration') {
        const statements = this.expandStatement(statement)
        allStatements.push(...statements)
      }
    })
    return allStatements
  }
  expandStatement(statement) {
    const statements = []
    const dependencies = Object.keys(statement._dependsOn)
    dependencies.forEach(name => {
      let definition = this.define(name)
      statements.push(...definition)
    })
    statement._include = true
    statements.push(statement)
    return statements
  }
  define(name) {
    if (this.imports.hasOwnProperty(name)) {
      const importData = this.imports[name]
      const module = this.bundle.fetchModule(importData.importPath, this.path)
      const exportData = module.exports[importData.name]
      return module.define(exportData.name)
    } else {
      const statement = this.definitions[name]
      if (statement && !statement._included) {
        return this.expandStatement(statement)
      }
      return []
    }
  }
}

module.exports = Module
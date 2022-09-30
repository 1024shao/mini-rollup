
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
    analyse({ ast: this.ast, magicCode: this.magicCode })
  }
  expandAllStatements() {
    const allStatements = []
    this.ast.body.forEach(statement => {
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
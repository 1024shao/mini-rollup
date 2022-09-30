
const fs = require('fs')
const { default: MagicString } = require('magic-string')
const Module = require('./module')

class Bundle {
  constructor(options) {
    this.entryPath = options.entry.replace(/.js$/, '') + '.js'
    this.module = {}
  }
  build(outputFileName) {
    const entryModule = this.fetchModule()
    const statements = entryModule.expandAllStatements()
    const { code } = this.generate(statements)
    fs.writeFileSync(outputFileName, code, 'utf-8')
  }
  // 创建入口 module
  fetchModule() {
    if (this.entryPath) {
      try {
        const code = fs.readFileSync(this.entryPath, 'utf-8')
        console.log(code)
        const module = new Module({
          code,
          path: this.entryPath,
          bundle: this
        })
        return module
      } catch (error) {
        throw error
      }
    }
  }
  // 生成目标代码
  generate(statements) {
    const bundle = new MagicString.Bundle();
    statements.forEach(statement => {
      bundle.addSource({
        content: statement._source,
        separator: '\n'
      })
    })
    return {
      code: bundle.toString()
    }
  }
}

module.exports = Bundle
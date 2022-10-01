
const fs = require('fs')
const path = require('path')
const { default: MagicString } = require('magic-string')
const Module = require('./module')

class Bundle {
  constructor(options = {}) {
    this.entryPath = options.entry.replace(/.js$/, '') + '.js'
    this.module = {}
  }
  build(outputFileName) {
    const entryModule = this.fetchModule(this.entryPath)
    const statements = entryModule.expandAllStatements()
    const { code } = this.generate(statements)
    fs.writeFileSync(outputFileName, code, 'utf-8')
  }
  // 创建入口 module
  fetchModule(importee, importer) {
    let route;
    if (!importer) {
      route = importee
    } else {
      if (path.isAbsolute(importee)) {
        route = importee
      } else if (importee[0] === '.') {
        route = path.resolve(path.dirname(importer), importee.replace(/.js$/, '') + '.js')
      }
    }
    if (route) {
      try {
        const code = fs.readFileSync(route, 'utf-8')
        const module = new Module({
          code,
          path: route,
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
    statements?.forEach(statement => {
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
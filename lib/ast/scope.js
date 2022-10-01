// 模拟作用域链
class Scope {
  constructor(options = {}) {
    this.name = options.name
    this.params = options.params // 改作用域链声明的变量
    this.parent = options.parent
  }
  add(name) {
    this.params.push(name)
  }
  findDefineScope(name) {
    if (this.params?.include(name)) {
      return this
    }
    if (this.parent) {
      return this.parent.findDefineScope(name)
    }
    return null
  }
}
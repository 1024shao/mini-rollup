const Scope = require('./scope')
const walk = require('./walk')
let index = 0
function analyse({ ast, magicCode }) {
  // 给 AST 树上的每一条语句加上对于的源代码
  let scope = new Scope(); // 全局作用域

  function addToScope(statement) {
    const name = statement.id.name
    scope.add(name)
    if (!scope.parent) {
      statement._defines[name] = true
    }
  }

  ast.body?.forEach(statement => {
    // 初始化属性
    Object.defineProperties(statement, {
      _defines: { value: {} }, // 模块内部定义的变量
      _dependsOn: { value: {} }, // 外部依赖的模块
      _included: { value: false, writable: true },// 是否已经被打包了，避免重复打包
      _source: { value: magicCode.snip(statement.start, statement.end) } // 节点对于的源代码
    })
    // dfs 遍历每一个 statement 确定内部依赖
    walk(statement, {
      enter(node) {
        // console.log(" ".repeat(index) + node.type)
        index += 2
        let newScope;
        switch (node.type) {
          case 'FunctionDeclaration':
            const params = node.params.map(x => x.name) // 函数的入参
            addToScope(node)
            newScope = new Scope({
              parent: scope,
              params
            })
            break;
          case "VariableDeclarator":
            node.declarations?.forEach(addToScope)
            break;
        }
        if (newScope) {
          Object.defineProperty(node, "_scope", { value: newScope })
          scope = newScope
          console.log('新的作用域', scope)
        }
      },
      leave(node) {
        // console.log(" ".repeat(index) + node.type)
        index -= 2
        if (node._scope) {
          scope = scope.parent
        }
      }
    })
  })
  console.log('模块遍历结果:', scope)
  // 寻找外部依赖
  ast.body?.forEach(statement => {
    walk(statement, {
      enter(node) {
        if (node._scope) {
          scope = node._scope
        }
        if (node.type === 'Identifier') {
          const definingScope = scope.findDefineScope(node.name)
          // 作用域链未找到变量声明
          if (!definingScope) {
            statement._dependsOn[node.name] = true
          }
        }
      },
      leave(node) {
        if (node._scope) {
          scope = scope.parent
        }
      }
    })
  })
}



module.exports = analyse
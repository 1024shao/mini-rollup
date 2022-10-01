/**
 * 用于遍历整个抽象语法树
 * @param {*} ast : 需要遍历的语法树
 * @param {*} param : 配置对象
*/
function walk(ast, { enter, leave }) {
  dfsVisit(ast, null, enter, leave)
}

// 深度优先搜索遍历所有 AST 所有节点

function dfsVisit(node, parent, enter, leave) {
  if (enter) {
    enter(node, parent, enter, leave)
  }

  const childKeys = Object.keys(node).filter(key => typeof node[key] === 'object')
  childKeys?.forEach(key => {
    if (Array.isArray(node[key])) {
      for (const child of node[key]) {
        dfsVisit(child, node, enter, leave)
      }
    } else if (node[key] && node[key].type) {
      dfsVisit(node[key], node, enter, leave)
    }
  })

  if (leave) {
    leave(node, parent, enter, leave)
  }
}


module.exports = walk
function analyse({ ast, magicCode }) {
  // 给 AST 树上的每一条语句加上对于的源代码
  ast.body.forEach(statement => {
    Object.defineProperties(statement, {
      _source: { value: magicCode.snip(statement.start, statement.end) }
    })
  })
}



module.exports = analyse
const acorn = require('acorn')
const MagicString = require('magic-string')
// console.log(acorn.parse("1 + 1", { ecmaVersion: 2020 }));
const AstTree = acorn.parse(`
  import $ from 'jquery'
  let a = 1;
  let b = 2;
`, { ecmaVersion: 2020, sourceType: 'module' });

const ms = new MagicString(`
import $ from 'jquery'
let a = 1;
let b = 2;
`)

console.log(ms.snip(0, 10).clone().toString())


// console.log(AstTree)

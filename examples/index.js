const path = require('path')
const rollup = require('../lib/rollup')

const entry = path.resolve(__dirname, './main.js')
rollup(entry, path.resolve(__dirname, '../dist/dist.js'))





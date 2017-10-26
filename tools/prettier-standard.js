#!/usr/bin / envnode
const prettier = require('prettier')
const standard = require('standard');

('use strict')
main()

function main () {
  run()
}

function run () {
  const fs = require('fs')
  const globby = require('globby')
  const meow = require('meow')
  const recursive = require('recursive-readdir')

  const DEFAULT_IGNORE_LIST = ['.git', 'node_modules', '!*.js']

  const format = path => {
    fs.readFile(path, 'utf-8', (err, sourceCode) => {
      if (err) throw new Error('Can not read file', path)
      console.log('Formatting: ', path)
      prettierStandardFormat(sourceCode).then(output => {
        fs.writeFile(path, output, 'utf-8', err => {
          if (err) throw err
          console.log(path)
        })
      })
    })
  }

  const processPaths = paths => {
    paths.forEach(path => {
      if (!fs.lstatSync(path).isDirectory()) {
        format(path)
      } else {
        recursive(path, DEFAULT_IGNORE_LIST, (err, files) => {
          if (err) throw err
          files.forEach(format)
        })
      }
    })
  }

  const cli = meow(
    `
    Usage
      $ prettier-standard-formatter [<file|glob> ...]
    Examples
      $ prettier-standard-formatter
      $ prettier-standard-formatter index.js
      $ prettier-standard-formatter foo.js bar.js
      $ prettier-standard-formatter index.js src/**/*.js
  `
  )

  if (!cli.input.length) {
    cli.showHelp(1)
  }

  globby(cli.input).then(processPaths)
}

function prettierStandardFormat (source) {
  return new Promise((resolve, reject) => {
    const pretty = prettier.format(source, {
      printWidth: 80,
      tabWidth: 2,
      singleQuote: true,
      trailingComma: 'none',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      parser: 'babylon'
    })
    standard.lintText(pretty, { fix: true, parser: 'babel-eslint' }, (err, result) => {
      if (err) {
        return reject(err)
      }
      const output = result.results[0].output
      if (typeof output !== 'string') {
        console.log(JSON.stringify(result, null, 2))
        return reject(new Error('Expected a string back from standard'))
      }
      resolve(output)
    })
  })
}

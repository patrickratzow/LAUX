require("any-promise/register/bluebird");

import _ from "underscore";
import chalk from "chalk";
import walk from "walk";
import path from "path";
import commander from "commander";
import chokidar from "chokidar";
import extend from "extend";
import bluebird from "bluebird";

var mkdirp = require("mkdirp-then");

import jetpack from "fs-jetpack";

import luamin from "luamin";
import luabeauty from "./luabeauty";
import luaobf from "./luaobf";

import parser from "./parser";
import highlighter from "./highlighter";
import compiler from "./compiler";
import CodeGenerator from "./codegenerator";

var defaultOptions = {
  debug: false,
  ast: false,
  minify: false,
  obfuscate: false,
  indent: 4
};

var options, headerData;

class CompiledFile {
  constructor(code, ast, compiledAST) {
    this.code = code;
    this.ast = ast;
    this.compiledAST = compiledAST;
  }
}

function prefixHeader(code, text) {
  var str = "";

  str += "--[[\n";
  str += text;
  str += "\n]]\n\n";

  str += code;
  return str;
}

function compileFile(root, file, out) {
  var compiledPath = path.join(out, file);
  var compiledPathNoExt = compiledPath.slice(0, -path.extname(compiledPath).length);

  var elapsed = 0;

  var compilePromise = jetpack.readAsync(path.join(root, file))
    .then((data) => {
      var newData = data.replace(/\t/g, "  ");
      try {
        var timeStart = process.hrtime();
        var compiled = compileCode(newData);

        elapsed = process.hrtime(timeStart)[1] / 100000;

        return compiled;
      } catch (e) {
        if (e instanceof SyntaxError) {
          var lines = newData.split(/\r?\n/);

          var lineStart = Math.max(0, e.line - 3);
          var lineEnd = Math.min(lines.length, e.line + 3);

          console.log(chalk.magenta("LAUX") + " " +
            chalk.red("ERROR") + " " + `SyntaxError: ${file}: ${e.message}`);

          for (var i = lineStart; i < lineEnd; i++) {
            var line = lines[i];

            var c1 = i + 1 == e.line ? ">" : " ";
            var lineFillStr = new Array((lineEnd.toString().length - (i + 1).toString().length) + 1).join(" ");
            var lineStr = lineFillStr + (i + 1).toString();
            var litLine = highlighter.highlight(line);
            console.log(chalk.red(c1) + chalk.gray(` ${lineStr} | `) + litLine);

            if (i + 1 == e.line) {
              var offset = new Array(e.column + 1).join(" ");
              console.log(" " + chalk.gray(new Array(lineStr.length + 2).join(" ") + ` | `) + chalk.red(offset + "^"));
            }
          }

          console.log(e.stack);
        }
        else {
          console.log(chalk.magenta("LAU") + " " +
            chalk.red("ERROR") + ` ${file}:`);

          console.log(chalk.magenta("LAU") + " " +
            chalk.red("ERROR") + ` ${e.stack}`);
        }
      }
    });

  bluebird.join(
    compilePromise,
    mkdirp(path.dirname(compiledPathNoExt + ".lua"))
  ).spread((compiled) => {
    if (!compiled) return;

    if (options.ast) {
      jetpack.writeAsync(compiledPathNoExt + ".ast.json", JSON.stringify(compiled.ast, null, 2));
      jetpack.writeAsync(compiledPathNoExt + ".ast_compiled.json", JSON.stringify(compiled.compiledAST, null, 2));
    }

    var code;
    /*
    if (options.obfuscate)
      code = luaobf.obfuscate(compiled.compiledAST);
    else if (options.minify)
      code = luamin.minify(compiled.compiledAST);
    else
      code = luabeauty.beautify(compiled.compiledAST, {
        indent: options.indent
      });
    */

    var result = new CodeGenerator(compiled.code, compiled.compiledAST)
      .generate();

    code = result.code;

    var writePromise;
    if (headerData) {
      writePromise = jetpack
        .writeAsync(compiledPathNoExt + ".lua", prefixHeader(code, headerData));
    }
    else {
      writePromise = jetpack.writeAsync(compiledPathNoExt + ".lua", code);
    }

    writePromise.then(() => {
      var roundedElapsed = Math.round(elapsed * 1000.0) / 1000.0;

      console.log(chalk.magenta("LAUX") + " " +
        chalk.magenta("BUILT") + " " + file + " " + chalk.green(roundedElapsed + "ms"));
    }).catch((e) => {
      console.log("err", e);
    });
  }).catch((e) => {
    console.log(e);
  });
}

function compileCode(code) {
  var ast = parser.parse(code, {
    comments: true,
    locations: true,
    ranges: true
  });

  var compiledAST = compiler.compile(
    JSON.parse(JSON.stringify(ast)),
    {
      debug: options.debug
    });

  return new CompiledFile(code, ast, compiledAST);
}

function compileFolder(root) {
  var outPath = path.join(root, options.out);

  var walker = walk.walk(root);
  walker.on("file", function (rootPath, fileStats, next) {
    var ext = path.extname(fileStats.name);
    if (ext == ".laux") {
      var p = path.join(rootPath, fileStats.name);
      var relative = path.relative(root, p);
      compileFile(root, relative, outPath);
    }

    next();
  });
}

function watchFolder(root, out) {
  var watcher = chokidar.watch(path.join(root, "**/*.laux"));

  watcher.on("add", filePath => {
    var relativePath = path.relative(root, filePath)
    console.log(chalk.magenta("LAUX") + " " + chalk.green("ADD") + " " + chalk.yellow(relativePath));
    compileFile(root, relativePath, out);
  });

  watcher.on("change", filePath => {
    var relativePath = path.relative(root, filePath)
    console.log(chalk.magenta("LAUX") + " " + chalk.cyan("CHANGE") + " " + chalk.yellow(relativePath));
    compileFile(root, relativePath, out);
  });

  watcher.on("unlink", filePath => {
    var relativePath = path.relative(root, filePath);
    var compiledPath = path.join(out, relativePath);
    var compiledPathNoExt = compiledPath.slice(0, -path.extname(compiledPath).length);

    console.log(chalk.magenta("LAUX") + " " + chalk.red("REMOVE") + " " + chalk.yellow(relativePath));
    jetpack.removeAsync(compiledPathNoExt + ".lua");
  });

  watcher.on("error", (error) => {
  });
}

function unlinkOutput(root) {

}

var args = process.argv;

function getAbsolutePath(p) {
  if (p) {
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  }
  return process.cwd();
}

commander
  .version("0.0.1")
  .command("watch <dir> <out>")
  .description("watch specified directory for file changes and compile")
  .option("-d, --debug")
  .option("-a, --ast", "Generate AST json file along with compiled code.")
  .option("-m, --min", "Minify compiled code.")
  .option("-o, --obfuscate", "Obfuscate compiled code.")
  .option("--indent <size>", "The size of one indent.", parseInt)
  .option("--header", "Header template to place on the top of each compiled file.")
  .action((dir, out, _options) => {
    var root = getAbsolutePath(dir);
    var outDir = getAbsolutePath(out);

    options = extend(defaultOptions, {
      debug: _options.debug,
      ast: _options.ast,
      minify: _options.min,
      obfuscate: _options.obfuscate,
      header: _options.header,
      indent: _options.indent
    });

    if (!options.indent) {
      console.log(chalk.magenta("LAU") + " " +
        chalk.red("ERROR") + ` Invalid indent size: '${_options.indent}'`);

      return;
    }


    if (options.header) {
      jetpack.readAsync(path.join(dir, "/header.txt")).then((data) => {
        if (!data) {
          console.log(chalk.magenta("LAUX") + " " +
            chalk.red("ERROR") + ` Error reading header file: "${options.header}" not found.`);

          return;
        }

        headerData = data.replace(/(^[\r\n]+)|([\r\n]+$)/g, "");
        headerData = headerData.replace(/%date%/g, new Date().toUTCString());

        watchFolder(root, outDir);
      }).catch((e) => {
        console.log(chalk.magenta("LAU") + " " +
          chalk.red("ERROR") + " Error reading header file:" + e.stack);
      });
    } else {
      watchFolder(root, outDir);
    }
  });

commander.parse(process.argv);
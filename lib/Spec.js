var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');
var Q = require('q');
var contentTree = require('content-tree');
var Handlebars = require('handlebars');
var helpers = require('./helpers');
var InputTree = require('./InputTree');
var matterCompilerPath = path.resolve(__dirname, '../node_modules/matter_compiler/bin/matter_compiler');

function execPromise (command) {
  return Q.Promise(function (resolve, reject) {
    exec(command, function (err, stdout, stderr) {
      if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}

function Spec (options) {
  _.defaults(options, {
    inherit: null,
    features: null
  });

  this.directory = path.resolve(process.cwd(), options.directory);
  this.parentDirectory = options.inherit? path.resolve(this.directory, options.inherit): null;
  this.features = options.features;
  this._inputsPromise = null;
  this._parentPromise = null;
}

Spec.prototype.loadBlueprint = function (callback) {
  callback = callback || _.noop;

  var promise = this.loadAst()
    .get('ast')
    .then(function (ast) {
      ast._version = '2.0';
      var cmd = 'echo \'' + JSON.stringify(ast).replace(/\\n/g, '\\\\n') + '\' | '+matterCompilerPath+' --format json';
      return execPromise(cmd);
    });

  promise.done(function (markdown) {
    callback(null, markdown);
  }, function (err) {
    callback(err, null);
  });

  return promise;
};

Spec.prototype.loadAst = function (callback) {
  callback = callback || _.noop;

  var features = this.features;
  var finalPromise;

  finalPromise = Q
    .all([this.loadParent(), this.loadInputs()])
    .spread(function (parent, inputTree) {
      if (parent) {
        return parent
          .loadInputs()
          .then(function (parentInputTree) {
            var childBlueprint = inputTree
              .resolve()
              .getBlueprint(features);

            var parentBlueprint = parentInputTree
              .resolve(inputTree)
              .getBlueprint(features);

            return Q
              .all([
                helpers.blueprintToAst(childBlueprint),
                helpers.blueprintToAst(parentBlueprint)
              ])
              .spread(helpers.inheritAst);
          });
      } else {
        return helpers.blueprintToAst(inputTree.resolve().getBlueprint(features));
      }
    })
    .then(function (ast) {
      // Traverses ast and cleans up JSON objects that get messed up during Handlebars rendering
      function recurse (obj) {
        if (_.isString(obj)) {
          // Trying treating as a JSON object
          try {
            return JSON.stringify(JSON.parse(obj), null, 2);
          }
          // Otherwise assume this is markdown. Here, we want to fix any code blocks surrounded by ```
          catch (err) {
            var matches = obj.match(/`{3}[^`]+`{3}/g);

            _.each(matches, function (match) {
              match = match.slice(3, -3);

              try {
                obj = obj.replace(match, '\n' + JSON.stringify(JSON.parse(match), null, 2) + '\n');
              } catch (err) {}
            });

            return obj;
          }
        } else if (_.isArray(obj)) {
          return _.map(obj, recurse);
        } else if (_.isObject(obj)) {
          return _.mapValues(obj, recurse);
        } else {
          return obj;
        }
      }

      return recurse(ast);
    });

  finalPromise
    .done(function (ast) {
      callback(null, ast);
    }, function (err) {
      callback(err, null);
    });

  return finalPromise;
};

Spec.prototype.loadInputs = function (callback) {
  callback = callback || _.noop;

  var inputsPromise = this._inputsPromise = this._inputsPromise || InputTree.load(this.directory);
  var parentInputsPromise;
  var finalPromise;

  parentInputsPromise = this.loadParent().then(function (parent) {
    if (parent) {
      return parent.loadInputs();
    }
  });

  finalPromise = Q
    .all([inputsPromise, parentInputsPromise])
    .spread(function (inputTree, parentInputTree) {
      return parentInputTree? parentInputTree.merge(inputTree): inputTree;
    });

  finalPromise.done(function (parent) {
    callback(null, parent);
  }, function (err) {
    callback(err, null);
  });

  return finalPromise;
};

Spec.prototype.loadParent = function (callback) {
  callback = callback || _.noop;

  var promise = this._parentPromise;
  var parentDirectory = this.parentDirectory;

  if (!promise) {
    promise = this._parentPromise = Q.Promise(function (resolve, reject) {
      if (parentDirectory) {
        Spec.load(parentDirectory).done(resolve, reject);
      } else {
        resolve(null);
      }
    });
  }

  promise.done(function (parent) {
    callback(null, parent);
  }, function (err) {
    callback(err, null);
  });

  return promise;
};

Spec.load = function (directory, callback) {
  directory = path.resolve(process.cwd(), directory);
  callback = callback || _.noop;

  var config = require(path.resolve(directory, 'spec.json'));
  var promise;

  promise = Q.Promise(function (resolve) {
    var spec = new Spec({
      inherit: config.inherit,
      features: config.features,
      directory: directory
    });

    resolve(spec);
  });

  promise.done(function (spec) {
    callback(null, spec);
  }, function (err) {
    callback(err, null);
  });

  return promise;
};

module.exports = Spec;

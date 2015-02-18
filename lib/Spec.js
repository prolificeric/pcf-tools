var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var contentTree = require('content-tree');
var Handlebars = require('handlebars');
var helpers = require('./helpers');
var InputTree = require('./InputTree');
var matterCompilerPath = path.resolve(__dirname, '../node_modules/matter_compiler/bin/matter_compiler');

function Spec (options) {
  _.defaults(options, {
    inherit: null,
    features: null
  });

  this.directory = path.resolve(process.cwd(), options.directory);
  this.parentDirectory = options.inherit? path.resolve(this.directory, options.inherit): null;
  this.features = options.features;
  this.excludeEndpoints = options.excludeEndpoints || null;
  this._inputsPromise = null;
  this._parentPromise = null;
}

Spec.prototype.saveBlueprint = function (destination, callback) {
  callback = callback || _.noop;

  var promise = this.loadAst()
    .get('ast')
    .then(function (ast) {
      ast._version = '2.0';

      var tmpFile = 'ast_' + Math.random().toString().replace('.', '') + '.json.tmp';
      var str = JSON.stringify(ast);
      var cmd = matterCompilerPath + ' ' + tmpFile + ' --format json > ' + destination;

      return Q.Promise(function (resolve, reject) {
        fs.writeFile(tmpFile, JSON.stringify(ast), function (err) {
          if (err) {
            reject(err);
            return;
          }

          helpers.execPromise(cmd).done(function () {
            fs.unlink(tmpFile, function (err) {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            });
          }, reject);
        });
      });
    });

  promise.done(function () {
    callback(null);
  }, function (err) {
    callback(err);
  });

  return promise;
};

Spec.prototype.loadBlueprint = function (callback) {
  callback = callback || _.noop;

  var promise = this.loadAst()
  .get('ast')
  .then(function (ast) {
    ast._version = '2.0';

    var str = JSON.stringify(ast)
      .replace(/\\n/g, '\\\\n')
      .replace(/'/g, '&#39;');

    var cmd = 'echo \'' + str + '\' | '+matterCompilerPath+' --format json';

    return helpers.execPromise(cmd).then(function (result) {
      return result.replace(/&#39;/g, '\'');
    });
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
  var excludeEndpoints = this.excludeEndpoints;
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
      var resourceGroups;

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

      if (excludeEndpoints) {
        resourceGroups = ast.ast.resourceGroups;

        _.each(resourceGroups, function (group, i) {
          _.each(group.resources, function (resource) {
            var methods = excludeEndpoints[resource.uriTemplate] || excludeEndpoints[resource.name];

            if (methods) {
              if (methods === true) {
                resourceGroups.splice(i, 1);
              } else {
                _.each(resource.actions, function (action, i) {
                  if (methods.indexOf(action.method) > -1) {
                    resource.actions.splice(i, 1);
                  }
                });
              }
            }
          });
        });
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

  finalPromise.done(function (finalInputs) {
    callback(null, finalInputs);
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

Spec.prototype.loadEndpoints = function (callback) {
  callback = callback || _.noop;

  var promise;

  promise = this.loadAst()
    .then(function (ast) {
      var endpoints = {};

      _.each(ast.ast.resourceGroups, function (group) {
        _.each(group.resources, function (resource) {
          _.each(resource.actions, function (action) {
            endpoints[action.method + ' ' + resource.uriTemplate] = action;
          });
        });
      });

      return endpoints;
    });

  promise.done(function (endpoints) {
    callback(null, endpoints);
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
      directory: directory,
      excludeEndpoints: config.excludeEndpoints
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

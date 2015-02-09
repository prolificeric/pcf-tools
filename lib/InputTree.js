var path = require('path');
var _ = require('lodash');
var Q = require('q');
var contentTree = require('content-tree');
var Handlebars = require('handlebars');
var helpers = require('./helpers');

function InputTree (inputs) {
  this.inputs = inputs;
}

InputTree.parseContentType = function (content, mimeType) {
  var resolve = {
    'application/json': function () {
      return JSON.parse(content);
    }
  }[mimeType];

  if (resolve) {
    return resolve(content);
  } else {
    return content;
  }
};

InputTree.load = function (directory, callback) {
  callback = callback || _.noop;

  var promises = [];
  var finalPromise;

  function recurse (treeBranch, inputBranch) {
    _.each(treeBranch, function (file, name) {
      if (/^\.|node_modules/.test(name)) {
        return;
      }

      if (file.stat) {
        read(file, inputBranch);
      } else {
        recurse(file, inputBranch[name] = {});
      }
    });

    return inputBranch;
  }

  function read (file, inputBranch) {
    var nameParts = file.path.split('/').pop().split('.');
    var ext = nameParts.pop();
    var branchExtension = inputBranch;
    var promise;

    _.each(nameParts, function (part) {
      branchExtension = branchExtension[part] = branchExtension[part] || {};
    });

    if (ext === 'js') {
      branchExtension.js = require(file.path);
      return;
    }

    promise = helpers.readFilePromise(file.path)
      .then(function (content) {
        var data;

        try {
          data = InputTree.parseContentType(content, file.mimeType);
        } catch (err) {
          err.message += ' (file: '+path.relative(process.cwd(), file.path)+')';
          throw err;
        }

        return data;
      })
      .then(function (data) {
        branchExtension[ext] = data;
      });

    promises.push(promise);
  }

  finalPromise = Q(contentTree(directory).generate()).then(function (fileTree) {
    var inputs = {};

    recurse(fileTree, inputs);

    return Q.all(promises).then(function () {
      return new InputTree(inputs);
    });
  });

  finalPromise.done(function (inputs) {
    callback(null, inputs);
  }, function (err) {
    callback(err, null);
  });

  return finalPromise;
};

InputTree.prototype.merge = function (child) {
  var mergedInputs = _.merge({}, this.inputs, child.inputs);
  return new InputTree(mergedInputs);
};

InputTree.prototype.resolve = function (withTree) {
  withTree = withTree || this;
  var resolvedInputs = resolveInputs(this.inputs, withTree.inputs);
  return new InputTree(resolvedInputs);
};

InputTree.prototype.getBlueprint = function (features) {
  var markdown = '';

  _.each(features, function (featureName) {
    var parts = featureName.split('/');
    var branch = this.inputs;

    _.each(parts, function (part) {
      branch = branch[part] || {};
    });

    markdown += branch.md || '';
  }, this);

  return markdown;
};

function dieIfTabs (str) {
  if (typeof str === 'string' && /\t/.test(str)) {
    throw new Error('use spaces instead of tabs');
  }
}

// Renders the whole object tree with Handlebars
function resolveInputs (inputs, resolveWith) {
  // By default, inputs are resolved with themselves
  if (!resolveWith) {
    resolveWith = inputs;
  }

  var result;
  var hierarchy = []; // Keep track of current object hierarchy for debugging

  // Traverses objects until it hits strings, which get fed to Handlebars.
  // If it's not a markdown file we're parsing, we need to account for
  // templates embedded within JSON strings, which need to resolve
  // as objects.
  function recurse (inputs, resolveWith, skipMarkdown) {
    var result;

    if (_.isArray(inputs)) {
      result = [];
    } else if (_.isObject(inputs)) {
      result = {};
    }

    _.each(inputs, function (v, k) {
      try {
        hierarchy.push(k);
        // dieIfTabs(v);

        if (typeof v === 'object') {
          result[k] = recurse(v, resolveWith);
        } else if (_.isString(v) && /\{\{[^}]+\}\}/.test(v)) {
          var rendered = Handlebars.compile(v)(resolveWith);

          if (!skipMarkdown && k === 'md') {
            result[k] = rendered
              .replace(/\}{2}"/g, '}}')
              .replace(/"\{{2}/g, '{{')
              .replace(/\t/g, '  ') + "\n";
          } else {
            try {
              var data = JSON.parse(rendered);

              if (typeof data === 'object') {
                result[k] = data;
              } else {
                result[k] = rendered;
              }
            } catch (err) {
              result[k] = rendered;
            }
          }
        } else {
          result[k] = v;
        }

        hierarchy.pop();
      } catch (err) {
        // This error gets caught elsewhere, becomes recursive
        if (err.thrown === true) {
          throw err;
          return;
        }

        var hierarchyCopy = hierarchy.slice();
        var ext = hierarchyCopy.pop();

        // If errors emerge from within an object
        if (/md|json/.test(ext) === false) {
          var index = hierarchyCopy.indexOf('md');
          index = index > -1? index: hierarchyCopy.indexOf('json');
          ext = hierarchyCopy[index];
          hierarchyCopy = hierarchyCopy.slice(0, index);
        }

        var filename = hierarchyCopy.join('/') + '.' + ext;

        err.message = err.message.toString() + ' (file: ' + filename + ')';
        err.thrown = true;

        throw err;
      }
    });

    return result;
  }

  // Resolve in two passes so that any inputs that depend on unresolved
  // templated values get resolved on the second pass.
  result = recurse(inputs, resolveWith, true);
  result = recurse(result, _.merge({}, resolveWith, result));

  return result;
}

module.exports = InputTree;

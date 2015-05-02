var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');
var Q = require('q');
var protagonist = require('protagonist-experimental');
var Handlebars = require('handlebars');
var helpers = exports;

exports.execPromise = function (command) {
  return Q.Promise(function (resolve, reject) {
    exec(command, function (err, stdout, stderr) {
      if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
};

exports.readFilePromise = function (filename, callback) {
  callback = callback || _.noop;

  var promise = Q.nfcall(fs.readFile, filename, 'utf-8');

  promise.done(function (data) {
    callback(null, data);
  }, function (err) {
    callback(err, null);
  });

  return promise;
};

exports.removeAstResources = function (resourceGroups, removalMap) {
  var result = [];

  _.each(resourceGroups, function (group, i) {
    var resultGroup = _.extend({}, group);
    var resultResources = resultGroup.resources = [];

    result.push(resultGroup);

    _.each(group.resources, function (resource) {
      var removalMethods = removalMap[resource.uriTemplate] || removalMap[resource.name];
      var resultResource = _.extend({}, resource);

      if (!removalMethods) {
        resultGroup.resources.push(resource);
      } else if (removalMethods === true) {
        resourceGroups.splice(i, 1);
      } else {
        resultResource.actions = [];

        _.each(resource.actions, function (action, i) {
          if (removalMethods.indexOf(action.method) === -1) {
            resultResource.actions.push(action);
          }
        });

        //Omit the whole resource group if no actions leftover
        if (resultResource.actions.length > 0) {
          resultResources.push(resultResource);
        }
      }
    });
  });

  return result;
}

exports.inheritAst = function (child, parent) {
  if (_.isArray(child)) {
    if (_.isArray(parent)) {

      // If only child has items, return it
      if (child.length > 0 && parent.length === 0) {
        return child;
      }

      // If only parent has items, return it
      else if (child.length === 0 && parent.length > 0) {
        return parent;
      }

      // If both parent and child have items, mix the arrays together based
      // on the name property of each item.
      else if ((child[0] || parent[0] || {}).name) {
        var childIndex = _.indexBy(child, 'name');
        var parentIndex = _.indexBy(parent, 'name');
        return _.values(helpers.inheritAst(childIndex, parentIndex));
      }

      else {
        return child;
      }
    } else {
      return child;
    }
  } else if (_.isObject(child)) {
    if (_.isObject(parent)) {
      var result = _.mapValues(child, function (v, k) {
        return helpers.inheritAst(v, parent[k]);
      });
      return _.defaults(result, parent);
    } else {
      return child;
    }
  } else if (_.isString(child) && child.trim()) {
    return child;
  } else {
    return parent;
  }
};

exports.blueprintToAst = function (markdown, callback) {
  callback = callback || _.noop;

  var promise;

  promise = Q.Promise(function (resolve, reject) {
    protagonist.parse(markdown, function (err, ast) {
      if (err) {
        reject(err);
      } else {
        resolve(ast);
      }
    });
  });

  promise.done(function (ast) {
    callback(null, ast);
  }, function (err) {
    callback(err, null);
  });

  return promise;
};

exports.hbJsonHelper = function (dir) {
  return function (file) {
    try {
      var obj = this[dir][file].json;
    } catch (err) {
      throw new Error(dir + '/' + file + '.json does not exist');
    }

    return helpers.formatJson(obj, this, 12);
  };
};

exports.hbHeaderHelper = function (path) {
  var parts = [];
  var header;

  try {
    header = this.headers[path].json;
  } catch (err) {
    throw new Error('headers/' + path + '.json does not exist');
  }

  _.each(header, function (v, k) {
    parts.push(k + ': ' + v);
  });

  return parts.join("\n");
};

// Handlebars helpers
Handlebars.registerHelper('json', function (obj, leftMargin) {
  return helpers.formatJson(obj.json, this, leftMargin);
});

Handlebars.registerHelper('schema', function (file, canBeNull, descriptionOverride) {
  var schema;

  try {
    schema = this.schemas[file].json;
  } catch (err) {
    throw new Error('schemas/' + file + '.json does not exist');
  }

  if (canBeNull) {
    schema.type = ['object', 'null'];
  }

  if (typeof descriptionOverride === 'string') {
    schema.description = descriptionOverride;
  }

  return helpers.formatJson(schema, this, 12);
});

Handlebars.registerHelper('body', helpers.hbJsonHelper('examples'));
Handlebars.registerHelper('example', helpers.hbJsonHelper('examples'));
Handlebars.registerHelper('header', helpers.hbHeaderHelper);
Handlebars.registerHelper('headers', helpers.hbHeaderHelper); //Alias for header helper

Handlebars.registerHelper('include', function (path) {
  var val = this;

  try {
    _.each(path.split('/'), function (part) {
      val = val[part];
    });

    val = val.md;
  } catch (err) {
    throw new Error(path + '.md does not exist');
  }

  return new Handlebars.SafeString(val);
});

exports.whitelistBlacklist = function (data) {
  var includes = data.__include;
  var excludes = data.__exclude;
  var result;

  if (includes) {
    result = _.pick(data, includes);
    delete result.__include;
  } else if (excludes) {
    result = _.omit(data, excludes);
    delete result.__exclude;
  } else {
    result = data;
  }

  // Recurse into the object
  _.each(result, function (v, k) {
    if (_.isObject(v) && !_.isArray(v)) {
      result[k] = helpers.whitelistBlacklist(v);
    }
  });

  return result;
};

exports.applyExtension = function (obj, inputs) {
  var path = obj.__extends;
  var base = inputs;
  var result = obj;

  if (path) {
    _.each(path.split(/\/|\./), function (part) {
      base = base[part];
    });

    base = base.json || base;

    result = _.merge({}, base, obj);
  }

  delete result.__extends;

  return result;
};

exports.formatJson = function (obj, inputs, leftMargin) {
  obj = helpers.whitelistBlacklist(obj);
  obj = helpers.applyExtension(obj, inputs);
  leftMargin = leftMargin || 0;

  var spaces = _.times(leftMargin, _.constant(' ')).join('');
  var json = JSON.stringify(obj, null, 2).replace(/\n/g, "\n" + spaces).replace(/\\"/g, '"');

  return new Handlebars.SafeString(json);
};

var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');
var Q = require('q');
var protagonist = require('protagonist');
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

exports.inheritAst = function (child, parent) {
  if (_.isArray(child)) {
    if (_.isArray(parent)) {
      if ((child[0] || parent[0] || {}).name) {
        var childIndex = _.indexBy(child, 'name');
        var parentIndex = _.indexBy(parent, 'name');
        return _.values(helpers.inheritAst(childIndex, parentIndex));
      } else {
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
}

// Handlebars helpers
Handlebars.registerHelper('json', function (obj, leftMargin) {
  return formatJson.call(this, obj.json, leftMargin);
});

Handlebars.registerHelper('schema', function (path) {
  return formatJson.call(this, this.schemas[path].json, 12);
});

Handlebars.registerHelper('body', function (path) {
  return formatJson.call(this, this.examples[path].json, 12);
});

Handlebars.registerHelper('example', function (path) {
  return formatJson.call(this, this.examples[path].json, 12);
});

Handlebars.registerHelper('include', function (path) {
  var val = this;

  _.each(path.split('/'), function (part) {
    val = val[part];
  });

  return new Handlebars.SafeString(val.md);
});

Handlebars.registerHelper('headers', function (path) {
  var header = this.headers[path].json;
  var parts = [];

  _.each(header, function (v, k) {
    parts.push(k + ': ' + v);
  });

  return parts.join("\n");
});

function whitelistBlacklist (data) {
  var includes = data.__include;
  var excludes = data.__exclude;
  var result;

  delete data.__include;
  delete data.__exclude;

  if (includes) {
    result = _.pick(data, includes);
  } else if (excludes) {
    result = _.omit(data, excludes);
  } else {
    result = data;
  }

  // Recurse into the object
  _.each(result, function (v, k) {
    if (_.isObject(v) && !_.isArray(v)) {
      result[k] = whitelistBlacklist(v);
    }
  });

  return result;
}

function applyExtension (obj, inputs) {
  var path = obj.__extends;
  var base = inputs;

  delete obj.__extends;

  if (path) {
    _.each(path.split(/\/|\./), function (part) {
      base = base[part];
    });

    base = base.json || base;

    return _.merge({}, base, obj);
  }

  return obj;
}

function formatJson (obj, leftMargin) {
  obj = whitelistBlacklist(obj);
  obj = applyExtension(obj, this);
  leftMargin = leftMargin || 0;

  var spaces = _.times(leftMargin, _.constant(' ')).join('');
  var json = JSON.stringify(obj, null, 2).replace(/\n/g, "\n" + spaces).replace(/\\"/g, '"');

  return new Handlebars.SafeString(json);
}

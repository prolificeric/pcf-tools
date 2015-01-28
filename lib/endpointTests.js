var path = require('path');
var should = require('should');
var request = require('request');
var Q = require('q');
var gavel = require('gavel');
var _ = require('lodash');
var Spec = require('./Spec');
var specDir = process.env.SPEC_DIR;
var baseUrl = process.env.BASE_URL;

var gotSpec = Spec.load(specDir);

var gotInputs = gotSpec.then(function (spec) {
  return spec
    .loadInputs()
    .then(function (inputs) {
      return inputs.resolve().inputs;
    });
});

var gotEndpoints = gotSpec.then(function (spec) {
  return spec.loadEndpoints();
});

var paramTypes = {
  QS: 1,
  URI: 2
};

gotEndpoints.catch(function (err) {
  throw err;
});

function EndpointTestContext (options) {
  _.defaults(this, options, {
    uri: null,
    method: 'GET',
    params: {},
    headers: {},
    body: null,
    _paramMap: {}
  });
}

EndpointTestContext.prototype.exec = function (callback) {
  var options = {
    uri: this.uri,
    method: this.method,
    qs: {},
    headers: this.headers,
    body: this.body
  };

  // Resolve URI and query
  _.each(this.params, function (value, key) {
    var paramLocation = this._paramMap[key];

    if (paramLocation === paramTypes.URI) {
      options.uri = options.uri.replace(new RegExp('\\{'+key+'\\}', 'g'), value);
    } else if (paramLocation === paramTypes.QS) {
      this.qs[key] = value;
    }
  }, this);

  request(options, callback);
};

before(function (finalDone) {
  return Q
    .all([gotInputs, gotEndpoints])
    .spread(function (inputs, endpoints) {
      var hooks;

      try {
        hooks = inputs.test.pcf.js;
      } catch (err) {
        throw new Error('No test/pcf.js file found in specs');
      }

      function resolveHook (name) {
        var hook = hooks[name];
        var deferred = Q.defer();

        if (hook) {
          if (hook.length > 0) {
            hook(function () {
              deferred.resolve();
            });
          } else {
            hook();
            deferred.resolve();
          }
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      }

      return resolveHook('before').then(function () {
        _.each(endpoints, function (action, route) {
          var testHook = hooks[route];

          if (!testHook) {
            it.skip(route, _.noop);
            return;
          }

          var context = new EndpointTestContext();
          var bodySchema;
          var headers = {};
          var beforeEachDeferred = Q.defer();
          var afterEachDeferred = Q.defer();

          // Find a 200 response and extract body schema and headers from it
          _.every(action.examples, function (example) {
            _.every(example.responses, function (response) {
              if (response.name === "200") {
                bodySchema = response.schema;

                _.each(response.headers, function (header) {
                  headers[header.name] = header.value;
                });

                return false;
              }

              return true;
            });

            if (bodySchema) {
              return false;
            } else {
              return true;
            }
          });

          if (!bodySchema) {
            throw new Error('Body schema not defined');
          }

          // Add context properties
          context.method = action.method;
          context.uri = baseUrl + route.split(' ').pop().replace(/\{\?[^}]+\}/, ''); //Remove query params
          context.paramMap = {};
          context.headers = headers;

          // Maps params to their location
          _.each(route.match(/\{[^}]+\}/g), function (paramMatch) {
            if (paramMatch.indexOf('{?') === 0) {
              _.each(paramMatch.replace(/^\{\?|\}$/g, '').split(','), function (name) {
                context.paramMap[name] = paramTypes.QS;
              });
            } else {
              context.paramMap[paramMatch.replace(/^\{|\}$/g, '')] = paramTypes.URI;
            }
          });

          // Pass the endpoint context to the hook along with a callback, which
          // runs the schema test.
          it(route, function (testDone) {
            resolveHook('beforeEach').done(function () {
              testHook.call(context, function (err, response) {
                if (err) {
                  throw err;
                }

                gavel.validate(response, {
                  bodySchema: bodySchema
                }, 'response', function (err, result) {
                  if (err) {
                    throw err;
                  }

                  var issues = [];

                  _.each(result, function (obj, section) {
                    _.each(obj.results, function (result) {
                      var message = result.severity.toUpperCase() + ' (' + section + '): ' + result.message;
                      issues.push(message);
                    });
                  });

                  resolveHook('afterEach').done(function () {
                    if (issues.length) {
                      throw new Error('schema issues (' + issues.length + ') ' + "\n        - " + issues.join("\n        - "));
                    }

                    testDone();
                  }, function (err) {
                    throw err;
                  });
                });
              });
            });
          }, function (err) {
            throw err;
          });
        });
      })
      .then(function () {
        return resolveHook('after');
      });
    })
    .done(finalDone, function (err) {
      throw err;
    });
});

describe('endpoint test suite', function () {
  it('is loaded from the spec', _.noop);
});

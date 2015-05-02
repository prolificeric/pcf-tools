var should = require('should');
var helpers = require('../lib/helpers');

describe('helpers', function () {
  describe('#removeAstResources', function () {
    it('iterates through the keys of the removal map, removes endpoints corresponding to keys', function () {
      var result = helpers.removeAstResources([
        {
          resources: [
            {
              uriTemplate: '/products/search'
            },
            {
              uriTemplate: '/products/{id}',
              actions: [
                {
                  method: 'GET'
                },
                {
                  method: 'PUT'
                }
              ]
            },
            {
              uriTemplate: '/categories/{id}',
              actions: [
                {
                  method: 'GET'
                },
                {
                  method: 'PUT'
                }
              ]
            }
          ]
        }
      ], {
        '/products/search': true, //Removes whole resource
        '/products/{id}': ['GET'], //Removes one action
        '/categories/{id}': ['GET', 'PUT'] //Implicity removes whole resource
      });

      result[0].resources.length.should.equal(1);
      result[0].resources[0].uriTemplate.should.equal('/products/{id}');
      result[0].resources[0].actions.length.should.equal(1);
      result[0].resources[0].actions[0].method.should.equal('PUT');
    });
  });

  describe('#execPromise', function () {
    it('returns a promise representing the result of the child process', function () {
      return helpers.execPromise('echo foobar').tap(function (result) {
        result.should.equal('foobar\n');
      });
    });
  });

  describe('#formatJson', function () {
    describe('with __exclude', function () {
      it('removes keys named in array', function () {
        var testObject = {
          __exclude: ['x', 'y'],
          x: 1,
          y: 2,
          z: 3
        };

        helpers
          .formatJson(testObject, {}, 0)
          .string.should.equal(JSON.stringify({ z: testObject.z }, null, 2));
      });
    });

    describe('with __include', function () {
      it('only keeps keys named in array', function () {
        var testObject = {
          __include: ['z'],
          x: 1,
          y: 2,
          z: 3
        };

        helpers
          .formatJson(testObject, {}, 0)
          .string.should.equal(JSON.stringify({ z: testObject.z }, null, 2));
      });
    });
  });
});

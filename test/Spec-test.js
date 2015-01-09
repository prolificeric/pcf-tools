var path = require('path');
var Spec = require('../lib/Spec');
var childLoaded;
var parentLoaded;

childLoaded = Spec.load(path.resolve(__dirname, 'child'));
parentLoaded = Spec.load(path.resolve(__dirname, 'parent'));

describe('Spec class', function () {
  describe('without inheritance', function () {
    
  });
});

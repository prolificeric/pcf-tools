require('q').longStackSupport = true;

require('./lib/Spec')
  .load(process.argv[2] || './')
  .then(function (spec) {
    return spec.loadBlueprint();
  })
  .done(function (blueprint) {
    console.log(blueprint);
  }, function (err) {
    throw err;
  });

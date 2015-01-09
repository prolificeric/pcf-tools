var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var express = require('express');
var aglio = require('aglio');
var app = express();

function getDataPaths (req, resp, next) {
  var dir = path.resolve(__dirname, 'data', req.param('api'), req.param('version'));

  req.paths = {
    json: path.resolve(dir, 'api.json'),
    md: path.resolve(dir, 'api.md')
  };

  req.data = {
    // json: fs.readFileSync(req.paths.json, 'utf8'),
    md: fs.readFileSync(req.paths.md, 'utf8')
  };

  next();
}

app.get('/products/1', function (req, resp) {
  resp.send({
    id: 1,
    childSpecificValue: false
  });
});

app.get('/:api/:version/docs', getDataPaths, function (req, resp) {
  aglio.render(req.data.md, 'default', function (err, html) {
    resp.send(err || html);
  });
});

app.get('/:api/:version/mocks', getDataPaths, function (req, resp) {

});

app.get('/:api/:version/test', getDataPaths, function (req, resp) {
  var tmpFile = path.resolve(__dirname, 'temp_' + Math.random().toString().replace('.', '') + '.html');

  exec('node_modules/.bin/dredd ' + req.paths.md + ' ' + req.query.url + ' --reporter html -o ' + tmpFile, function (err, stdout, stderr) {
    fs.readFile(tmpFile, 'utf8', function (err, html) {
      resp.type('html').send(html || stderr);
      fs.unlinkSync(tmpFile);
    });
  });
});

app.listen(process.env.PORT || 9001);

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var express = require('express');
var aglio = require('aglio');
var mkdirp = require('mkdirp');
var bodyParser = require('body-parser');
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

function error (err, resp) {
  resp.send({
    success: false,
    error: {
      type: err.type,
      message: err.message
    }
  });
}

app.post('/:api/:version', bodyParser.text(), function (req, resp) {
  var relPath = req.param('api') + '/' + req.param('version');
  var dataPath = path.resolve(__dirname, '../data', relPath);

  console.log(req.body);

  mkdirp(dataPath, function (err) {
    if (err) {
      error(err, resp);
    } else {
      fs.writeFile(path.resolve(dataPath, 'api.md'), req.body, function (err) {
        if (err) {
          error(err, resp);
          return;
        }

        resp.send({
          success: true,
          links: {
            mocks: '/' + relPath + '/mocks',
            docs: '/' + relPath + '/docs',
            tests: '/' + relPath + '/tests'
          }
        });
      });
    }
  });
});

app.get('/:api/:version/docs', getDataPaths, function (req, resp) {
  aglio.render(req.data.md, 'default', function (err, html) {
    resp.send(err || html);
  });
});

app.get('/:api/:version/mocks', getDataPaths, function (req, resp) {

});

app.get('/:api/:version/tests', getDataPaths, function (req, resp) {
  var tmpFile = path.resolve(__dirname, 'temp_' + Math.random().toString().replace('.', '') + '.html');

  exec('node_modules/.bin/dredd ' + req.paths.md + ' ' + req.query.url + ' --reporter html -o ' + tmpFile, function (err, stdout, stderr) {
    fs.readFile(tmpFile, 'utf8', function (err, html) {
      resp.type('html').send(html || stderr);
      fs.unlinkSync(tmpFile);
    });
  });
});

module.exports = app;

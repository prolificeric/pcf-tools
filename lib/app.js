var url = require('url');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var express = require('express');
var aglio = require('aglio');
var bodyParser = require('body-parser');
var app = express();
var redis;

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  redis = require('redis').createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  redis = require('redis').createClient();
}

function getVersions (api) {
  //TODO: Return all versions of an API
}

function loadBlueprint (api, version, callback) {
  redis.hget('apis.' + api, version, callback);
}

function saveBlueprint (api, version, blueprint, callback) {
  redis.hset('apis.' + api, version, blueprint, callback);
}

app.post('/:api/:version', bodyParser.text(), function (req, resp) {
  saveBlueprint(req.param('api'), req.param('version'), req.body, function (err) {
    if (err) {
      resp.send({
        success: false,
        error: {
          type: err.type,
          message: err.message
        }
      })
    } else {
      resp.send({
        success: true
      });
    }
  });
});

app.get('/:api', function (req, resp) {
  //TODO: Create an API directory
});

app.get('/:api/:version', function (req, resp) {
  //TODO: Create a version directory
});

function attachBlueprint (req, resp, next) {
  loadBlueprint(req.param('api'), req.param('version'), function (err, blueprint) {
    req.blueprint = blueprint;

    if (err) {
      throw err;
    } else if (!blueprint) {
      resp.send('API and/or version does not exist.');
    } else {
      next();
    }
  });
}

app.get('/:api/:version/docs', attachBlueprint, function (req, resp) {
  aglio.render(req.blueprint, req.query.template || 'default', function (err, html) {
    resp.send(err || html);
  });
});

app.get('/:api/:version/tests', attachBlueprint, function (req, resp) {
  var rand = Math.random().toString().replace('.', '');
  var tmpHtmlFile = path.resolve(process.cwd(), 'temp_' + rand + '.md');
  var tmpMdFile = path.resolve(process.cwd(), 'temp_' + rand + '.html');

  fs.writeFile(tmpMdFile, req.blueprint, function (err) {
    if (err) {
      throw err;
      return;
    }

    exec('node_modules/.bin/dredd ' + tmpMdFile + ' ' + req.query.url + ' --reporter html -o ' + tmpHtmlFile, function (err, stdout, stderr) {
      fs.readFile(tmpHtmlFile, 'utf8', function (err, html) {
        resp.type('html').send(html || stderr.replace(/\n/g, '<br>'));

        [tmpHtmlFile, tmpMdFile].forEach(function (tmpFile) {
          fs.unlink(tmpFile, function (err) {});
        });
      });
    });
  });
});

module.exports = app;

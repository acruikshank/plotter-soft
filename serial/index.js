var express = require('express');
var app = express();
var Worker = require('tiny-worker')

app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/scripts/:script.svg', function (req, res) {
  res.set('Content-Type', 'image/svg+xml')
  process.chdir(__dirname + '/public')
  var worker = new Worker(req.params.script+'.js')
  var points = [], penDown = false;

  worker.onmessage = function(e) {
    var commands = e.data;
    commands.forEach(function(c,i) {
      switch (c.code) {
        case 1: points.push((penDown ? 'L' : 'M') + c.x.toFixed(3)
                  + ',' + c.y.toFixed(3));                break;
        case 2: penDown = c.x > 0;                        break;
        case 3: penDown = false;                          break;
      }
    })
    if (commands.length)
      worker.postMessage({count:1000})
    else
      res.render('svg', {path: points.join('')})
  }
  worker.postMessage({count:1000})
});

app.get('/scripts/:script', function (req, res) {
  res.render('preview', {script: req.params.script})
});

app.listen(9090, function () {
  console.log('listening on port 9090');
});

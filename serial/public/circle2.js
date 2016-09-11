importScripts('plotter.js', 'perlin.js')
var state = 0;
var index = 0;
var POINTS = 152;
var LOOPS = 50;
var RADIUS = 50;
var OUTER_RADIUS = RADIUS * 1.5;
var NOISE_FREQ1 = 1;
var NOISE_FREQ2 = 2;
var PEN_DEPTH = 4;

onmessage = function commandAt(e) {
  var count = e.data.count;
  var commands = []
  for (var i=0; i < count; i++) {
    var command = nextCommand();
    if (!command) break;
    commands.push( command );
  }
  postMessage(commands)
}

function nextCommand() {
  switch (state) {
    case 0: state++; return plotter.setup();
    case 1: state++; return draw();
    case 2: state++; return plotter.penDown(PEN_DEPTH);
    case 3: return draw();
    case 4: state++; return plotter.penUp();
    case 5: state++; return plotter.center();
    case 6: state++; return plotter.disable();
  }
}

function draw() {
  var point = pointAt(index++)
  if (index >= POINTS) state++;
  return plotter.moveTo(point.x, point.y);
}

function pointAt(index) {
  // var theta = 2*Math.PI*index/(POINTS-1)
  // var R = 40;
  // return { x:R*Math.cos(theta), y:R*Math.sin(theta) }
  var inc = 1 / (POINTS-1)
  var dTheta = LOOPS * frac;

  var frac = inc * index;
  var theta = 2*Math.PI * LOOPS * frac;
  var noiseFreq = NOISE_FREQ1 * Math.pow(1-frac,.5);
  var distort = Math.pow(frac,2) * noise.perlin3(Math.cos(theta), Math.sin(theta), 2*Math.pow(frac,2));
  var r = RADIUS + (OUTER_RADIUS-RADIUS)*(index/POINTS)  + 40 * distort;
  return {x: r*Math.cos(theta), y:r*Math.sin(theta) }
}

importScripts('plotter.js', 'perlin.js')
var state = 0;
var index = 0;
var POINTS = 40000;
var LOOPS = 1;
var RADIUS = 60;
var OUTER_RADIUS = 50;
var NOISE_FREQ1 = 1;
var NOISE_FREQ2 = 1;
var PEN_DEPTH = 3;

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

var offsets = [];
for (var i=0, l=6; i<l; i++)
  offsets.push(1 + 2*i/l)

function pointAt(index) {
  var inc = 1 / (POINTS-1)

  var frac = (1/12 + inc * index)%1;
  var theta = 2*Math.PI * LOOPS * frac;
  var nf = .1;
  var r = RADIUS * Math.pow(0.1 + .99*Math.cos(theta*13), 4) + 0*noise.perlin3(nf*Math.cos(1*theta), nf*Math.sin(1*theta), 5*Math.pow(frac-.5,2))
  var sr = 40*Math.pow(noise.perlin3(nf*Math.cos(1*theta), nf*Math.sin(1*theta), 50*Math.pow(frac-.5,2)), 2);
  // var sr = 100 * Math.pow(Math.abs(((frac*23)%1)-.5),4)
  var offsetFrac = Math.PI * offsets[index % offsets.length];
  var offset = [Math.cos(offsetFrac), Math.sin(offsetFrac)]
  var theta2 = theta + 400*Math.pow(noise.perlin3(nf*Math.cos(1*theta), nf*Math.sin(1*theta), 20*Math.pow(frac-.5,2)), 2)
  return {x: r*Math.cos(theta2) + sr*offset[0], y:r*Math.sin(theta2) + sr*offset[1] }
}

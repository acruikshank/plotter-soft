importScripts('plotter.js', 'perlin.js')
var LOOPS = 365;
var TWEENS = 400;
var POINTS = LOOPS * TWEENS;

var SHAPE1 = {radius:62, edges:3, phase:Math.PI*1.5};
var SHAPE2 = {radius:60, edges:6, phase:Math.PI*2.0};
var PEN_DEPTH = 3;

function lerp(a,b,x) { return a + x*(b-a) }

plotter.setupDrawWorker(POINTS, PEN_DEPTH, pointAt)

function pointInShape(shape, index) {
  var frac = (index / TWEENS) % 1
  var angle = 2*Math.PI / shape.edges
  var edge = (shape.edges * frac) | 0
  var interp = shape.edges * frac - edge
  var p1 = {x:shape.radius * Math.cos(edge*angle + shape.phase),
            y:shape.radius * Math.sin(edge*angle + shape.phase)}
  var p2 = {x:shape.radius * Math.cos((edge+1)*angle + shape.phase),
            y:shape.radius * Math.sin((edge+1)*angle + shape.phase)}
  return { x: lerp(p1.x, p2.x, interp), y: lerp(p1.y, p2.y, interp) }
}

function pointAt(index) {
  var point1 = pointInShape(SHAPE1, index)
  var point2 = pointInShape(SHAPE2, index)
  var frac = Math.PI*(index * 200 / TWEENS)
  // var interp = 1-Math.pow(.5*noise.perlin3(Math.cos(frac),Math.sin(frac), .5*index/POINTS) + .5,2)
  var interp = Math.pow(Math.cos(5.292034 * index / TWEENS), 47)

  var interpFrac = 1;
  interp = .5*((interp > 0 ? (1-interpFrac) : (interpFrac-1)) + interpFrac * interp) + .5


  var point = {x: lerp(point1.x,point2.x,interp), y: lerp(point1.y,point2.y,interp)}
  point.penDown = index > 0;
  return point;
}

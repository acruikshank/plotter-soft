importScripts('plotter.js','perlin.js', 'rng.js')
var SQUARES_PER_SIDE = 24;
var POINTS_PER_EDGE = 40;
var OUTER_SIDE = 120;
var POINTS_PER_SQUARE = 4*POINTS_PER_EDGE + 1
var POINTS = POINTS_PER_SQUARE * SQUARES_PER_SIDE * SQUARES_PER_SIDE;
var MARGIN = 2;
var DX = .0001;
var noiseScale = 2;
var noiseAmplitude = .13;
var seed = (2000*Math.random()) | 0
// seed = 1021
// seed = 303
// seed = 859
// seed = 1347
// seed = 746
// seed = 439
// seed = 1094
// seed = 1083; noiseScale = .02; noiseAmplitude = 2;
// seed = 160; noiseScale = .02; noiseAmplitude = 2;
// seed = 771; noiseScale = .07; noiseAmplitude = 1;
seed = 1353; noiseScale = .4; noiseAmplitude = .35;
// seed = 1051; noiseScale = 2; noiseAmplitude = .13;
console.log(seed)
var RNG = new RNG(seed);
var z = RNG.nextRange(0,200)

var PEN_DEPTH = 4;

function lerp(a,b,x) { return a + x*(b-a) }
function scale(v,c) { return {x:v.x*c, y:v.y*c} }
function grad(f,x,y,h) {
  return {x:(f(x+h,y) - f(x-h,y))/(2*h), y:(f(x,y+h) - f(x,y-h))/(2*h)}
}

plotter.setupDrawWorker(POINTS, PEN_DEPTH, pointAt)

function terain(x,y) {
  return Math.pow(Math.max(0.0,Math.min(1.0,
    noiseAmplitude*(noise.perlin3(noiseScale * x+4.5, noiseScale * y+5.5, z )
    + noise.perlin3(noiseScale * x+32.5, noiseScale * y+19.5, 40 + z )
    + noise.perlin3(noiseScale * x+12.5, noiseScale * y+45.5, 80 + z ))
  )),2.5)
    // * (2*Math.exp(-.0006*Math.pow(Math.sqrt(x*x + y*y),2)))
}

function pointAt(index) {
  var square = (index/POINTS_PER_SQUARE) | 0
  var squareH = square % SQUARES_PER_SIDE
  var squareV = (square / SQUARES_PER_SIDE) | 0

  var squareIndex = index % POINTS_PER_SQUARE;
  var side = (squareIndex / POINTS_PER_EDGE) | 0
  var interp = (squareIndex % POINTS_PER_EDGE) / POINTS_PER_EDGE;

  var length = (OUTER_SIDE - (SQUARES_PER_SIDE-1) * MARGIN) / SQUARES_PER_SIDE;
  var points = [{x:0,y:0},{x:length,y:0},{x:length,y:length},{x:0,y:length}]
  var p1 = points[side%4]
  var p2 = points[(side+1)%4]

  var point = {
    x: -OUTER_SIDE/2 + squareH*(length + MARGIN) + lerp(p1.x,p2.x,interp),
    y:-OUTER_SIDE/2 + squareV*(length + MARGIN) + lerp(p1.y,p2.y,interp)
  }

  var distort = scale(grad(terain, point.x, point.y, DX), -50)
  var point = {x:point.x+distort.x, y:point.y+distort.y}

  point.penDown = squareIndex != 0;
  return point;
}

importScripts('plotter.js', 'perlin.js')
var POINTS = 2500;

var force = .17;
var velocity = 1;
var position = {x:0, y:0}
var dir = {x:1, y:0}
var lastSwitch = 0;
var regionChange = .08;
var PEN_DEPTH = 3;
var OUTER_RADIUS = 70;

function lerp(a,b,x) { return a + x*(b-a) }
function normalize(v) { var d = Math.sqrt(v.x*v.x + v.y*v.y); return {x:v.x/d, y:v.y/d}}
function add(v1,v2) { return {x:v1.x+v2.x, y:v1.y+v2.y}}
function sub(v1,v2) { return {x:v1.x-v2.x, y:v1.y-v2.y}}
function dot(v1,v2) { return v1.x*v2.x + v1.y*v2.y }
function scale(v,c) { return {x:v.x*c, y:v.y*c }}
function length(v) { return Math.sqrt(v.x*v.x + v.y*v.y) }
function distance(v1,v2) { return length(sub(v1,v2)) }
function rotate(v) { return {x:v.y, y:-v.x} }

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
}

var seed = (2000*Math.random()) | 0
var permute = 0.0025
console.log(seed)
// seed = 1311; permute = 0
// seed = 924; permute = 0
// seed = 770; permute = 0.001
// seed = 1344; permute = .0025
// seed = 1618; permute = .0025
// seed = 777; permute = 0
// seed = 1991; permute = 0
// seed = 1542
seed = 395
var rng = new RNG(seed);

plotter.setupDrawWorker(POINTS, PEN_DEPTH, pointAt)

function pointAt(index) {
  var point = position;

  var l = length(position)
  if (l > OUTER_RADIUS) {
    dir = scale(dir,-1)
    position = scale(position, OUTER_RADIUS/l);
  }

  var n1 = .5*noise.perlin2(.5,.05*index)+.5
  var n2 = .5*noise.perlin3(45.5,20.5*index, 4.5)+.5

  if (rng.nextFloat() < .01) {
    regionChange = .2 * (Math.pow(rng.nextFloat(),16));
    permute = .003*rng.nextFloat()
  }

  var maxV = 4;
  if (n1 < regionChange * (lastSwitch++)) {
    force = -force;
    velocity = Math.max(-maxV, Math.min(maxV, velocity + .001 * (Math.pow(2*n2-.5,153))))
    lastSwitch = 0;
  } else {
    velocity += permute
  }

  position = add(position, scale(dir,velocity))
  dir = normalize(add(dir,scale(rotate(dir),force)))

  point.penDown = true;
  return point;
}

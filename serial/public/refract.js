importScripts('plotter.js', 'perlin.js')
var POINTS = 700;
var RADIUS = 80;
var SHAPE_RADIUS = 40;
var PEN_DEPTH = 3;
var IOR = .8;
var parameters = [Math.random(), Math.random(), Math.random(), Math.random()]
// var parameters = [0.5485687378749051,0.19783579109607086,0.13805145188996448,0.7111965171759511]
// var parameters = [0.20641791563847045,0.8870845198947805,0.8593364743307046,0.6331908870814378]
// var parameters = [0.47430908059029075,0.47937026059214927,0.9761093817312108,0.21294870796540954]
// var parameters = [0.6637622468067725,0.09901653190168669,0.21120848031285244,0.0656856980645486]
// var parameters = [0.2609795921236404,0.3602000623654038,0.8902255051740966,0.7892676888691235]
// var parameters = [0.7939618351561251,0.892862608841303,0.6451469111280748,0.6682278999172941]
// var parameters = [0.2916528360775539,0.14678343598002286,0.2291470022779203,0.11384428078272779]
// var parameters = [0.8889285428789075,0.5623309169131405,0.7089757751534842,0.9133631918582059]
// var parameters = [0.7652608518051462,0.9908510177650733,0.012871769613172379,0.46358139156685274]
// var parameters = [0.9561973420688743,0.3339678681521685,0.713042298752762,0.5527831549322637]
// var parameters = [0.7056710081437834,0.8793873944531658,0.817786651378914,0.20708540112781226]
// var parameters = [0.7287051466283456,0.4606120209902578,0.8154275368740962,0.7135498087661809]

//var parameters = [0.8861349281270785,0.04283565755385754,0.06988286048825332,0.9598430330158918]
//var parameters = [0.9524945669821623,0.4219888382890815,0.8124708940013823,0.37617338027665403]
//var parameters = [0.2574709074473782,0.711931414929893,0.8538842991102329,0.2705520559204808]
//var parameters = [0.2753779173729032,0.8973103096788946,0.6253502336849643,0.09899543456311721]
// var parameters = [0.10540801986768589,0.5473723185038608,0.07672575993508213,0.8093428336845654]
console.log('//var parameters = ['+parameters.join(',')+']')

var innerRadius = SHAPE_RADIUS * .8;
var line = {p:{x:lerp(-innerRadius,innerRadius,parameters[0]), y:lerp(-innerRadius,innerRadius,parameters[1])},
           d:normalize({x:lerp(-1,1,parameters[2]), y:lerp(-1,1,parameters[3])}), inside:true}
var inside = true;
var shape = [];
var SHAPE_POINTS = 4;
for (var i=0; i<SHAPE_POINTS; i++) {
  var theta = 2*Math.PI*(.25+i/SHAPE_POINTS);
  shape.push({x:SHAPE_RADIUS*Math.cos(theta), y:SHAPE_RADIUS*Math.sin(theta)})
}

plotter.setupDrawWorker(POINTS, PEN_DEPTH, pointAt)

function lerp(a,b,x) { return a + x*(b-a) }
function normalize(v) { var d = Math.sqrt(v.x*v.x + v.y*v.y); return {x:v.x/d, y:v.y/d}}
function add(v1,v2) { return {x:v1.x+v2.x, y:v1.y+v2.y}}
function sub(v1,v2) { return {x:v1.x-v2.x, y:v1.y-v2.y}}
function dot(v1,v2) { return v1.x*v2.x + v1.y*v2.y }
function scale(v,c) { return {x:v.x*c, y:v.y*c }}
function length(v) { return Math.sqrt(v.x*v.x + v.y*v.y) }
function distance(v1,v2) { return length(sub(v1,v2)) }

function circleLine(line, r) {
  var dx = line.d.x, dy = line.d.y;
  var dr = Math.sqrt(dx*dx + dy*dy)
  var D = line.p.x*(line.p.y+line.d.y) - (line.p.x+line.d.x)*line.p.y
  var disc = r*r * dr*dr - D*D;
  var offsetX = (dy<0?-1:1) * dx * Math.sqrt(disc)
  var offsetY = Math.abs(dy) * Math.sqrt(disc)
  var sgn = (line.d.x * offsetX + line.d.y * offsetY) < 0 ? -1 : 1;
  return {
    x: (D*dy + sgn*offsetX) / (dr*dr),
    y: (-D*dx + sgn*offsetY) / (dr*dr)
  }
}

function circleReflection(line, r) {
  var intercept = circleLine(line, r)
  var radial = normalize(intercept)
  var newDir = sub(line.d,scale(radial,2*dot(radial,line.d)))
  return {p:intercept, d:newDir}
}

function lineIntersect(v1, v2, v3, v4) {
  var det = (v1.x-v2.x)*(v3.y-v4.y) - (v1.y-v2.y)*(v3.x-v4.x);
  return !det ? null : {
    x: ((v1.x*v2.y-v2.x*v1.y)*(v3.x-v4.x) - (v3.x*v4.y-v4.x*v3.y)*(v1.x-v2.x))/det,
    y: ((v1.x*v2.y-v2.x*v1.y)*(v3.y-v4.y) - (v3.x*v4.y-v4.x*v3.y)*(v1.y-v2.y))/det
  };
}

function segmentIntersect(v1, v2, v3, v4) {
  var p = lineIntersect(v1,v2,v3,v4);
  if (!p) return false;

  var d = .00001;
  return p.x >= Math.min(v1.x,v2.x)-d && p.x >= Math.min(v3.x,v4.x)-d
    && p.x <= Math.max(v1.x,v2.x)+d && p.x <= Math.max(v3.x,v4.x)+d
    && p.y >= Math.min(v1.y,v2.y)-d && p.y >= Math.min(v3.y,v4.y)-d
    && p.y <= Math.max(v1.y,v2.y)+d && p.y <= Math.max(v3.y,v4.y)+d ? p : null
}

function shapeIntersect(line, path) {
  var origin = add(line.p, scale(line.d,.001))
  var horizon = add(line.p,scale(line.d,1000))
  return shape
      .map(function(p,i) {
        var p2 = shape[(i+1)%shape.length]
        return {line:{p1:p, p2:p2}, intersect:segmentIntersect(origin,horizon,p,p2)}
      })
      .filter(p => p.intersect != null)
      .sort((a,b) => distance(line.p,a.intersect) - distance(line.p,b.intersect))[0]
}

function refract(ray, edge, ior) {
  var edgeDir = normalize(sub(edge.p2,edge.p1))
  var edgeOrtho = {x:edgeDir.y, y:-edgeDir.x}
  var incidence = Math.asin(dot(ray.d, edgeDir)) * ior
  var sgn = dot(ray.d, edgeOrtho) >= 0 ? 1 : -1;
  return add(scale(edgeDir,Math.sin(incidence)), scale(edgeOrtho,sgn*Math.cos(incidence)))
}

function pointAt(index) {
  var intersect = shapeIntersect(line, shape)
  if (intersect) {
    inside = line.inside;
    var dir = refract(line,intersect.line,inside ? 1/IOR : IOR)
    line = {p:intersect.intersect, d:dir, inside:true}
  } else {
    inside = false;
    line = circleReflection(line, RADIUS)
  }
  line.p.penDown = index > 0;
  return line.p;
}

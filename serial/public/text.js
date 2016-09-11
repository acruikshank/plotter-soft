importScripts('plotter.js', 'perlin.js', 'fonts.js', 'Helvetica.js', 'splines.js')

var theta = -Math.PI/4;
var TEXT = 'Oona'
var PEN_DEPTH = 4;

var strokeDir = [Math.cos(theta),Math.sin(theta)]
var scale = .04;
var glyphs = fonts.glyphs(HelveticaFont, TEXT).map(glyphToCurves(-100,-20,scale,scale))
var paths = glyphs.reduce(function(paths, glyph) { return paths.concat(splines.createFill(glyph, strokeDir, .8)) }, []);

function glyphToCurves(tx,ty,sx,sy) {
  return function(glyph) {
    return glyph.map(function(loop) {
      for (var i=0,l=loop.curve.length,curves=[]; i<l; i+=2)
        curves.push([loop.curve[i] * sx + tx, loop.curve[i+1] * sy + ty])
      return curves;
    })
  }
}

plotter.setupDrawWorker(0, PEN_DEPTH, pointAt)

function pointAt(index) {
  return paths.reduce(function(m,path) {
    if (m.point) return m;
    var pi = index - m.count;
    if (pi < path.length)
      return {count: index, point:{x:path[pi][0], y:path[pi][1], penDown: pi != 0}}
    return {count: m.count + path.length}
  }, {count:0}).point
}

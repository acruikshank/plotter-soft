var fonts = (function() {
  function attrs(el) { for(var o={},i=0,a;a=el.attributes[i];i++)o[a.name]=a.value; return o; }
  function merge(o1,o2) { var o={};for(var k in o1)o[k]=o1[k]; for(k in o2)o[k]=o2[k]; return o; }

  function loadFont(fontFile, cb) {
    var request = new XMLHttpRequest();
    var lineContext = {left:0, top:0};
    var line = '';

    request.onreadystatechange = function() {
      if (request.readyState > 3) {
        var fontDoc = request.responseXML;
        var fontFace = merge(attrs(fontDoc.querySelector('font')),
                         attrs(fontDoc.querySelector('font-face')));
        fontFace.glyphs = {};
        fontFace.glyphCounts = [];
        var glyphNodes = fontDoc.querySelectorAll('glyph');
        for (var i=0, glyph; glyph=glyphNodes[i]; i++) {
          var glyphObj = attrs(glyph);
          if (glyphObj.unicode) {
            var glyphSize = glyphObj.unicode.length;
            fontFace.glyphs[glyphSize] = fontFace.glyphs[glyphSize] || {};
            fontFace.glyphs[glyphSize][glyphObj.unicode] = glyphObj;
          }
        }

        fontFace.glyphCounts = [];
        for (var k in fontFace.glyphs) fontFace.glyphCounts.push(+k);
        fontFace.glyphCounts = fontFace.glyphCounts.sort().reverse();

        fontFace.kerns = {};
        var hkerns = fontDoc.querySelectorAll('hkern');
        for (var i=0, hkern; hkern=hkerns[i]; i++) {
          var kern = attrs(hkern);
          var left = (kern.u1==undefined?[]:[kern.u1]).concat((kern.g1?kern.g1.split(','):[]))
          var right = (kern.u2==undefined?[]:[kern.u2]).concat((kern.g2?kern.g2.split(','):[]))
          left.forEach(function(l) { right.forEach(function(r) { fontFace.kerns[l+'**'+r] = +kern.k; })})
        }

        cb(null, fontFace);
      }
    }
    request.open('GET',fontFile);
    request.send();
  }

  function horizontalAdvance(fontFace, leftGlyph, rightGlyph ) {
    var horizAdv = +leftGlyph['horiz-adv-x'] || numeric(fontFace['horiz-adv-x']);
    var kern = fontFace.kerns[ leftGlyph.unicode + '**' + rightGlyph.unicode ]
      || fontFace.kerns[ leftGlyph.unicode + '**' + rightGlyph['glyph-name'] ]
      || fontFace.kerns[ leftGlyph['glyph-name'] + '**' + rightGlyph.unicode ]
      || fontFace.kerns[ leftGlyph['glyph-name'] + '**' + rightGlyph['glyph-name'] ];
    horizAdv += kern || 0;

    return horizAdv;
  }

  function chooseGlyph(fontFace, text, index) {
    for (var i=0,count; count=fontFace.glyphCounts[i]; i++) {
      var chrs = text.substring(index,index+count);
      if (fontFace.glyphs[count][chrs])
        return fontFace.glyphs[count][chrs];
    }
  }

  function glyphs(fontFace, text, tracking) {
    tracking = tracking || 1
    var glyphs = [];
    var ppem = fontFace['units-per-em'];
    var scale = 100/ppem;

    var lastGlyph = null;
    var offset = 0;

    for (var i=0; i<text.length; i++) {
      var glyph = chooseGlyph(fontFace, text, i);

      if (glyph) {
        i += glyph.unicode.length - 1;

        if (lastGlyph)
          offset += tracking * horizontalAdvance(fontFace, lastGlyph, glyph);

        glyphs.push( parse(glyph.d, offset) );
        lastGlyph = glyph;
      }
    }
    return glyphs;
  }

  function renderGlyph(ctx, loops) {
    ctx.beginPath();
    loops.forEach( function(loop) {
      var curve = loop.curve;
      var start = curve.subarray(0,2);
      ctx.moveTo.apply( ctx, start );
      for (var i=0, l=curve.length; i<l; i+=8)
        ctx.bezierCurveTo.apply( ctx, curve.subarray(i+2,i+8) );
      ctx.lineTo.apply( ctx, start );
    })
  }

  function numeric(val) { return +(val||0); }
  function quadToCubic(c) {
    var s = c.slice(0,2), m = c.slice(2,4), e = c.slice(4,6);
    return s.concat(cubesplit(s,m)).concat(cubesplit(e,m)).concat(e) }
  function cubesplit(p1,p2) { return [p1[0]+2*(p2[0]-p1[0])/3, p1[1]+2*(p2[1]-p1[1])/3] }
  function midpoint(p1,p2) { return [p1[0]+(p2[0]-p1[0])/2, p1[1]+(p2[1]-p1[1])/2] }
  function mirror(ctl,p) { return [2*p[0] - ctl[0], 2*p[1] - ctl[1]]}
  function distance(p1,p2) { var dx=p1[0]-p2[0], dy=p1[1]-p2[1]; return Math.sqrt(dx*dx+dy*dy) }

  function parse(path, offset) {
    offset = offset || 0
    var loop;
    var loops = [];
    var lastPoint, lastCtl, firstPoint;
    if (path) path.replace(/([MZLCHVQT])([\s-\d\.\,]*)/gi, function(cmd, code, params) {
      var coords = params.replace(/(\d)-/g,'$1 -').replace(/\s*$/,'').split(/[\s\,]+/).map(function(s) { return +s });

      switch (code) {
        case 'H': coords = [coords[0], lastPoint[1]];                               break;
        case 'h': coords = [coords[0]+lastPoint[0], lastPoint[1]];                  break;
        case 'V': coords = [lastPoint[0], coords[0]];                               break;
        case 'v': coords = [lastPoint[0], coords[0]+lastPoint[1]];                  break;
        case 'm': case 'l': case 'q': case 't': case 'z': case 'c':
                  coords = coords.map(function(c,i) {return c + lastPoint[i&1]});   break;
      }

      var segment;
      switch (code.toLowerCase()) {
        case 'm': firstPoint = lastPoint = coords; loops.push(loop = {curve:[]});   break;
        case 'l': case 'h': case 'v':
                  segment = lastPoint.concat(midpoint(lastPoint,coords)).concat(coords);
                  lastCtl = null;
                  lastPoint = coords;                                               break;
        case 'q': segment = lastPoint.concat(coords);
                  lastCtl = coords.slice(0,2);
                  lastPoint = coords.slice(2);                                      break;
        case 'c': segment = lastPoint.concat(coords);
                  lastCtl = coords.slice(2,4);
                  lastPoint = coords.slice(4);                                      break;
        case 't': lastCtl = lastCtl
                            ? mirror(lastCtl, lastPoint)
                            : midpoint(lastPoint,coords);
                  segment = lastPoint.concat(lastCtl).concat(coords);
                  lastPoint = coords;                                               break;
        case 'z': segment = lastPoint.concat(midpoint(lastPoint,firstPoint)).concat(firstPoint);
                  lastPoint = firstPoint;                                           break;
      }
      if (!segment) return ''
      if (segment.length < 8) segment = quadToCubic(segment)
      if (distance(segment.slice(0,2), segment.slice(6,8)) < .0001) return ''
      loop.curve = loop.curve.concat( segment );
      return ''
    });
    loops.forEach(function(loop) { loop.curve = new Float32Array(loop.curve.map(function(p,i) { return p+((i%2) ? 0 : offset)})) });
    return loops;
  }


  return {loadFont:loadFont, glyphs:glyphs, renderGlyph:renderGlyph, parse:parse}
})()

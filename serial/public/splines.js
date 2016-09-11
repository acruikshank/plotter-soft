var splines = (function() {
  function cubicIntersection(cubic, line) {
    var X=Array();

    var A=line[1][1]-line[0][1];	    //A=y2-y1
    var B=line[0][0]-line[1][0];	    //B=x1-x2
    var C=line[0][0]*(line[0][1]-line[1][1]) +
            line[0][1]*(line[1][0]-line[0][0]);	//C=x1*(y1-y2)+y1*(x2-x1)

  	var bx = bezierCoeffs(cubic[0][0],cubic[1][0],cubic[2][0],cubic[3][0]);
  	var by = bezierCoeffs(cubic[0][1],cubic[1][1],cubic[2][1],cubic[3][1]);

    var roots = cubicRoots([
  	   A*bx[0]+B*by[0],
       A*bx[1]+B*by[1],
       A*bx[2]+B*by[2],
       A*bx[3]+B*by[3] + C ])
      .filter(function(x) { return x >= 0 && x <=1; });

    return roots.map(function(t) {
      var intersection = [
        (((bx[0]*t) + bx[1])*t + bx[2])*t + bx[3],
        (((by[0]*t) + by[1])*t + by[2])*t + by[3]
      ]
      intersection.t = t;
      return intersection;
    })
  }

  /*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code*/
  function cubicRoots(P) {
    if (Math.abs(P[0]) < .01) return quadraticRoots(P.slice(1))

  	var a=P[0], b=P[1], c=P[2], d=P[3];

  	var A = b/a;
  	var B = c/a;
  	var C = d/a;

    var Q, R, D, S, T, Im;

    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t=[];

    if (D >= 0) {                                 // complex or duplicate roots
      var S = sgn(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
      var T = sgn(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));

      t[0] = -A/3 + (S + T);                    // real root
      t[1] = -A/3 - (S + T)/2;                  // real part of complex root
      t[2] = -A/3 - (S + T)/2;                  // real part of complex root
      Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair

      /*discard complex roots*/
      if (Im!=0) {
        t[1]=-1;
        t[2]=-1;
      }
    } else {                                        // distinct real roots
      var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));

      t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
      t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
      t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
      Im = 0.0;
    }

    return t
  }

  function quadraticRoots(P) {
    if (Math.abs(P[0]) < .0001) return linearRoots(P.slice(1))
    var root = Math.sqrt(P[1]*P[1] - 4*P[0]*P[2])
    if (isNaN(root)) return []
    return [(-P[1]+root) / (2*P[0]), (-P[1]-root) / (2*P[0])]
  }

  function linearRoots(P) {
    return [-P[1]/P[0]]
  }

  function sgn( x ) { return x < 0 ? -1 : 1 }

  function bezierCoeffs(P0, P1, P2, P3) {
  	return [ -P0 + 3*P1 + -3*P2 + P3, 3*P0 - 6*P1 + 3*P2, -3*P0 + 3*P1, P0 ]
  }

  /* given a shape, a direction and an increment, x,
  Create fill paths such that:
  * The distance between Every point in the shape and some fill line is <= to x.
  * Every point in the fill lines is in in the shape.
  * No point in the fill lines is outside the shape.
  * The number of fill lines (jumps) is minimized.
  Returns and array of lines where each line is an array of points that can be drawn continuously.
  */
  function createFill(shape, strokeDir, xInc) {
    var fillLines = []
    var activeLines = []
    var traverseDir = orthoCCW(strokeDir)
    var bounds = projectionBounds(shape, traverseDir)
    var reverse = false;
    for (var x=bounds[0]; x<bounds[1]; x+=xInc) {
      var l0 = vscale(traverseDir, x)
      var intersections = findIntersections(shape, l0, strokeDir)
      if (intersections.length % 2) continue; // skip if we have an odd number

      var pairs = pairOff(intersections, reverse)
      var merged = mergeNew(activeLines,pairs,mergeable,merge);
      activeLines = merged[0]
      fillLines = fillLines.concat(merged[1].map(lineToPoints))

      reverse = !reverse;
    }
    fillLines = fillLines.concat(activeLines.map(lineToPoints))
    return fillLines;

    function mergeable(path1, path2) {
      var lastPoint = path1[path1.length - 1]
      var i1 = path2[0]
      return lastPoint && i1.loop == lastPoint.loop && nearInLoop(shape[i1.loop], i1.path, lastPoint.path)
    }

    function merge(path1, path2) {
      return path1.concat(path2)
    }
  }

  /* Given a list of active paths and a list of next points to add
  return active paths list to match the points to add and the completed paths.
  */
  function mergeNew(oldList, newList, mergeable, merge) {
    oldList = oldList.slice(0)
    var merged = [];
    var deletions = [];
    for (var i=0; i<newList.length; i++) {
      var newElement = newList[i]
      for (var j=0, l=oldList.length; j<l; j++) {
        var oldElement = oldList[j]
        if (mergeable(oldElement, newElement)) {
          merged.push(merge(oldList.splice(j,1)[0],newElement))
          deletions = deletions.concat(oldList.splice(0,j))
          break;
        }
      }
      if (j >= l)
        merged.push(newElement)
    }
    return [merged, deletions.concat(oldList)]
  }

  /* given a shape, a point, p, and a direction normal, d,
  find all intersections with the shape and the the line through p along d
  sorted s.t. each point is further than the last in the d direction.
  */
  function findIntersections(shape, p, d) {
    var intersections = []
    var line = [p,vadd(p,d)]
    shape.forEach(function(loop,l) {
      for (var i=0; i<loop.length; i+=4) {
        var curve = loop.slice(i,i+4);
        cubicIntersection(curve, line).forEach(function(p) { intersections.push({p:p,loop:l,path:i/4,t:p.t}) })
      }
    })
    return intersections.sort(function(a,b) {
      return vdot(a.p,d) - vdot(b.p,d)
    })
  }

  /* given a shape and a normalized direction vector,
  find two distances, d0 and d1, on the line, l, through the origin and the dir vector
  such that the projection of all points in the shape onto l lay on
  the side on the side of p in which the dir vector is pointing.
  */
  function projectionBounds(shape, dir) {
    return shape.reduce(function(points, loop) {
      return loop.reduce(function(points, v) {
        var proj = vdot(dir,v)
        if (!points.length) return [proj,proj]
        if (points[0] > proj) return [proj, points[1]]
        if (points[1] < proj) return [points[0], proj]
        return points;
      }, points)
    }, [])
  }

  function cubicTangent(cubic,t) {
    return [quadraticPoint(cubic.slice(0,3),t), quadraticPoint(cubic.slice(1,4),t)]
  }

  function quadraticPoint(quadratic, t) {
    return [
      lerp(lerp(quadratic[0][0],quadratic[1][0],t), lerp(quadratic[1][0],quadratic[2][0],t), t),
      lerp(lerp(quadratic[0][1],quadratic[1][1],t), lerp(quadratic[1][1],quadratic[2][1],t), t)
    ]
  }

  function lerp(a,b,x) { return a + x*(b-a) }
  function pairOff(list, reverse) {
    for (var i=0, pairs=[]; i<list.length; i+=2) pairs.push([list[i+(reverse?1:0)], list[i+(reverse?0:1)]])
    return pairs
  }
  function lineToPoints(l) { return l.map(intersectionToPoint) }
  function intersectionToPoint(i) { return i.p }
  function nearInLoop(loop, i1, i2) { return Math.abs(i1-i2) < 2 || Math.abs(i1-i2) > loop.length/4-2 }

  // VECTOR MATH
  function vadd(a,v) { return [a[0]+v[0], a[1]+v[1]]; }
  function vsub(a,v) { return [a[0]-v[0], a[1]-v[1]]; }
  function vscale(a,c) { return [a[0]*c, a[1]*c]; }
  function vdot(a,v) { return a[0]*v[0] + a[1]*v[1]; }
  function vcross(a,v) { return [a[1]*v[2] - a[2]*v[1], a[2]*v[0] - a[0]*v[2]]; }
  function vlength(v) { return Math.sqrt(v[0]*v[0]+v[1]*v[1]); }
  function vdist(a, v) { return vlength(vsub(a,v)); }
  function vnorm(v) { var l=vlength(v); return l > 0 ? [v[0]/l, v[1]/l] : v; }
  function vinterp(a,b,c) { return vadd(a,vscale(vsub(b,a),c)); }
  function orthoCW(v) { return [v[1], -v[0]] }
  function orthoCCW(v) { return [-v[1], v[0]] }

  return {createFill:createFill, cubicIntersection: cubicIntersection, findIntersections:findIntersections, cubicTangent}
})()

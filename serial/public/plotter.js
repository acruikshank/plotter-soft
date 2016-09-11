plotter = {
  setup: function(delay) { return {code:0, delay:delay||0} },
  moveTo: function(x, y, delay) { return {code:1, x:x, y:y, delay:delay||0} },
  penDown: function(depth, delay) { return {code:2, x:depth, delay:delay||0} },
  penUp: function(delay) { return {code:3, delay:delay||0} },
  disable: function(delay) { return {code:4, delay:delay||0} },
  center: function(delay) { return {code:5, delay:delay||0} },

  setupDrawWorker: function(points, penDepth, pointAt) {
    var state = 0, index = 0, lastPoint, penDown;
    points = points || 1<<30;

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
        case 1: state++; return move();
        case 2: return draw();
        case 3: state++; return plotter.penUp();
        case 4: state++; return plotter.center();
        case 5: state++; return plotter.disable();
      }
    }

    function move() {
      var point = pointAt(index++)
      if (point.penDown == null || point.penDown) {
        lastPoint = point
        return plotter.penDown(penDepth);
      }
      return plotter.moveTo(point.x, point.y);
    }

    function draw() {
      var point = lastPoint;
      lastPoint = null;
      if (!point) {
        point = pointAt(index++)
        if (! point) return state++;
        if (point.penDown != null && point.penDown != penDown) {
          penDown = point.penDown;
          lastPoint = point;
          return penDown ? plotter.penDown(penDepth) : plotter.penUp();
        }
      }
      if (index >= points) state++;
      return plotter.moveTo(point.x, point.y);
    }
  }
};

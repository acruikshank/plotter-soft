
var index = 0;
importScripts('plotter.js')
console.log("running test")

onmessage = function commandAt(e) {
  var count = e.data.count;
  var commands = []
  for (var i=0; i < count; i++) {
    if (index>=3) break;
    commands.push( commandAtIndex(index++) );
  }
  postMessage(commands)
}

function commandAtIndex(i) {
  switch (i) {
    case 0: return plotter.setup(500);
    case 1: return plotter.center();
    case 2: return plotter.disable();
  }
}

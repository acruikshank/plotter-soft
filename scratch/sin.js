var index = 0;

onmessage = function commandAt(e) {
  var count = e.data.count;
  var commands = []
  for (var i=0; i<count; i++) {
    var N = 100;
    if (index%N == 0)
      commands.push({ code:2, delay:100 })
    else
      commands.push({ code:1, delay:50, x:Math.pow((index%N)/N,2), y:Math.pow((index+N/2)%N/N,2) })
    index++;
  }
  postMessage(commands)
}

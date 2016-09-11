var SerialPort = require("serialport");

SerialPort.list(function(err, ports) {
  if (err) return console.errro("ERROR", err);
  var matchingPorts = ports.map(p => p.comName).filter(name => name.match(process.argv[2]));

  if (! matchingPorts.length) {
    console.error("No Matching port")
    console.log(ports.map(p => p.comName))
    return
  }

  openPort(matchingPorts[0])
})

function openPort(portName) {
  var port = new SerialPort(portName);

  var index = 0;
  port.on('open', function() {
    console.log("Port is open")
  })

  port.on('error', function(err) {
    console.error("ERROR", err)
  })

  port.on('data', function(data) {
    console.log('data')
    if (data[0] > 0) {
      for (var i=0; i<data[0]; i++)
        sendCommandAt(index++, port);
      port.flush()
    }
  });
}

function sendCommandAt(i, port) {
  var N = 100;
  // var step = i%4 + 1
  // return writeCommand( port, step==1 ? 0 : step, 20)
  var theta = Math.PI * .02 * i
  // writeCommand( port, 1, 50, .5 + .5*Math.cos(theta), .5 + .5*Math.sin(theta) )
  if (i%N == 0)
    writeCommand(port, 2, 100);
  else
    writeCommand( port, 1, 50, Math.pow((i%N)/N,2), Math.pow((i+N/2)%N/N,2))

}

function writeCommand(port, code, delay, x, y) {
  var buffer = new ArrayBuffer(3 + (x!=null ? 4 : 0) + (y!=null ? 4 : 0));
  var view = new DataView(buffer)
  view.setInt8(0, code, true);
  view.setInt16(1, delay, true);
  if (x != null) view.setFloat32(3, x, true);
  if (y != null) view.setFloat32(7, y, true);
  port.write(buffer);
}

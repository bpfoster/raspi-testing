

var express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , serialport = require("serialport")
  , SerialPort = serialport.SerialPort
  
  
  
  var serialPort = null
  serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        if (port.manufacturer.indexOf("Arduino") != -1 && serialPort == null) {
            serialPort = new SerialPort(port.comName, {
                baudrate: 9600,
                parser: serialport.parsers.readline("\n")
            }, false);
            
            serialPort.open(function () {
                console.log('serial open');
            });
            serialPort.on('data', function(data) {
              console.log('data received: ' + data);
      
              var dataDate = new Date()
              var dataPoints = data.split(",")
              io.sockets.emit('dataUpdate',{
                  date: dataDate,
                  light: dataPoints[2].split(":")[1],
                  temp1: dataPoints[3].split(":")[1],
                  temp2: dataPoints[4].split(":")[1]
              })
            });
        }
    });
    if (serialPort == null) {
        throw "No Arduino Found!"
    }
  });
  
  
// serialPort.open(function () {
//     console.log('serial open');
//     // serialPort.on('data', function(data) {
// //       console.log('data received: ' + data);
// //     });
//     // serialPort.write("ls\n", function(err, results) {
//     //   console.log('err ' + err);
//     //   console.log('results ' + results);
//     // });
//   });

  
//Socket.io Config
io.set('log level', 1);

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});
// 
// app.get('/remote', function (req, res) {
//   res.sendfile(__dirname + '/public/remote.html');
// });

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




io.sockets.on('connection', function (socket) {

});


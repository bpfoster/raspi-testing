
// var serialPort = new SerialPort("/dev/tty-usbserial1", {
//   baudrate: 57600
// });

var express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , SerialPort = require("serialport").SerialPort

  
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
    socket.emit('data',{'data': stuffData})
    
    
    setInterval(function () {
      var date = new Date()
      var temp = Math.floor(Math.random() * (max - min + 1)) + min
  
      stuffData.shift()
      stuffData.push({x: date, y: temp})
      socket.emit('data',{'data': stuffData})
    }, 10000);
});





//////////////////


var stuffData = []
var max = 65;
var min = 50;

// function seedStuff() {
  var points = 60;
  
  var now = new Date()
  for (var i = 0; i < points; i++) {
    stuffData.unshift({x: new Date(now.getTime() - (i * 60000)), y: Math.floor(Math.random() * (max - min + 1)) + min})
  }
// }


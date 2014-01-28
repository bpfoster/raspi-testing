

var config = require('./config')
  , express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , MongoClient = require('mongodb').MongoClient
  , Redis = require("redis")
  , redisClient = Redis.createClient(config.redis.port, config.redis.host)
  

  
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




var allClients = [];

io.sockets.on('connection', function (socket) {
    console.log("Client connected")
    allClients.push(socket);
    socket.on('disconnect', function() {
        console.log('Got disconnect!');

        var i = allClients.indexOf(socket);
        allClients.splice(i, 1)
     });
       
    
    var mongoUri = 'mongodb://'+config.mongo.username+':'+config.mongo.password+'@'+config.mongo.host+'/' + config.mongo.db
    console.log("Connecting to mongo at " + mongoUri)
    MongoClient.connect(mongoUri, function(err, db) {
      if(err) throw err;
      console.log("Connected to mongodb")
    
      var collection = db.collection('sensor_readings');


      collection.find().sort({"date": -1}).limit(200).toArray(function(err, docs){
        if (err) throw err;
        
        var initialData = []
        
        docs.forEach(function(doc) {
          initialData.unshift({
            date: doc.date,
            light: doc.lv,
            temp1: doc.tmp,
            temp2: doc.tmp2
          });
        });
        
        socket.emit("dataRefresh", {data: initialData})
      });
    });
});



redisClient.on("message", function(channel, message){
  if (channel == "dataEvent") {
          
    if (allClients.length > 0) {
      var sensorEvent = JSON.parse(message);
          
      allClient.forEach(function(socket){
        socket.emit("dataUpdate",{
          date: sensorEvent.date,
          light: sensorEvent.lv,
          temp1: sensorEvent.tmp,
          temp2: sensorEvent.tmp2
        });
      })
    }
  }
});
redisClient.subscribe("dataEvent")
var  config = require('./config')
  , serialport = require("serialport")
  , SerialPort = serialport.SerialPort
  , MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , request = require('request')
  , Redis = require("redis")
  , redisClient = Redis.createClient(config.redis.port, config.redis.host)
  

console.log("Connecting to mongo at " + config.mongo.uri)
MongoClient.connect(config.mongo.uri, function(err, db) {
    if(err) throw err;
    console.log("Connected to mongodb")

    var collection = db.collection(config.mongo.collection);
    
    var serialPort = null
    serialport.list(function (err, ports) {
      ports.forEach(function(port) {
          if (typeof port.pnpId != 'undefined' && port.pnpId.indexOf("Arduino") != -1 && serialPort == null) {
              serialPort = new SerialPort(port.comName, {
                  baudrate: 9600,
                  parser: serialport.parsers.readline("\n")
              }, false);
          
              serialPort.open(function () {
                  console.log('serial open');
              });
              serialPort.on('data', function(data) {
                if(data.indexOf("[V]") == 0) {
                  console.log('data received: ' + data);
    
                  var dataDate = new Date()
                  var dataPoints = data.replace("[V]", "").replace("\r","").replace("\n","").split(",")
                  var sensorData = {date: dataDate}
                  dataPoints.forEach(function(point){
                      var kv = point.split(":")
                      sensorData[kv[0]] = kv[1]
                  });
                  collection.insert(sensorData, function(err, docs){
                      if(err) throw err;
                  });
                  
                  request.post({
                    uri:'https://dweet.io:443/dweet/for/jade7%7Bhamper',
                    body:JSON.stringify(sensorData),
                    headers:{
                      'Content-Type':'application/json'
                    }
                  }, function(error,response,body) {
                    if (!error && response.statusCode == 200) {
                      console.log(body)
                    } else {
                      console.log("ERROR! " + error)
                    }
                  });
                
                  redisClient.publish("dataEvent", JSON.stringify(sensorData))
                }
              });
          }
      });
      if (serialPort == null) {
          throw "No Arduino Found!"
      }
    });

});



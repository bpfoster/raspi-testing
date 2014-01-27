var serialport = require("serialport")
  , SerialPort = serialport.SerialPort
  , MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , config = require('./config')
  
  
MongoClient.connect('mongodb://'+config.mongoUsername+':'+config.mongoPassword+'@'+config.mongoHost+'/' + config.mongoDb, function(err, db) {
    if(err) throw err;
    console.log("Connected to mongodb")

    var collection = db.collection('sensor_readings');
    
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
                console.log('data received: ' + data);
    
                var dataDate = new Date()
                var dataPoints = data.split(",")
                var sensorData = {date: dataDate}
                dataPoints.forEach(function(point){
                    var kv = point.split(":")
                    sensorData[kv[0]] = kv[1]
                });
                collection.insert(sensorData, function(err, docs){
                    if(err) throw err;
                })
              });
          }
      });
      if (serialPort == null) {
          throw "No Arduino Found!"
      }
    });
    
    
    // collection.insert({a:2}, function(err, docs) {
// 
//         collection.count(function(err, count) {
//           console.log(format("count = %s", count));
//         });
// 
//         // Locate all the entries using find
//         collection.find().toArray(function(err, results) {
//           console.dir(results);
//           // Let's close the db
//           db.close();
//         });
//     });
});


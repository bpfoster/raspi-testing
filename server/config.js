var config = {}


config.mongo = {}

config.mongo.uri = "mongodb://localhost/raspi"
config.mongo.collection = "sensor_readings"


config.redis = {}
config.redis.host = "localhost"
config.redis.port = 6379

module.exports = config;
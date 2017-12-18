var Elasticsearch = require('winston-elasticsearch');
var elasticsearch = require('elasticsearch');
var winston = require('winston');
var EDIClient = new elasticsearch.Client({
   host: 'http://192.168.0.70:9200',
   log: 'trace'
});
var username = 'loopbacktest';
var esTransportOpts = {
   level: 'info',
   indexPrefix :'logstash',
   // clientOpts: new elasticsearch.Client(config())
   client: EDIClient,
   //Transformer: lstransformer,
   consistency: false,
   transformer: function (logData) {
    const transformed = {};
    transformed['@timestamp'] = logData.timestamp ? logData.timestamp : new Date().toISOString();
    transformed.message = logData.message;
    transformed.severity = logData.level;
    transformed.fields = logData.meta;
    transformed.host = username;
    return transformed;
    }
};
//定义日志
var logger = new winston.Logger({
   transports: [
       new Elasticsearch(esTransportOpts)
   ]
});

module.exports = logger;
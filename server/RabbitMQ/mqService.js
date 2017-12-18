const amqp = require('amqplib');

const open = amqp.connect("amqp://192.168.0.251");

function mqSerivce(queueName) {
  var tt=this;
  open.then((conn) => {
    conn.createChannel().then(ch=>{
        tt.ch =ch;
      })
  })
}


mqSerivce.prototype.sendToQueue = function (data, qName) {
  var zz= this;
  return new Promise(function(resolve, reject)  {
    var ch=zz.ch;
    ch.assertQueue(qName, { durable: true })
      .then(ok => {
        return ch.sendToQueue(qName, new Buffer(JSON.stringify(data)));
      })
        .then(ok => {
          if (ok)
            resolve(true);
          else
            reject(ok);
        }).catch((e) => {
      reject(e);
    });
  });
};
module.exports = exports = mqSerivce;



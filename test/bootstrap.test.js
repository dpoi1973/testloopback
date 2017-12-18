'use strict';
var app = require('../server/server');





before(function(done) {
 
global.app = app;

global.server = app.start();
done()
// setTimeout(function() {
//     done();
// }, 2000);



});

after(function(done) {
  global.server.close((err)=>{
      done(err);
      console.log('shutdown');
  });
});


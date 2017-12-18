module.exports = function(GridColumnModel) {
    GridColumnModel.emptymodel = function(cb) {
        var currentDate = new Date();
        var currentHour = currentDate.getHours();
        var OPEN_HOUR = 6;
        var zz = GridColumnModel.create();
        console.log(zz);
        var CLOSE_HOUR = 20;
        console.log('Current hour is ' + currentHour);
        var response;
        if (currentHour > OPEN_HOUR && currentHour < CLOSE_HOUR) {
            response = 'We are open for business.';
        } else {
            response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
        }
        cb(null, zz);
    };
    GridColumnModel.remoteMethod(
        'emptymodel', {
            http: { path: '/status', verb: 'get' },
            returns: { arg: 'modelempty', type: 'object' }
        }
    );

};
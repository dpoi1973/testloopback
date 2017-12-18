'use strict'

module.exports = function(Gridoption, app) {
  let _ = require('lodash');
  Gridoption.getoptionsbyModel = function(modelname, cb) {
    var currentDate = new Date();
    var currentHour = currentDate.getHours();
    var OPEN_HOUR = 6;

    Gridoption.findOne({
        where: modelname,
        include: ["columns"]
      })
      .then(datagrid => {
        if (datagrid) {
          let obj = datagrid.columns;
          let data = _.map(_.sortBy(datagrid.toJSON().columns, 'displaySeq'), function(value) {
            var result = {
              name: value.columnTitle,
              enableCellEdit: value.editable,
              field: value.columnName,
              width: value.columnWidth
            };
            if (value.pinWhere == 'left')
              result['pinnedLeft'] = true;
            else if (value.pinWhere == 'right')
              result['pinnedRight'] = true;
            if(_.isString(value.cellFilter)&& value.cellFilter!=="")
              result["cellFilter"] = value.cellFilter

            return result;
          });


          console.log(data);
          cb(null, data);
        } else
          cb(null, null);

      });

    // var zz = GridColumnModel.create();


  };
  Gridoption.remoteMethod(
    'getoptionsbyModel', {
      http: { path: '/getoptionsbyModel', verb: 'get' },
      accepts: { arg: 'modelName', type: 'object', http: { source: 'query' } },
      returns: { arg: 'result', type: 'array' }
      // type: 'array', root: true
    }
  );
  Gridoption.observe('before save', function updateTimestamp(ctx, next) {
    if (ctx.instance) {

      ctx.instance.keystr = `${ctx.instance.applicationName}-${ctx.instance.gridModelName}`;
    } else {
      ctx.data.keystr = `${ctx.data.applicationName}-${ctx.data.gridModelName}`;
    }
    next();
  });
  Gridoption.observe('before delete', function updateTimestamp(ctx, next) {


    Gridoption.app.models.GridColumnModel.destroyAll({ gridoptionId: ctx.where.id })
      .then(err => {
        next();
      });

  });




  /* "modelName": {
       "type": "string",
       "required": true
     },
     "columnName": {
       "type": "string"
     },
     "columnTitle": {
       "type": "string"
     },
     "columnWidth": {
       "type": "string"
     },
     "displaySeq": {
       "type": "string"
     },
     "editable": {
       "type": "boolean"
     },
     "editModelField": {
       "type": "boolean"
     },
     "dataType": {
       "type": "string"
     },
     "pinWhere": {
       "type": "string"
     }*/
};
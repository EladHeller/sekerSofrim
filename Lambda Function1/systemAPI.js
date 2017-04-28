'use strict';

const dal = require('./dal');

const saveErrorLog = (event, context, callback) => {
    dal.saveErrorLog(event.err).then(evt => {
            callback(evt.err, evt.data)
        })
        .catch(callback);
};

exports.saveErrorLog = saveErrorLog;
'use strict';

const dal = require('./dal');

const saveErrorLog = (event, context, callback) => {
    dal.saveErrorLog(event.err, event)
    .then(data => {
        callback(null, data)
    })
    .catch(callback);
};

module.exports = {
    saveErrorLog,
};
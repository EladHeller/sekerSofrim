'use strict';

const dal = require('./dal');

const getMessages = (event, context, callback) => {
    console.log(event, context, callback);
    dal.scanTable("Messages").then(evt => {
        
        callback(evt.err, evt.data);
    })
    .catch(callback);
};

exports.getMessages = getMessages;
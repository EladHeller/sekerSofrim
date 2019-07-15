'use strict';

const dal = require('./dal');

const getMessages = (event, context, callback) => {
    dal.scanTable("Messages").then(data => {
        callback(null, data);
    })
    .catch(callback);
};

exports.getMessages = getMessages;
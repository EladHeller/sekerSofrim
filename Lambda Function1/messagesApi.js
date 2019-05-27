'use strict';

const dal = require('./dal');

const getMessages = (event, context, callback) => {
    dal.scanTable("Messages").then(data => {
        callback(null, data);
    })
    .catch(err => callback({err}));
};

exports.getMessages = getMessages;
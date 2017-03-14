'use strict';

const dal = require('./dal');
const awsProvider = require('./awsProvider');

const getMessages = (event, context, callback) => {
    dal.scanTable("Messages").then(evt => {
        callback(evt.err, evt.data);
    });
};

exports.getMessages = awsProvider.api(getMessages);
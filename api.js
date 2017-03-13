'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const awsProvider = require('./awsProvider');

const getMessages = (event, context, callback) => {
    const done = awsProvider.getDoneFunction(callback);
    dynamo.scan({ TableName: "Messages" }, (err, data) => {
        done(err, data && data.Items);
    });
};
exports.getMessages = getMessages;
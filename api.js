'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

function getDoneFunction(callback) {
    return (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify({ res }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}
const getMessages = (event, context, callback) => {
    const done = getDoneFunction(callback);
    dynamo.scan({ TableName: "Messages" }, (err, data) => {
        done(err, data.Items);
    });
};
exports.getMessages = getMessages;
'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const dal = require('./dal');

function getDoneFunction(callback) {
    return (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify({ res }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

exports.getMessages = (event, context, callback) => {
    const done = getDoneFunction(callback);
    dynamo.scan({ TableName: "Messages" }, done);
}

exports.resetPassword = (event, context, callback) => {
    const done = getDoneFunction(callback);
    dal.getUserById(event.body.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done(null, { userExist: false });
            } else if (item.email || item.cellphoneNumber){
                createUserPassword(event.body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        done(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    });
            }
        });
}

exports.searchUserById = (event, context, callback) => {
    const done = getDoneFunction(callback);
    const body = event.body || {};

    if (!body.ID) {
        done('require body with ID param');
    } else {
        dal.getUserById(body.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done(null, { userExist: false });
            } else if (item.password) {
                done(null, { userExist: true, hasPassword: true });
            } else if (item.email || item.cellphoneNumber) {
                createUserPassword(body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        done(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    });
            } else {
                done(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: false
                });
            }
        });
    }
};

exports.passwordLogin = (event, context, callback) => {
    const done = getDoneFunction(callback);

    getUserById(event.body.ID).
        then(evt => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done(null, { userExist: false });
            } else if (item.password) {
                
            }
        });
};

function createUserPassword(ID, mailAddress, phoneNumber) {
    const sender = require('./sender');

    const password = generatePassword();
    const params = {
        TableName: 'Users',
        Key: {
            ID: {
                S: ID
            }
        },
        UpdateExpression: 'SET #p = :p',
        ExpressionAttributeNames: {
            "#p": "password"
        },
        ExpressionAttributeValues: {
            ":p": {
                S: password
            }
        }
    };

    const promise = new Promise((resolve, reject) => {
        dynamodb.updateItem(params, (err, data) => {
            const msg = `סיסמתך החדשה לאתר סקר סופרים היא ${password}.`;
            if (err) {
                resolve({ err });
            } else if (mailAddress) {
                sender.sendMail(mailAddress, 'סיסמה חדשה לאתר סקר סופרים', msg)
                    .then(resolve);
            } else if (phoneNumber) {
                sender.sendSMS(msg, phoneNumber)
                    .then(resolve);
            }
        });
    });
    return promise;
}

function generatePassword() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(97 + Math.floor(Math.random() * 26)) +
        Math.random().toString().substring(2, 7);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};
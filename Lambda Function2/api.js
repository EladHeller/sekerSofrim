'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const loginManager = require('./loginManager');
const dal = require('./dal');

function getDoneFunction(callback) {
    return (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify({ res }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

exports.getMessages = (event, context, callback) => {
    const done = getDoneFunction(callback);
    dynamo.scan({ TableName: "Messages" }, (err, data) => {
        done(err, data.Items);
    });
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
            } else if (item.email || item.cellphoneNumber) {
                loginManager.createUserPassword(event.body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
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
                loginManager.createUserPassword(body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
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
    
    dal.getUserById(event.body.ID).
        then(evt => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done('משתמש לא נמצא');
            } else if ((!item.password) || (item.password !== event.body.password)) {
                done(null, {wrongPassword:true});
            } else if (item.password === event.body.password) {
                const cookieString = loginManager.generateCookie();
                loginManager.saveCookie(cookieString, event.body.ID).then(evt => {
                    if (evt.err) {
                        done(evt.err);
                    } else {
                        context.done(null, {
                            Cookie: cookieString
                        });
                    }
                });
            }
        });
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};
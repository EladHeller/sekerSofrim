'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
exports.getUserById = getUserById;
exports.getIdByCookie = getIdByCookie;
exports.saveCookie = saveCookie;
exports.addUserConfirmation = addUserConfirmation;
exports.updatePassword = updatePassword;
exports.updateUserDetails = updateUserDetails;
exports.deleteCookie = deleteCookie;
exports.getUserByCookie = getUserByCookie;

function deleteCookie() {

}

function getUserByCookie(cookie) {
    new Promise((resolve, reject) => {
        dal.getIdByCookie(cookie).then(evt => {
            if (evt.err) {
                resolve({ err: evt.err });
            } else if (!evt.data) {
                resolve();
            } else {
                dal.getUserById(evt.data.item.ID)
                    .then(resolve);
            }
        })
    });
}

function addUserConfirmation(ID, firstName, lastName, email, cellphoneNumber, phoneNumber){
    const params = {
        TableName: 'ChangeDetailsConfirmations', Item: {
            ID,
            firstName,
            lastName,
            email,
            cellphoneNumber,
            phoneNumber
        }
    };
    const promise = new Promise((resolve, success) => {
        dynamodb.putItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function updateUserDetails(ID, password, firstName, lastName, email, cellphoneNumber, phoneNumber){
    const params = {
        TableName: 'Users',
        Key: {
            ID: {
                S: ID
            }
        },
        UpdateExpression: `SET ${password && '#p = :p, '}${firstName && '#fn = :fn, '}`+
            `${lastName && '#ln = :ln, '}${email && '#e = :e, '}`+
            `${cellphoneNumber && '#cln = :cln, '}${phoneNumber && '#pn = :pn, '}`,
        ExpressionAttributeNames: {
            "#p": "password",
            "#fn": "firstName",
            "#ln": "lastName",
            "#e": "email",
            "#cln": "cellphoneNumber",
            "#pn": "phoneNumber"
        },
        ExpressionAttributeValues: {
            ":p": {S: password},
            ":fn": {S: firstName},
            ":ln": {S: lastName},
            ":e": {S: email},
            ":cln": {S: cellphoneNumber},
            ":pn": {S: phoneNumber}
        }
    };

    const promise = new Promise((resolve, reject) => {
        dynamodb.updateItem(params, (err, data) => {
            resolve({err,data});
        });
    });
    return promise;
}

function getUserById (ID) {
    const params = {
        "Key": {
            "ID": {
                S: ID
            }
        },
        TableName: "Users"
    };
    const promise = new Promise((resolve, reject) => {
        dynamodb.getItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function getIdByCookie(cookie) {
    const params = {
        "Key": {
            "Cookie": {
                S: cookie
            }
        },
        TableName: "Users"
    };
    const promise = new Promise((resolve, success) => {
        dynamodb.getItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function saveCookie(cookie, ID) {
    const params = {
        TableName: 'Cookies', Item: {
            cookie,
            ID,
            date: Date.now()
        }
    };
    const promise = new Promise((resolve, success) => {
        dynamodb.putItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function updatePassword(ID,password){
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
            resolve({err,data});
        });
    });

    return promise;
}
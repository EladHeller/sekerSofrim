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
exports.scanTable = scanTable;
exports.updateUserEnterTime = updateUserEnterTime;
exports.getUsersReport = getUsersReport;

function updateUserEnterTime(ID){
    const params = {
        TableName: 'Users',
        Key: {
            ID: {
                S: ID
            }
        },
        UpdateExpression: 'SET #t = :t',
        ExpressionAttributeNames: {
            "#t": "enterTime"
        },
        ExpressionAttributeValues: {
            ":t": {S: new Date().toJSON()}
        }
    };
    const promise = new Promise((resolve, reject)=>{
        dynamodb.updateItem(params, (err,data)=>{
            resolve({err,data});
        });
    });
    return promise;
}

function deleteCookie(cookie) {
    const params = {
        Key: {
            "cookie": {
                S: cookie
            }
        }, 
        TableName: "Cookies"
    };
    const promise = new Promise((resolve, reject)=>{
        dynamodb.deleteItem(params, function(err, data) {
            resolve({err,data});
        });
    });
    return promise;
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

function updateUserDetails(UID, password, firstName, lastName, email, cellphoneNumber, phoneNumber, id){
    const params = {
        TableName: 'Users',
        Key: {
            ID: {
                S: UID
            }
        },
        UpdateExpression: `SET ${id && '#i = :i, '}${password && '#p = :p, '}`+
            `${firstName && '#fn = :fn, '}${lastName && '#ln = :ln, '}${email && '#e = :e, '}`+
            `${cellphoneNumber && '#cln = :cln, '}${phoneNumber && '#pn = :pn'}`,
        ExpressionAttributeNames: {
            "#i": "ID",
            "#p": "password",
            "#fn": "firstName",
            "#ln": "lastName",
            "#e": "email",
            "#cln": "cellphoneNumber",
            "#pn": "phoneNumber"
        },
        ExpressionAttributeValues: {
            ":i": {S: ID},
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

function getUsersReport(){
    const params = {
        TableName: 'Users',
        ProjectionExpression: "#i, #t, #fn, #ln, #e, #cln, #pn", 
        ExpressionAttributeNames: {
            "#i": "ID",
            "#t": "enterTime",
            "#fn": "firstName",
            "#ln": "lastName",
            "#e": "email",
            "#cln": "cellphoneNumber",
            "#pn": "phoneNumber"
        }
    };

    const promise = new Promise((resolve,reject)=>{
        dynamo.scan(params, (err, data) => returnScanResult(resolve));
    });
    return promise;
}

function scanTable(tableName) {
    const promise = new Promise((resolve,reject)=>{
        dynamo.scan({ TableName: tableName }, returnScanResult(resolve));
    });
    return promise;
}

function returnScanResult(resolve){
    return (err, data) => {
        if (data && data.Items) {
            for (let item of Items) {
                for (let key in item){
                    item[key] = item[k].S || item[key].N || item;
                }
            }
        }
        resolve({err, data :data && data.Items});
    };
}
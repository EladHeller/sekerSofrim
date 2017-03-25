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
exports.deleteConfirmDetails = deleteConfirmDetails;
exports.replaceMessages = replaceMessages;
exports.updateTableCapacity = updateTableCapacity;
exports.batchWriteUseres = batchWriteUseres;

function batchWriteUseres(users){
     const params = {
        RequestItems: {}
     };

     params.RequestItems.Users = users.map(user=>{
        return{
            PutRequest: {
                Item: createDynamoItem(user)
            }
        };
     });

     const promise = new Promise((resolve,reject)=>{
        dynamodb.batchWriteItem(params,(err,data)=>{
            resolve({err,data});
        })
     });
     return promise;
}

function deleteConfirmDetails(ID) {
    const params = {
        Key: {
            "ID": { S: ID }
        },
        TableName: "ChangeDetailsConfirmations"
    };
    const promise = new Promise((resolve, reject) => {
        dynamodb.deleteItem(params, function (err, data) {
            resolve({ err, data });
        });
    });
    return promise;
}

function updateUserEnterTime(ID) {
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
            ":t": { S: new Date().toJSON() }
        }
    };

    const promise = new Promise((resolve, reject) => {
        dynamodb.updateItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function deleteCookie(cookie) {
    const params = {
        Key: {
            "Cookie": {
                S: cookie
            }
        },
        TableName: "Cookies"
    };
    const promise = new Promise((resolve, reject) => {
        dynamodb.deleteItem(params, function (err, data) {
            resolve({ err, data });
        });
    });
    return promise;
}

function getUserByCookie(cookie) {
    const promise = new Promise((resolve, reject) => {
        getIdByCookie(cookie).then(evt => {

            if (evt.err) {
                resolve({ err: evt.err });
            } else if (!(evt.data && evt.data.Item)) {
                resolve({ data: { user: null } });
            } else {
                getUserById(evt.data.Item.ID)
                    .then(resolve)
                    .catch(reject);
            }
        })
            .catch(reject);
    });
    return promise;
}

function addUserConfirmation(ID, firstName, lastName, email, phone, tel) {
    const params = {
        TableName: 'ChangeDetailsConfirmations', Item: {
            ID: { S: ID },
            firstName: { S: firstName },
            lastName: { S: lastName },
            email: { S: email },
            phone: { S: phone }
        }
    };
    if (tel) {
        params.Item.tel = { S: tel };
    }

    const promise = new Promise((resolve, success) => {
        dynamodb.putItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function updateUserDetails(ID, password, firstName, lastName, email, phone, tel, award) {
    const fields = {
        p: { name: 'password', value: password },
        fn: { name: 'firstName', value: firstName },
        ln: { name: 'lastName', value: lastName },
        e: { name: 'email', value: email },
        pn: { name: 'phone', value: phone },
        tl: { name: 'tel', value: tel },
        aw: { name: 'award', value: award }
    };

    const params = createUpdateQuery('Users', { ID: ID.toString() }, fields);
    console.log(params);
    const promise = new Promise((resolve, reject) => {
        if (!params) {
            resolve({});
        } else {
            dynamodb.updateItem(params, (err, data) => {
                resolve({ err, data });
            });
        }
    });
    return promise;
}

function getUserById(ID) {
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
            if (data && data.Item) {
                parseDynamoItem(data.Item);
            }
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
        TableName: "Cookies"
    };
    const promise = new Promise((resolve, reject) => {
        dynamodb.getItem(params, (err, data) => {
            if (data.Item) {
                parseDynamoItem(data.Item);
            }
            resolve({ err, data });
        });
    });
    return promise;
}

function saveCookie(cookie, ID) {
    const params = {
        TableName: 'Cookies', Item: {
            Cookie: { S: cookie },
            ID: { S: ID },
            date: { N: Date.now().toString() }
        }
    };
    const promise = new Promise((resolve, success) => {
        dynamodb.putItem(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function updatePassword(ID, password) {
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
            resolve({ err, data });
        });
    });

    return promise;
}

function getUsersReport() {
    const params = {
        TableName: 'Users',
        ProjectionExpression: "#i, #t, #fn, #ln, #e, #pn, #tl, #aw",
        ExpressionAttributeNames: {
            "#i": "ID",
            "#t": "enterTime",
            "#fn": "firstName",
            "#ln": "lastName",
            "#e": "email",
            "#pn": "phone",
            "#tl": "tel",
            "#aw": "award"
        }
    };

    const promise = new Promise((resolve, reject) => {
        dynamodb.scan(params, returnScanResult(resolve));
    });
    return promise;
}

function replaceMessages(messages) {
    let params = {
        RequestItems: {
            "Messages": []
        }
    };
    const promise = new Promise((resolve, reject) => {
        scanTable('Messages').then(evt => {
            if (evt.err) {
                resolve(evt);
            } else {
                evt.data && evt.data.forEach(msg => {
                    params.RequestItems.Messages.push({
                        DeleteRequest: {
                            Key: {
                                ID: { S: msg.ID }
                            }
                        }
                    });
                });
                messages.forEach(msg => {
                    params.RequestItems.Messages.push({
                        PutRequest: {
                            Item: {
                                ID: { S: guid() },
                                text: { S: msg }
                            }
                        }
                    });
                });
                dynamodb.batchWriteItem(params, function (err, data) {
                    resolve({ err, data });
                });
            }
        });
    });
    return promise;
}

function scanTable(tableName) {
    const promise = new Promise((resolve, reject) => {
        dynamodb.scan({ TableName: tableName }, returnScanResult(resolve));
    });
    return promise;
}

function returnScanResult(resolve) {
    return (err, data) => {
        if (data && data.Items) {
            data.Items.forEach(parseDynamoItem);
        }
        resolve({ err, data: data && data.Items });
    };
}

function parseDynamoItem(item) {
    for (let key in item) {
        item[key] = item[key].S || item[key].N || item;
    }
    return item;
}

function createUpdateQuery(tableName, objKey, objFields) {
    let query = {
        TableName: tableName,
        Key: {},
        UpdateExpression: '',
        ExpressionAttributeNames: {}
    };

    for (let key in objKey) {
        query.Key[key] = { S: objKey[key] };
    }

    const usedFields = Object.keys(objFields)
        .filter(key => (objFields[key].value !== '') && (objFields[key].value !== null) && (objFields[key].value !== undefined));
    const removeFields = Object.keys(objFields)
        .filter(key => objFields[key].value === '');
    
    if (removeFields.length){
        query.UpdateExpression += 'REMOVE ';
        for (let i = 0; i < (removeFields.length - 1); i++) {
            appendRemovedFieldToUpdateQuery(query, removeFields[i], objFields, false);
        }
        appendRemovedFieldToUpdateQuery(query, removeFields[removeFields.length - 1], objFields, true);
    } 
    if (usedFields.length) {
        if (query.UpdateExpression) {
            query.UpdateExpression += ' ';
        }
        query.ExpressionAttributeValues = {};
        query.UpdateExpression += 'SET ';
        for (let i = 0; i < (usedFields.length - 1); i++) {
            appendFieldToUpdateQuery(query, usedFields[i], objFields, false);
        }
        appendFieldToUpdateQuery(query, usedFields[usedFields.length - 1], objFields, true);
    }
    if (!query.UpdateExpression){
        return null;
    } else {
        return query;
    }
}

function appendRemovedFieldToUpdateQuery(query, field, objFields, isLast) {
    query.ExpressionAttributeNames['#' + field] = objFields[field].name;
    query.UpdateExpression += `#${field}${isLast ? '' : ', '}`;
}

function appendFieldToUpdateQuery(query, field, objFields, isLast) {
    query.ExpressionAttributeValues[":" + field] = { S: objFields[field].value };
    query.ExpressionAttributeNames['#' + field] = objFields[field].name;
    query.UpdateExpression += `#${field} = :${field}${isLast ? '' : ', '}`;
}

function updateTableCapacity(table, read, write){
    const params = {
        ProvisionedThroughput: {
            ReadCapacityUnits: read,
            WriteCapacityUnits: write
        }, 
        TableName: table
    };
    const promise = new Promise((resolve,reject)=>{
        dynamodb.updateTable(params, function(err, data) {
            resolve({err,data});
        });
    });
    return promise;
}

function createDynamoItem(item){
    const newItem ={};
    for (let key in item){
        if ((item[key] !== '') && (item[key] !== null) && (item[key] !== undefined)){
            newItem[key] = {S:item[key]};
        }
    }
    return newItem;
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
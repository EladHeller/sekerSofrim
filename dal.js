const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
exports.getUserById = getUserById;
exports.getIdByCookie = getIdByCookie;
exports.saveCookie = saveCookie;
    
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
            "Coolie": {
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
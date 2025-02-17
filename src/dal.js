const {
    DynamoDBClient,
    BatchWriteItemCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    PutItemCommand,
    GetItemCommand,
    QueryCommand
} = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ apiVersion: '2012-08-10' });

const tables = {
    Users: 'Users',
    ChangeDetailsConfirmations: 'ChangeDetailsConfirmations',
    Cookies: 'Cookies',
    Messages: 'Messages',
    Tables: 'Tables',
    Errors: 'Errors'
};

async function batchWriteUsers(users){
    const params = {
        RequestItems: {}
    };

    let requests = users.map(user=>{
        user.TableName = tables.Users;
        return {
            PutRequest: {
                Item: createDynamoItem(user)
            }
        };
    });

    let promises = [];
    while (requests.length) {
        params.RequestItems.Tables = requests.splice(0, 25);
        promises.push(new Promise((resolve, reject) => {
            dynamodb.send(new BatchWriteItemCommand(params), (err, data) => {
                resolve({ err, data });
            });
        }));
    }
    const values = await Promise.all(promises)
    let err = values.filter(val => val.err);
    let data = values.filter(val => val.data);
    if (err.length) {
        throw err;
    }
    return data;
}

async function deleteConfirmDetails(ID) {
    const params = {
        Key: {
            ID: { S: ID },
            TableName : {S: tables.ChangeDetailsConfirmations}
        },
        TableName: tables.Tables
    };
    return dynamodb.send(new DeleteItemCommand(params));
}

function updateUserEnterTime(ID) {
    const params = {
        TableName: tables.Tables,
        Key: {
            ID: {
                S: ID
            },
            TableName: {S:tables.Users}
        },
        UpdateExpression: 'SET #t = :t',
        ExpressionAttributeNames: {
            "#t": "enterTime"
        },
        ExpressionAttributeValues: {
            ":t": { S: new Date().toJSON() }
        }
    };

    return dynamodb.send(new UpdateItemCommand(params));
}

async function deleteCookie(cookie) {
    const params = {
        Key: {
            ID: { S: cookie },
            TableName:{S: tables.Cookies}
        },
        TableName: tables.Tables
    };
    return dynamodb.send(new DeleteItemCommand(params));
}

const getUserByCookie = async (cookie) => {
    const data = await getIdByCookie(cookie);
    if (!data || !data.Item) {
        return {data: {user: null}};
    }
    return getUserById(data.Item.UID)
}

async function addUserConfirmation(ID, firstName, lastName, pseudonym, email, phone, tel) {
    const params = {
        TableName: tables.Tables, Item: {
            TableName:{S: tables.ChangeDetailsConfirmations},
            ID: { S: ID },
            firstName: { S: firstName },
            lastName: { S: lastName },
            email: { S: email }
        }
    };
    if (tel) {
        params.Item.tel = { S: tel };
    }
    if (phone) {
        params.Item.phone = { S: phone };
    }
    if (pseudonym) {
        params.Item.pseudonym = { S: pseudonym };
    }

    return dynamodb.send(new PutItemCommand(params));
}

async function updateUserDetails(ID, password, firstName, lastName, pseudonym, email, phone, tel, award) {
    const fields = {
        p: { name: 'password', value: password },
        fn: { name: 'firstName', value: firstName },
        ln: { name: 'lastName', value: lastName },
        ps: { name: 'pseudonym', value: pseudonym },
        e: { name: 'email', value: email },
        pn: { name: 'phone', value: phone },
        tl: { name: 'tel', value: tel },
        aw: { name: 'award', value: award }
    };
            
    const keyObj = {TableName: tables.Users, ID: ID.toString() };
    const params = createUpdateQuery(tables.Tables, keyObj, fields);
    if (!params) {
        return {};
    } else {
        return dynamodb.send(new UpdateItemCommand(params));
    }
}

async function getUserById(ID) {
    const params = {
        "Key": {
            "ID": {
                S: ID
            },
            TableName:{S: tables.Users},
        },
        TableName: tables.Tables
    };
    const data = await dynamodb.send(new GetItemCommand(params));
    if (data && data.Item) {
        parseDynamoItem(data.Item);
    }
    return data;
}

async function getIdByCookie(cookie) {
    const params = {
        Key: {
            ID: {S: cookie}, 
            TableName: { S: tables.Cookies }
        }, 
        TableName: tables.Tables
    }
    const data = await dynamodb.send(new GetItemCommand(params));
    if (data.Item) {
        parseDynamoItem(data.Item);
    }
    return data;
}

async function saveCookie(cookie, ID) {
    const params = {
        TableName: tables.Tables,
        Item: {
            TableName: {S:tables.Cookies},
            ID: { S: cookie },
            UID: { S: ID },
            date: { N: Date.now().toString() }
        }
    };
    return dynamodb.send(new PutItemCommand(params));
}

async function saveErrorLog(err, event) {
    const params = {
        TableName: tables.Tables, Item: {
            TableName: { S: tables.Errors },
            ID: { S: guid() },
            err: { S: err },
            date: { S: new Date().toLocaleString() },
            event: {S: JSON.stringify(event) }
        }
    };
    return dynamodb.send(new PutItemCommand(params));
}

function updatePassword(ID, password) {
    const params = {
        TableName: tables.Tables,
        Key: {
            ID: {
                S: ID
            },
            TableName: {S:tables.Users},
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

    return dynamodb.send(new UpdateItemCommand(params));
}

function getUsersReport() {
    const params = {
        TableName: tables.Tables,
        ProjectionExpression: "#i, #t, #fn, #ln, #ps, #e, #pn, #tl, #aw, #p, #ad",
        ExpressionAttributeNames: {
            "#i": "ID",
            "#t": "enterTime",
            "#fn": "firstName",
            "#ln": "lastName",
            "#ps":"pseudonym",
            "#e": "email",
            "#pn": "phone",
            "#tl": "tel",
            "#aw": "award",
            "#p": "password",
            "#ad": "isAdmin"
        },
        ExpressionAttributeValues: {
        ":v1": {
            S: tables.Users
            }
        }, 
        KeyConditionExpression: "TableName = :v1", 
    };

    return dynamodb.send(new QueryCommand(params)).then(returnScanResult);
}

async function replaceMessages(messages) {
    let params = {
        RequestItems: {
            Tables: []
        }
    };
    const data = await scanTable(tables.Messages)
    data && data.forEach(msg => {
        params.RequestItems.Tables.push({
            DeleteRequest: {
                Key: {
                    TableName: {S:tables.Messages},
                    ID: { S: msg.ID }
                }
            }
        });
    });
    messages.forEach(msg => {
        params.RequestItems.Tables.push({
            PutRequest: {
                Item: {
                    TableName: {S:tables.Messages},
                    ID: { S: guid() },
                    text: { S: msg }
                }
            }
        });
    });
    return dynamodb.send(new BatchWriteItemCommand(params));
}

function scanTable(tableName) {
    const params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: tableName
            }
        }, 
        KeyConditionExpression: "TableName = :v1", 
        TableName: "Tables"
    };
    return dynamodb.send(new QueryCommand(params)).then(returnScanResult);
}

function returnScanResult(data) {
    if (data && data.Items) {
        data.Items.forEach(parseDynamoItem);
        return data && data.Items;
    }
    return data;
}

function parseDynamoItem(item) {
    delete item.TableName;
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

function createDynamoItem(item){
    const newItem = {};
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

module.exports = {
    getUserById,
    getIdByCookie,
    saveCookie,
    addUserConfirmation,
    updatePassword,
    updateUserDetails,
    deleteCookie,
    getUserByCookie,
    scanTable,
    updateUserEnterTime,
    getUsersReport,
    deleteConfirmDetails,
    replaceMessages,
    batchWriteUsers,
    saveErrorLog,
}

'use strict';

exports.getDoneFunction = getDoneFunction;
exports.authorize = authorize;
exports.authorizeAdmin = authorizeAdmin;
exports.api = api;

const dal = require('./dal');

function api(originalMethod){
    return (event, context, callback)=>{
        originalMethod(event,context,getDoneFunction(callback))
    };    
}

function getDoneFunction(callback) {
    return (err, res, statusCode, cookieString, contentType) => {
        const params = {
            statusCode: statusCode || (err ? '400' : '200'),
            body: err ? err.message || err : JSON.stringify({ res }),
            headers: {
                'Content-Type': contentType || 'application/json',
            }
        };
        if (cookieString) {
            params.Cookie = cookieString;
        }

        callback(null, params);
    };
}

function authorize(originalMethod, admin){
    return (event, context, callback)=>{
        const done = getDoneFunction(callback);
        const promise = admin ? dal.getUserByCookie(event.Cookie) : dal.getIdByCookie(event.Cookie);
        promise.then(evt=> {
            if (evt.err){
                done({err:evt.err});
            } else if (!evt.data || (admin && !evt.data.Item.isAdmin)){
                done({err:"You don't have permissions for this action",data:null, status:401});
            } else {
                event.ID = admin ? evt.data.Item.ID : evt.data.Item;
                originalMethod(event, context, done);
            }
        });
    };
}

function authorizeAdmin(originalMethod){
    return authorize(originalMethod, true);
}
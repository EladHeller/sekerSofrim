'use strict';

exports.getDoneFunction = getDoneFunction;
exports.authorize = authorize;
exports.authorizeAdmin = authorizeAdmin;

const dal = require('./dal');

function getDoneFunction(callback) {
    return (err, res, statusCode) => callback(null, {
        statusCode: statusCode || (err ? '400' : '200'),
        body: err ? err.message : JSON.stringify({ res }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
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
                event.body.ID = admin ? evt.data.Item.ID : evt.data.Item;
                originalMethod(event, context, callback);
            }
        });
    };
}

function authorizeAdmin(originalMethod){
    return authorize(originalMethod, true);
}
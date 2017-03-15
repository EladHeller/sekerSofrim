'use strict';

const dal = require('./dal');
const adminApi = require('./adminAPI');
const userDetailsApi = require('./userDetailsApi');
const usersAPI = require('./usersAPI');
const messagesApi = require('./messagesApi');

exports.rootApi = rootApi;

const methodByResource = {
    '/searchuserbyid': api(usersAPI.searchUserById),
    '/getconnecteduser': api(usersAPI.getConnectedUser),
    '/logout': api(usersAPI.logOut),
    '/passwordlogin': api(usersAPI.passwordLogin),
    '/resetpassword': api(usersAPI.resetPassword),
    '/getmessages': api(messagesApi.getMessages),
    '/updateuserdetails': authorize(userDetailsApi.updateUserDetails),
    '/getuserdetailsconfirms': authorizeAdmin(adminApi.getUserDetailsConfirms),
    '/getuserscsv': authorizeAdmin(adminApi.getUsersCSV),
    '/uploaduserscsv': authorizeAdmin(adminApi.uploadUsersCSV),
};

function api(originalMethod){
    return (event, context, callback)=>{
        const cookie = event.Cookie;
        event = JSON.parse(event.body);
        
        event.Cookie = cookie;
        console.log(event);
        originalMethod(event,context,getDoneFunction(callback));
    };    
}
function isString(obj){
    return Object.prototype.toString.call(obj) === '[object String]';
}

function rootApi(event, context, callback){
    console.log(event.path);
    methodByResource[event.path.toLowerCase()](event, context, callback);
}

function getError(err){
    let error;
    if (err){
        let errorMsg;
        if(isString(err)){
            errorMsg = err;
        } else if (err.message) {
            errorMsg = err.message;
        } else {
            errorMsg = JSON.parse(err);
        }
        error = JSON.stringify({errorMessage: errorMsg});
    }
    return error;
}

function getDoneFunction(callback) {
    return (err, res, statusCode, cookieString, contentType) => {
        console.log('getDoneFunction',err,res);
        try {
            let params = {
                statusCode: statusCode || (err ? '500' : '200'),
                body: err ? getError(err) : JSON.stringify(res),
                headers: {
                    'Content-Type': contentType || 'application/json',
                    'Access-Control-Allow-Origin':'*'
                }
            };
            if (cookieString) {
                params.headers['Set-Cookie'] = cookieString;
            }
            callback(null, params);
        
        } catch (e){
            callback(e);
        }

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
                event = JSON.parse(event.body);
                event.ID = admin ? evt.data.Item.ID : evt.data.Item;
                originalMethod(event, context, done);
            }
        })
        .catch(callback);
    };
}

function authorizeAdmin(originalMethod){
    return authorize(originalMethod, true);
}
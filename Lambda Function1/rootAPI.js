'use strict';

const dal = require('./dal');
const adminApi = require('./adminAPI');
const userDetailsApi = require('./userDetailsApi');
const usersAPI = require('./usersAPI');
const messagesApi = require('./messagesApi');
const systemApi = require('./systemAPI');

exports.rootApi = rootApi;

const methodByResource = {
    '/idlogin': api(usersAPI.searchUserById, 'POST'),
    '/getconnecteduser': api(usersAPI.getConnectedUser, 'POST'),
    '/logout': api(usersAPI.logOut, 'POST'),
    '/passwordlogin': api(usersAPI.passwordLogin, 'POST'),
    '/resetpassword': api(usersAPI.resetPassword, 'POST'),
    '/getmessages': api(messagesApi.getMessages, 'POST'),
    '/updateuserdetails': authorize(userDetailsApi.updateUserDetails, 'POST'),
    '/getuserdetailsconfirms': authorizeAdmin(adminApi.getUserDetailsConfirms, 'POST'),
    '/getusersreport': authorizeAdmin(adminApi.getUsersReport, 'POST'),
    '/uploadusers': authorizeAdmin(adminApi.uploadUsers, 'POST'),
    '/requestupdateuserdetails': api(usersAPI.requestUpdateUserDetails, 'POST'),
    '/confirmuserdetails': authorizeAdmin(adminApi.confirmUserDetails, 'POST'),
    '/replacemessages': authorizeAdmin(adminApi.replaceMessages, 'POST'),
    '/error': api(systemApi.saveErrorLog, 'POST')
};

function api(originalFunction, httpMethod) {
    return (event, context, callback) => {
        if (event.httpMethod !== httpMethod) {
            callback({ message: 'Method Not Allowed' }, null, 405);
        } else {
            const cookie = event.headers.Cookie;

            event = JSON.parse(event.body) || {};

            event.Cookie = cookie;
            console.log(event);
            originalFunction(event, context, callback);
        }
    };
}
function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}

function rootApi(event, context, callback) {
    console.log(event);
    let site = 'https://ssofrim.com';
    let origin = event.headers.Origin || event.headers.origin;
    
    if (origin) {
        if (origin.startsWith('http://localhost:') || (origin.startsWith(site))){
            const done = getDoneFunction(callback, origin);
            
            try {
                console.log(event.path);
                methodByResource[event.path.toLowerCase()](event, context, done);
            } catch (e) {
                done(e)
            }
        } else {
            getDoneFunction(callback, site)('no-cors',null,403);
        }
    }   
}

function getError(err) {
    let error;
    if (err) {
        let errorMsg;
        if (isString(err)) {
            errorMsg = err;
        } else if (err.message) {
            errorMsg = err.message;
        } else {
            errorMsg = err;
        }
        error = JSON.stringify({ errorMessage: errorMsg });
    }
    return error;
}

function getRes(res) {
    if (isString(res)) {
        return res;
    } else {
        return JSON.stringify(res);
    }
}

function getDoneFunction(callback, origin) {
    return (err, res, statusCode, cookieString, contentType) => {
        console.log('getDoneFunction', err, res, cookieString? : `Cookie ${cookieString}`:'');
        try {
            let params = {
                statusCode: statusCode || (err ? '500' : '200'),
                body: err ? getError(err) : getRes(res),
                headers: {
                    'Content-Type': contentType || 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': true
                }
            };
            if (err) {
                try {
                    dal.saveErrorLog(params.body).then(() => {
                        callback(null, params);
                    });
                } catch (e) { }
            } else {

                if (cookieString) {
                    params.headers['Set-Cookie'] = cookieString;
                }
                callback(null, params);
            }

        } catch (e) {
            callback(e);
        }

    };
}

function authorize(originalFunction, httpMethod, admin) {
    return (event, context, callback) => {
        if (event.httpMethod !== httpMethod) {
            callback('Method Not Allowed', null, 405);
        } else if (!event.headers.Cookie) {
            callback("You need to log on for this action", null, 401);
        } else {
            const promise = admin ? dal.getUserByCookie(event.headers.Cookie) : dal.getIdByCookie(event.headers.Cookie);
            promise.then(evt => {
                if (evt.err) {
                    callback({ err: evt.err });
                } else if (!evt.data.Item || (admin && !(evt.data.Item && evt.data.Item.isAdmin))) {
                    callback("You don't have permissions for this action", null, 401);
                } else {
                    event = JSON.parse(event.body) || {};
                    if (!admin) {
                        event.ID = evt.data.Item.UID;
                    }
                    console.log(event);
                    originalFunction(event, context, callback);
                }
            })
            .catch(callback);
        }
    };
}

function authorizeAdmin(originalFunction, httpMethod) {
    return authorize(originalFunction, httpMethod, true);
}
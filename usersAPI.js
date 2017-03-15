'use strict';

const loginManager = require('./loginManager');
const dal = require('./dal');

const logOut = (event, context, callback) => {
    dal.deleteCookie(event.Cookie).then(evt=>{
        callback(evt.err, evt.data);
    })
};

const resetPassword = (event, context, callback) => {
    dal.getUserById(event.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                callback(evt.err);
            } else if (!item) {
                callback(null, { userExist: false });
            } else if (item.email || item.cellphoneNumber) {
                loginManager.createUserPassword(event.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        callback(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    });
            }
        });
}

const searchUserById = (event, context, callback) => {
    if (!event.ID) {
        callback('require body with ID param',null,'400');
    } else {
        dal.getUserById(event.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                callback(evt.err);
            } else if (!item) {
                callback(null, { userExist: false });
            } else if (item.password) {
                callback(null, { userExist: true, hasPassword: true });
            } else if (item.email || item.cellphoneNumber) {
                loginManager.createUserPassword(event.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        callback(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    });
            } else {
                callback(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: false
                });
            }
        });
    }
};

const passwordLogin = (event, context, callback) => {
    dal.getUserById(event.ID).
        then(evt => {
            const user = evt.data && evt.data.Item;

            if (evt.err) {
                callback(evt.err);
            } else if (!user) {
                callback('משתמש לא נמצא');
            } else if ((!user.password) || (user.password !== event.password)) {
                callback(null, {wrongPassword:true});
            } else if (user.password === event.password) {
                const cookieString = loginManager.generateCookie();
                dal.updateUserEnterTime(ID).then(()=>{
                    dal.saveCookie(cookieString, event.ID).then(evt => {
                        if (evt.err) {
                            callback(evt.err);
                        } else {
                            callback(null, {user,Cookie: cookieString});
                        }
                    });
                });
            }
        });
};

const getConnectedUser = (event, context, callback) => {
    dal.getUserByCookie(event.Cookie).then(evt => {
        callback(evt.err, evt.data && evt.data.Item);
    });
};

const requestUpdateUserDetails  = (event, context, callback) => {
    dal.addUserConfirmation(event.ID,
        event.firstName,
        event.lastName, 
        event.email,
        event.cellphoneNumber, 
        event.phoneNumber).then(evt => {
        callback(evt.err, evt.data && evt.data.Item);
    });
};

exports.logOut = logOut;
exports.resetPassword = resetPassword;
exports.searchUserById = searchUserById;
exports.passwordLogin = passwordLogin;
exports.getConnectedUser = getConnectedUser;
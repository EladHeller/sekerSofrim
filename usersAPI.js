'use strict';

const loginManager = require('./loginManager');
const dal = require('./dal');
const awsProvider = require('./awsProvider');

const logOut = (event, context, callback) => {
    const done = awsProvider.getDoneFunction(callback);
    dal.deleteCookie(event.Cookie).then(evt=>{
        done(evt.err, evt.data);
    })
};

const resetPassword = (event, context, callback) => {
    const done = awsProvider.getDoneFunction(callback);
    dal.getUserById(event.body.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done(null, { userExist: false });
            } else if (item.email || item.cellphoneNumber) {
                loginManager.createUserPassword(event.body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        done(evt.err, {
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
    const done = awsProvider.getDoneFunction(callback);
    const body = event.body || {};

    if (!body.ID) {
        done('require body with ID param');
    } else {
        dal.getUserById(body.ID)
        .then((evt) => {
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!item) {
                done(null, { userExist: false });
            } else if (item.password) {
                done(null, { userExist: true, hasPassword: true });
            } else if (item.email || item.cellphoneNumber) {
                loginManager.createUserPassword(body.ID, item.email && item.email.S, item.cellphoneNumber && item.cellphoneNumber.S)
                    .then((evt) => {
                        done(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    });
            } else {
                done(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: false
                });
            }
        });
    }
};

const passwordLogin = (event, context, callback) => {
    const done = awsProvider.getDoneFunction(callback);
    
    dal.getUserById(event.body.ID).
        then(evt => {
            const user = evt.data && evt.data.Item;

            if (evt.err) {
                done(evt.err);
            } else if (!user) {
                done('משתמש לא נמצא');
            } else if ((!user.password) || (user.password !== event.body.password)) {
                done(null, {wrongPassword:true});
            } else if (user.password === event.body.password) {
                const cookieString = loginManager.generateCookie();
                loginManager.saveCookie(cookieString, event.body.ID).then(evt => {
                    if (evt.err) {
                        done(evt.err);
                    } else {
                        callback(null, {
                            statusCode: '200',
                            body: JSON.stringify({ user }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            Cookie: cookieString
                        });
                    }
                });
            }
        });
};

const getConnectedUser = (event, context, callback) => {
    const done = awsProvider.getDoneFunction(callback);
    dal.getUserByCookie(event.Cookie).then(evt => {
        done(evt.err, evt.data && evt.data.Item);
    });
};

const requestUpdateUserDetails  = (event, context, callback) => {
    let body = event.body;

    dal.addUserConfirmation(body.ID,
        body.firstName,
        body.lastName, 
        body.email,
        body.cellphoneNumber, 
        body.phoneNumber).then(evt => {
        done(evt.err, evt.data && evt.data.Item);
    });
};

exports.resetPassword = resetPassword;
exports.searchUserById = searchUserById;
exports.passwordLogin = passwordLogin;
exports.getConnectedUser = getConnectedUser;
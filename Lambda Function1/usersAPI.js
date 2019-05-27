const bcrypt = require('bcrypt');
const loginManager = require('./loginManager');
const dal = require('./dal');

const logOut = (event, context, callback) => {
    dal.deleteCookie(event.Cookie).then(evt=>{
        callback(evt.err, evt.data);
    })
    .catch(callback);
};


const resetPassword = (event, context, callback) => {
    dal.getUserById(event.ID)
        .then((evt) => {
            console.log(evt);
            const item = evt.data && evt.data.Item;
            if (evt.err) {
                callback(evt.err);
            } else if (!item) {
                callback(null, { userExist: false });
            } else if (item.email || item.phone) {
                loginManager.createUserPassword(event.ID, item.email, item.phone)
                    .then((evt) => {
                        callback(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    })
                    .catch(callback);
            }
        })
        .catch(callback);
}

const searchUserById = (event, context, callback) => {
    if (!event.ID) {
        callback('require body with ID param',null,'400');
    } else {
        dal.getUserById(event.ID)
        .then((evt) => {
            console.log(evt);
            const item = evt.data && evt.data.Item;

            if (evt.err) {
                callback(evt.err);
            } else if (!item) {
                callback(null, { userExist: false });
            } else if (item.password) {
                callback(null, { userExist: true, hasPassword: true });
            } else if (item.email || item.phone) {
                loginManager.createUserPassword(event.ID, item.email, item.phone)
                    .then((evt) => {
                        console.log(evt);
                        callback(evt.err, {
                            userExist: true,
                            hasPassword: false,
                            passwordSend: true,
                            sendPasswordTo: item.email ? 'email' : 'sms'
                        });
                    })
                    .catch(callback);
            } else {
                callback(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: false
                });
            }
        })
        .catch(callback);
    }
};

const passwordLogin = (event, context, callback) => {
    dal.getUserById(event.ID).then(async evt => {
        const user = evt.data && evt.data.Item;
        if (evt.err) {
            callback(evt.err);
            return;
        } 
        if (!user) {
            callback('משתמש לא נמצא');
            return;
        }

        if (!user.password || !bcrypt.compareSync(event.password, user.password)) {
            callback(null, {wrongPassword: true});
            return;
        }
        const cookie = loginManager.generateCookie();
        try {
            await dal.updateUserEnterTime(event.ID);
            const res = await dal.saveCookie(cookie.cookieToken, event.ID);
            if (res.err) {
                callback(res.err);
            } else {
                callback(null, {user},200,cookie.cookieString);
            }
        } catch (e) {
            callback(e);
        }
    });
};

const getConnectedUser = (event, context, callback) => {
    if (event.Cookie){
        dal.getUserByCookie(event.Cookie).then(evt => {
            if (evt.data && evt.data.Item){
                dal.updateUserEnterTime(evt.data.Item.ID).then(()=>{
                    callback(evt.err, {user : evt.data.Item});
                })
                .catch(callback);
            } else {
                callback(evt.err, {user : null});
            }
        })
        .catch(callback);
    } else {
        callback(null, {user:null});
    }
};

const requestUpdateUserDetails  = (event, context, callback) => {
    dal.addUserConfirmation(event.ID,
        event.firstName,
        event.lastName, 
        event.pseudonym, 
        event.email,
        event.phone, 
        event.tel).then(evt => {
            console.log(evt);
            callback(evt.err, {isLeggalDetails:true});
        })
        .catch(callback);
};

module.exports = {
    logOut,
    resetPassword,
    searchUserById,
    passwordLogin,
    getConnectedUser,
    requestUpdateUserDetails,
}

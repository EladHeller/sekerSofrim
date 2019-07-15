const bcrypt = require('bcrypt');
const loginManager = require('./loginManager');
const dal = require('./dal');

const logOut = (event, context, callback) => {
    dal.deleteCookie(event.Cookie)
        .then(data => callback(null, data))
        .catch(callback);
};


const resetPassword = (event, context, callback) => {
    dal.getUserById(event.ID)
        .then(async (data) => {
            const item = data && data.Item;
             if (!item) {
                callback(null, { userExist: false });
            } else if (item.email || item.phone) {
                await loginManager.createUserPassword(event.ID, item.email, item.phone)
                callback(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: true,
                    sendPasswordTo: item.email ? 'email' : 'sms'
                });
            }
        })
        .catch(callback);
}

const searchUserById = (event, context, callback) => {
    if (!event.ID) {
        callback('require body with ID param', null, '400');
    } else {
        dal.getUserById(event.ID)
        .then(async data => {
            const item = data && data.Item;

            if (!item) {
                callback(null, { userExist: false });
            } else if (item.password) {
                callback(null, { userExist: true, hasPassword: true });
            } else if (item.email || item.phone) {
                await loginManager.createUserPassword(event.ID, item.email, item.phone)
                callback(null, {
                    userExist: true,
                    hasPassword: false,
                    passwordSend: true,
                    sendPasswordTo: item.email ? 'email' : 'sms'
                });
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
    dal.getUserById(event.ID).then(async data => {
        const user = data && data.Item;
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
            await dal.saveCookie(cookie.cookieToken, event.ID);
            callback(null, {user},200,cookie.cookieString);
        } catch (e) {
            callback(e);
        }
    }).catch(callback);
};

const getConnectedUser = (event, context, callback) => {
    if (event.Cookie){
        dal.getUserByCookie(event.Cookie).then(async data => {
            if (data.Item) {
                await dal.updateUserEnterTime(data.Item.ID)
                callback(null, {user : data.Item});
            } else {
                callback(null, {user : null});
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
        event.tel)
        .then(() => callback(null, {isLeggalDetails:true}))
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

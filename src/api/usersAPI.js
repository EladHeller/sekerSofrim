const bcrypt = require('bcrypt');
const dal = require('../dal');
const {hashPassword, generateCookie, createUserPassword} = require('../loginManager');

// minimum 6 characters, contains at least one english letter, not starts or ends with white space
const passwordRegex = /(?=.{6,})(?=.*[a-zA-Z]+.*)(?=^(?:(?!^\s|\s$).)*$)/;

const logOut = (event) => dal.deleteCookie(event.Cookie);

const resetPassword = async (event) => {
    const res = await dal.getUserById(event.ID);
    const user = res && res.Item;
    if (!user) {
        return {
            userExist: false
        };
    } else if (user.email || user.phone) {
        await createUserPassword(event.ID, user.email, user.phone)
        return {
            userExist: true,
            hasPassword: false,
            passwordSend: true,
            sendPasswordTo: user.email ? 'email' : 'sms'
        };
    }
}

const searchUserById = async (event) => {
    if (!event.ID) {
        return {
            body: 'require body with ID param',
            statusCode: '400',
        };
    } else {
        const res = await dal.getUserById(event.ID)
        const user = res && res.Item;

        if (!user) {
            return {userExist: false};
        } else if (user.password) {
            return {userExist: true, hasPassword: true};
        } else if (user.email || user.phone) {
            await createUserPassword(event.ID, user.email, user.phone)
            return {
                userExist: true,
                hasPassword: false,
                passwordSend: true,
                sendPasswordTo: user.email ? 'email' : 'sms'
            };
        } else {
            return {
                userExist: true,
                hasPassword: false,
                passwordSend: false
            };
        }
    }
};

const passwordLogin = async (event) => {
    const res = await dal.getUserById(event.ID);
    const user = res && res.Item;
    if (!user) {
        throw 'משתמש לא נמצא';
    }

    if (!user.password || !bcrypt.compareSync(event.password, user.password)) {
        return {wrongPassword: true};
    }
    const cookie = generateCookie();
    await dal.updateUserEnterTime(event.ID);
    await dal.saveCookie(cookie.cookieToken, event.ID);
    return {
        body: {user},
        cookieString: cookie.cookieString
    };
};

const getConnectedUser = async (event) => {
    if (event.Cookie){
        const res = await dal.getUserByCookie(event.Cookie)
        if (res.Item) {
            await dal.updateUserEnterTime(res.Item.ID)
            return {user : res.Item};
        } else {
            return {user : null};
        }
    } else {
        return {user: null};
    }
};

const requestUpdateUserDetails = async (event) => {
    await dal.addUserConfirmation(event.ID,
        event.firstName,
        event.lastName, 
        event.pseudonym, 
        event.email,
        event.phone, 
        event.tel);
    return {isLeggalDetails:true};
};

const updateUserDetails = async (event) =>
    dal.updateUserDetails(event.ID,
        event.password && event.password.match(passwordRegex) && hashPassword(event.password),
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.pseudonym && event.pseudonym.trim(),
        event.email  && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim());

module.exports = {
    logOut,
    resetPassword,
    searchUserById,
    passwordLogin,
    getConnectedUser,
    updateUserDetails,
    requestUpdateUserDetails,
}

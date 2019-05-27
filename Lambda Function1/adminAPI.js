'use strict';

const dal = require('./dal');
const utils = require('./utils');
const sender = require('./sender');
const adminBL = require('./BL/adminBL');

const getUserDetailsConfirms = (event, context, callback) => {
    dal.scanTable('ChangeDetailsConfirmations').then(data => {
        callback(null, data);
    })
    .catch(err => callback({err}));
};

const getUsersReport = (event, context, callback) => {
    dal.getUsersReport().then(users => {
        const fields = ['ID', 'firstName', 'lastName', 'pseudonym','email', 'phone', 'tel', 'award', 'enterTime','password','isAdmin'];
        let data = [];
        data.push(fields);
        users.forEach(user => {
            data.push(fields.map(field => user[field] ? user[field].toString() : ''));
        });
        callback(null, data);
    })
    .catch(err => callback({err}));
};

const replaceMessages = (event, context, callback) => {
    dal.replaceMessages(event.messages).then(() => {
        callback(null, { message: 'success' });
    })
    .catch(err => callback({err}));
};

const uploadUsers = (event, context, callback) => {
    let users = event.users;
    users.forEach(user=>{
        if (user.award) {
            user.award = Number(user.award).toFixed(2);
        }
    });
    adminBL.updateUsers(users).then(data=> {
        callback(null, {message: 'success'});
    })
    .catch(err => callback({err}));
};

const confirmUserDetails = (event, context, callback) => {
    dal.updateUserDetails(event.ID,
        null,
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.pseudonym && event.pseudonym.trim(),
        event.email && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim())
        .then(evt => {
            if (evt.err) {
                callback(evt.err);
            } else {
                dal.deleteConfirmDetails(event.ID)
                    .then(evt => {
                        if (event.email) {
                            sender.sendMail([event.email], 'פרטיך באתר סקר סופרים עודכנו בהצלחה!', `כעת ניתן לחזור לאתר: http://ssofrim.com ולעדכן את שמות ספריך ובכך לסיים את ההרשמה.`)
                                .then(evt => {
                                    callback(evt.err, { isSaved: true, ID: event.ID });
                                });
                        } else if (event.phone) {
                            sender.sendSMS('פרטיך באתר סקר סופרים עודכנו בהצלחה!', event.phone)
                                .then(evt => {
                                    callback(evt.err, { isSaved: true, ID: event.ID });
                                });
                        }
                    })
                    .catch(callback);
            }
        })
        .catch(callback);
};
module.exports = {
    replaceMessages,
    uploadUsers,
    getUsersReport,
    getUserDetailsConfirms,
    confirmUserDetails,
}
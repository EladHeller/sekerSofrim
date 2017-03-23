'use strict';

const dal = require('./dal');
const utils = require('./utils');
const sender = require('./sender');
const adminBL = require('./BL/adminBL');

const getUserDetailsConfirms = (event, context, callback) => {
    dal.scanTable('ChangeDetailsConfirmations').then(evt => {
        callback(evt.err, evt.data);
    })
        .catch(callback);
};

const getUsersReport = (event, context, callback) => {
    dal.getUsersReport().then(evt => {
        if (evt.err) {
            callback(evt.err);
        } else {
            const fields = ['ID', 'firstName', 'lastName', 'email', 'phone', 'tel', 'award', 'enterTime'];
            let data = [];
            data.push(fields);
            evt.data.forEach(user => {
                data.push(fields.map(field => user[field] ? user[field].toString() : ''));
            });
            callback(null, data);
        }
    })
        .catch(callback);
};

const replaceMessages = (event, context, callback) => {
    dal.replaceMessages(event.messages).then(evt => {
        callback(evt.err, evt.data && { message: 'success' });
    })
    .catch(callback);
};

const uploadUsers = (event, context, callback) => {
    let users = event.users;
    adminBL.updateUsers(users).then(evt=>{
        callback(evt.err,evt.data);
    })
    .catch(callback);
};

const confirmUserDetails = (event, context, callback) => {
    dal.updateUserDetails(event.ID,
        null,
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
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
                            sender.sendMail([event.email], 'פרטיך באתר סקר סופרים עודכנו בהצלחה!', 'היכנס לאתר כדי לבדוק את זכאותך לתשלומי סופרים.')
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
exports.replaceMessages = replaceMessages;
exports.uploadUsers = uploadUsers;
exports.getUsersReport = getUsersReport;
exports.getUserDetailsConfirms = getUserDetailsConfirms;
exports.confirmUserDetails = confirmUserDetails;
'use strict';

const dal = require('./dal');
const utils = require('./utils');
const sender = require('./sender');

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
    let errors = [];
    let results = [];
    let index = 0;
    for (let user of users) {
        for (let key in user) {
            user[key] = user[key] ? user[key].toString().trim() : '';
        }
        while (user.ID.length < 9) {
            user.ID = '0' + user.ID;
        }
        if (user.phone && !(user.phone.startsWith('0') || user.phone.startsWith('+'))) {
            user.phone = '0' + user.phone;
        }

        if (user.tel && !(user.tel.startsWith('0') || user.tel.startsWith('+'))) {
            user.tel = '0' + user.tel;
        }


        dal.updateUserDetails(
            user.ID,
            null,
            user.firstName,
            user.lastName,
            user.email,
            user.phone,
            user.tel,
            user.award).then(evt => {
                if (evt.error) {
                    errors.push(evt.err);
                }
                index++;
                if (index === users.length) {
                    if (errors.length) {
                        callback('There are some errors\n' + errors.join('\n'));
                    } else {
                        callback(null, { message: 'Success' });
                    }
                }
            })
            .catch(callback);
    }
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
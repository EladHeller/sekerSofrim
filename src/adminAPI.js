'use strict';

const dal = require('./dal');
const sender = require('./sender');
const adminBL = require('./BL/adminBL');

const getUserDetailsConfirms = (event, context, callback) => {
    dal.scanTable('ChangeDetailsConfirmations').then(data => {
        callback(null, data);
    })
    .catch(callback);
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
    .catch(callback);
};

const replaceMessages = (event, context, callback) => {
    dal.replaceMessages(event.messages).then(() => {
        callback(null, { message: 'success' });
    })
    .catch(callback);
};

const uploadUsers = (event, context, callback) => {
    let users = event.users;
    users.forEach(user=> {
        if (user.award) {
            user.award = Number(user.award).toFixed(2);
        }
    });
    adminBL.updateUsers(users).then(data=> {
        callback(null, {message: 'success'});
    })
    .catch(callback);
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
        .then(async () => {
            await dal.deleteConfirmDetails(event.ID);
            if (event.email) {
                await sender.sendMail([event.email],
                    'פרטיך באתר סקר סופרים עודכנו בהצלחה!',
                    '<p style="direction:rtl;">כעת ניתן לחזור לאתר: http://ssofrim.com ולעדכן את שמות ספריך ובכך לסיים את ההרשמה.</p>');
            } else if (event.phone) {
                await sender.sendSMS('פרטיך באתר סקר סופרים עודכנו בהצלחה!', event.phone);
            }
            callback(null, { isSaved: true, ID: event.ID });
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
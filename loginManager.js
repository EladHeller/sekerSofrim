'use strict';

const dal = require('./dal');
exports.generateCookie = generateCookie;
exports.createUserPassword = createUserPassword;

function generateCookie() {
    var date = new Date();

    // Get Unix milliseconds at current time plus 365 days
    date.setTime(+ date + (365 * 86400000)); //24 \* 60 \* 60 \* 1000
    const cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
    const domain = '7npxc1c5ll.execute-api.us-west-2.amazonaws.com';
    const cookieString = `myCookie=${cookieVal}; domain=${domain}; expires=${date.toGMTString()};`;

    return cookieString;
}

function createUserPassword(ID, mailAddress, phoneNumber) {
    const sender = require('./sender');

    const password = generatePassword();

    const promise = new Promise((resolve, reject) => {
        dal.updatePassword(ID,password).then(evt=>{
            const msg = `סיסמתך החדשה לאתר סקר סופרים היא ${password}.`;
            if (evt.err) {
                resolve({ err : evt.err});
            } else if (mailAddress) {
                sender.sendMail([mailAddress], 'סיסמה חדשה לאתר סקר סופרים', msg)
                    .then(resolve)
                    .catch(reject);
            } else if (phoneNumber) {
                sender.sendSMS(msg, phoneNumber)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
    return promise;
}

function generatePassword() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(97 + Math.floor(Math.random() * 26)) +
        Math.random().toString().substring(2, 7);
}
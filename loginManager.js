const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const dal = require('./dal');
exports = {
    generateCookie,
    saveCookie: dal.saveCookie,
    getUserByCookie,
    createUserPassword
};
function generateCookie() {
    var date = new Date();

    // Get Unix milliseconds at current time plus 365 days
    date.setTime(+ date + (365 * 86400000)); //24 \* 60 \* 60 \* 1000
    const cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
    const domain = 'cofzlxjjjl.execute-api.us-west-2.amazonaws.com';
    const cookieString = `myCookie=${cookieVal}; domain=${domain}; expires=${date.toGMTString()};`;

    return cookieString;
}

function getUserByCookie(cookie) {
    new Promise((resolve, reject) => {
        dal.getIdByCookie(cookie).then(evt => {
            if (evt.err) {
                resolve({ err: evt.err });
            } else if (!evt.data) {
                resolve();
            } else {
                dal.saveCookie(cookie, evt.data.item.ID)
                    .then(resolve);
            }
        })
    });
}

function createUserPassword(ID, mailAddress, phoneNumber) {
    const sender = require('./sender');

    const password = generatePassword();
    const params = {
        TableName: 'Users',
        Key: {
            ID: {
                S: ID
            }
        },
        UpdateExpression: 'SET #p = :p',
        ExpressionAttributeNames: {
            "#p": "password"
        },
        ExpressionAttributeValues: {
            ":p": {
                S: password
            }
        }
    };

    const promise = new Promise((resolve, reject) => {
        dynamodb.updateItem(params, (err, data) => {
            const msg = `סיסמתך החדשה לאתר סקר סופרים היא ${password}.`;
            if (err) {
                resolve({ err });
            } else if (mailAddress) {
                sender.sendMail(mailAddress, 'סיסמה חדשה לאתר סקר סופרים', msg)
                    .then(resolve);
            } else if (phoneNumber) {
                sender.sendSMS(msg, phoneNumber)
                    .then(resolve);
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

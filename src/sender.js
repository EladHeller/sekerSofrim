const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

function sendMail(to, subject, text) {
    var params = {
        Destination: {
            BccAddresses: [
                'ssofrim@gmail.com'
            ],
            ToAddresses: to
        },
        Message: {
            Body: {
                Text: {
                    Data: text,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            }
        },
        Source: 'Seker Sofrim <ssofrim@gmail.com>'
    };
    return new Promise((resolve, reject) => {
        ses.sendEmail(params, (err, data) => {
            resolve({ err, data });
        });
    });
}

const sendSMS = (msg, phone) =>
    new Promise((resolve, reject) => {
        if (phone.startsWith('0')){
            phone = '+972' + phone.substr(1);
        }
        phone = phone.replace('-', '').replace(' ','');
        const smsParams = {
            Message: msg,
            PhoneNumber: phone
        };
        sns.publish(smsParams, (err, data) => {
            resolve({ err, data });
        });
    });

module.exports = {
    sendMail,
    sendSMS,
};

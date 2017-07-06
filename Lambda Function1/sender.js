'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

exports.sendMail = sendMail;
exports.sendSMS = sendSMS;

function sendMail(to, subject, text) {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
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
    const promise = new Promise((resolve, reject) => {
        ses.sendEmail(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function sendSMS(msg, phone) {
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
    
    const promise = new Promise((resolve, reject) => {
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
    return promise;
}
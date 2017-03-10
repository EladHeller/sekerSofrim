﻿const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

exports.sendMail = sendMail;
exports.sendSMS = sendSMS;

function sendMail(to, subject, text) {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    var params = {
        Destination: {
            BccAddresses: [
                'eladheller@gmail.com'
            ],
            ToAddresses: ['eladheller@gmail.com']
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
        Source: 'ssofrim@gmail.com'
    };
    const promise = new Promise((resolve, reject) => {
        ses.sendEmail(params, (err, data) => {
            resolve({ err, data });
        });
    });
    return promise;
}

function sendSMS(msg, phoneNumber) {
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
    const setAttributeParams = {
        attributes: {
            DefaultSenderID: defaultSenderId
        }
    };
    const promise = new Promise((resolve, reject) => {
        sns.setSMSAttributes(setAttributeParams, (err, data) => {
            if (err) {
                resolve({ err, data });
            } else {
                const smsParams = {
                    Message: msg,
                    PhoneNumber: phoneNumber
                };
                sns.publish(smsParams, (err, data) => {
                    resolve({ err, data });
                });
            }
        });
    });
    return promise;
}
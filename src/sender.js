const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

function sendMail(to, subject, html) {
    const params = {
        Destination: {
            BccAddresses: [
                'ssofrim@gmail.com'
            ],
            ToAddresses: to
        },
        Message: {
            Body: {
                Html: {
                    Data: html,
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
    return ses.sendEmail(params).promise();
}

const sendSMS = (msg, phone) => {
    if (phone.startsWith('0')){
        phone = '+972' + phone.substr(1);
    }
    phone = phone.replace('-', '').replace(' ','');
    const smsParams = {
        Message: msg,
        PhoneNumber: phone
    };
    return sns.publish(smsParams).promise();
};

module.exports = {
    sendMail,
    sendSMS,
};

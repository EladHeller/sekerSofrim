const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sns = new SNSClient({ region: 'us-west-2' });
const ses = new SESClient({ region: 'us-west-2' });

async function sendMail(to, subject, html) {
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
    return ses.send(new SendEmailCommand(params));
}

const sendSMS = (msg, phone) => {
    if (phone.startsWith('0')) {
        phone = '+972' + phone.substr(1);
    }
    phone = phone.replace('-', '').replace(' ', '');
    const smsParams = {
        Message: msg,
        PhoneNumber: phone
    };
    return sns.send(new PublishCommand(smsParams));
};

module.exports = {
    sendMail,
    sendSMS,
};

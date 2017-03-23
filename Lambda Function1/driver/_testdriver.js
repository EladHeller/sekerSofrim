/*
 * This is a utility file to help invoke and debug the lambda function. It is not included as part of the
 * bundle upload to Lambda.
 * 
 * Credentials:
 *  The AWS SDK for Node.js will look for credentials first in the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and then 
 *  fall back to the shared credentials file. For further information about credentials read the AWS SDK for Node.js documentation
 *  http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_the_Shared_Credentials_File_____aws_credentials_
 * 
 */

// Set the region to the locations of the S3 buckets
process.env['AWS_REGION'] = 'us-west-2'

var fs = require('fs');
var app = require('../rootAPI');
var adminAPI = require('../adminAPI');
var userDetailsApi = require('../userDetailsApi');
var sender = require('../sender');

// Load the sample event to be passed to Lambda. The _sampleEvent.json file can be modified to match
// what you want Lambda to process on.
var event = JSON.parse(fs.readFileSync(__dirname + '/simpleEvent.json', 'utf8').trim());

var context = {};
context.done = function () {
    console.log("Lambda Function Complete");
}
var callback = (err,data) => {
    console.log("Lambda Function Complete");
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
}
//userDetailsApi.updateUserDetails({ID:456456456,phone:'0546610723',password:'0000', tel:''}, context, callback)
//adminAPI.getUsersReport({}, context, callback);
adminAPI.uploadUsers({ users: 
[ { ID: '065765775',
firstName: 'בדיקה',
lastName: 'בודק',
email: 'tcdsvu3@gmail.com',
phone: '0123123123',
tel: '03456',
award: '',
enterTime: '2017-03-21T10:57:06.246Z' },
{ ID: '000006666',
firstName: 'משה',
lastName: 'שוורץ',
email: 'tcdsvu3@gmail.com',
phone: '0546610723',
tel: '0112312312',
award: '0',
enterTime: '' },
{ ID: '000005555',
firstName: 'שמירמות',
lastName: 'לוי',
email: 'tcdsvu3@gmail.com',
phone: '0546610723',
tel: '0112312312',
award: '0',
enterTime: '' },
{ ID: '123123123',
firstName: 'עוזיאל',
lastName: 'לוי',
email: 'tcdsvu3@gmail.com',
phone: '',
tel: '',
award: '2350',
enterTime: '2017-03-20T16:53:36.406Z' },
{ ID: '000002222',
firstName: 'מושיקו',
lastName: 'כהן',
email: '',
phone: '0546610723',
tel: '',
award: '',
enterTime: '2017-03-22T18:55:20.070Z' },
{ ID: '456456457',
firstName: '',
lastName: '',
email: '',
phone: '0546610723',
tel: '',
award: '',
enterTime: '' },
{ ID: '000001111',
firstName: '',
lastName: '',
email: '',
phone: '',
tel: '',
award: '',
enterTime: '2017-03-22T08:42:44.735Z' },
{ ID: '000951753',
firstName: '',
lastName: '',
email: 'NechemiaH@ms-ci.co.il',
phone: '',
tel: '',
award: '',
enterTime: '2017-03-20T15:37:47.829Z' },
{ ID: '000007777',
firstName: 'משה',
lastName: 'גרויס',
email: 'tcdsvu3@gmail.com',
phone: '0546610723',
tel: '0112312312',
award: '',
enterTime: '' },
{ ID: '000003333',
firstName: 'משה',
lastName: 'לוי',
email: 'tcdsvu3@gmail.com',
phone: '0546610723',
tel: '0112312312',
award: '0',
enterTime: '2017-03-21T21:12:49.301Z' },
{ ID: '456456456',
firstName: 'משה',
lastName: 'לוי',
email: '',
phone: '0546610723',
tel: '',
award: '45645',
enterTime: '2017-03-19T00:08:46.544Z' },
{ ID: '000004444',
firstName: 'משה',
lastName: 'ישראלי',
email: 'tcdsvu3@gmail.com',
phone: '0546610723',
tel: '0112312312',
award: '23432',
enterTime: '2017-03-21T10:50:08.511Z' } ] },context,callback)
// app.rootApi({ 
//     "path": "/updateUserDetails",
//     "httpMethod": "POST",
//     "body": "{\"ID\":\"456456456\",\"firstName\":\"משה\",\"lastName\":\"לוי\",\"password\":\"1111\",\"phone\":\"0546610723\",\"tel\":\"0112312312\",\"email\":\"tcdsvu3@gmail.com\"}",
//     "headers":  { 
//         "Origin": "https://he.wikipedia.org",
//         "Cookie":"token=2pjayz257b9"
//     }
// }, context, callback);
//adminAPI.replaceMessages({
//    messages:[
//        'אחת שתיים שלוש אני אחשוורוש',
//        'שמחה רבה, אביב הגיע פסח בא. תפרו לי בגד עם כיסים מלאו כיסי באגוזים. שמחה רבה, אביב הגיע פסח בא. תפרו לי בגד עם כיסים מלאו כיסי באגוזים. שמחה רבה, אביב הגיע פסח בא. תפרו לי בגד עם כיסים מלאו כיסי באגוזים. שמחה רבה, אביב הגיע פסח בא. תפרו לי בגד עם כיסים מלאו כיסי באגוזים.',
//        'לאוסקר יום הולדת'
//    ]
//},context,callback);
//sender.sendMail(['eladheller@gmail.com'], 'בדיקה כותרת', 'בדיקה תוכן')
//sender.sendSMS('בדיקה בדיקה', '0546610723')
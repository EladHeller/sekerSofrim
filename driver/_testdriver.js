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
//userDetailsApi.updateUserDetails({ID:456456456,phone:'0546610723',password:'1111'}, context, callback)
// adminAPI.getUsersCSV(event, context, callback);
adminAPI.uploadUsersCSV({
    file : `ID,firstName,lastName,email,phone,tel,award
"123123123","עוזי","לוי","tcdsvu3@gmail.com","","",""
"000002222","מושיקו","כהן","","0546610723","123",""
"000001111","","","","","",""
"4444","משה","לוי","tcdsvu3@gmail.com","0546610723","0112312312",""
"456456456","משה","לוי","tcdsvu3@gmail.com","0546610723","0112312312","45645"
"3333","משה","לוי","tcdsvu3@gmail.com","0546610723","0112312312","0"
"5555","משה","לוי","tcdsvu3@gmail.com","0546610723","0112312312","0"`
},context,callback)
// app.rootApi({ 
//     "path": "/updateUserDetails",
//     "httpMethod": "POST",
//     "body": "{\"ID\":\"456456456\",\"firstName\":\"משה\",\"lastName\":\"לוי\",\"password\":\"1111\",\"phone\":\"0546610723\",\"tel\":\"0112312312\",\"email\":\"tcdsvu3@gmail.com\"}",
//     "headers":  { 
//         "Origin": "https://he.wikipedia.org",
//         "Cookie":"token=2pjayz257b9"
//     }
// }, context, callback);
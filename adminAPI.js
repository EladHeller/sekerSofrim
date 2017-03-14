'use strict';

const dal = require('./dal');
const awsProvider = require('./awsProvider');
const utils = require('./utils');
const Papa = require('./papaparse');

const getUserDetailsConfirms = (event, context, callback)=>{
    dal.scanTable('ChangeDetailsConfirmations').then(evt=>{
        callback(evt.err,evt.data);
    });
};

const getUsersCSV =(event, context, callback) => {
    dal.getUsersReport().then(evt=>{
        if (evt.err){
            callback(evt.err);
        } else {
            evt.data.Items.forEach(item=> {
                item.UID = item.ID
            });
            
            const fields = ['UID','ID','firstName','lastName','email','cellphoneNumber','phoneNumber'];
            const csv = utils.json2csv(evt.data.Items, fields);
            callback(null,csv,200,null,'application/vnd.ms-excel');
        }
    });
};

const uploadUsersCSV =(event, context, callback) => {
    let res = Papa.parse(event.file,{header: true});
    let users =  res.data;
    let errors = [];
    let results = [];
    let index = 0;
    for (let user of users) {
        dal.updateUserDetails(
            user.UID, 
            null,
            user.firstName,
            user.lastName,
            user.email,
            user.cellphoneNummber,
            user.phoneNumber,
            user.ID).then(evt=> {
                if (evt.error){
                    errors.push(evt.err);
                }
                index++;
                if (index === users.length) {
                    if (errors.length) {
                        callback('There are some errors\n' + errors.join('\n'));
                    } else {
                        callback(null,'Success!');
                    }
                }
            });
    }
};
exports.uploadUsersCSV = awsProvider.authorizeAdmin(uploadUsersCSV);
exports.getUsersCSV = awsProvider.authorizeAdmin(getUsersCSV);
exports.getUserDetailsConfirms = awsProvider.authorizeAdmin(getUserDetailsConfirms);
'use strict';

const dal = require('./dal');
const utils = require('./utils');
const Papa = require('papaparse');

const getUserDetailsConfirms = (event, context, callback)=>{
    dal.scanTable('ChangeDetailsConfirmations').then(evt=>{
        console.log(evt);
        callback(evt.err,evt.data);
    })
    .catch(err=>callback(err));
};

const getUsersCSV =(event, context, callback) => {
    dal.getUsersReport().then(evt=>{
        console.log(evt);
        if (evt.err){
            callback(evt.err);
        } else {
            evt.data.Items.forEach(item=> {
                item.UID = item.ID
            });
            
            const fields = ['UID','ID','firstName','lastName','email','phone','tel'];
            const csv = utils.json2csv(evt.data.Items, fields);
            callback(null,csv,200,null,'application/vnd.ms-excel');
        }
    })
    .catch(err=>callback(err));
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
            user.phone,
            user.tel,
            user.ID).then(evt=> {
                if (evt.error){
                    errors.push(evt.err);
                }
                index++;
                if (index === users.length) {
                    if (errors.length) {
                        callback('There are some errors\n' + errors.join('\n'));
                    } else {
                        callback(null,{message:'Success!'});
                    }
                }
            })
            .catch(err=>callback(err));
    }
};
const confirmUserDetails = (event, context, callback)=>{
    
};
exports.uploadUsersCSV = uploadUsersCSV;
exports.getUsersCSV = getUsersCSV;
exports.getUserDetailsConfirms = getUserDetailsConfirms;
exports.confirmUserDetails = confirmUserDetails;
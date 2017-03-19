'use strict';

const dal = require('./dal');
const utils = require('./utils');
const Papa = require('papaparse');
const sender =require('./sender');

const getUserDetailsConfirms = (event, context, callback)=>{
    dal.scanTable('ChangeDetailsConfirmations').then(evt=>{
        callback(evt.err,evt.data);
    })
    .catch(callback);
};

const getUsersCSV =(event, context, callback) => {
    dal.getUsersReport().then(evt=>{
        if (evt.err){
            callback(evt.err);
        } else {
            const fields = ['ID','firstName','lastName','email','phone','tel','award'];
            const csv = utils.json2csv(evt.data, fields);
            callback(null,csv,200,null,'application/vnd.ms-excel');
        }
    })
    .catch(callback);
};

const uploadUsersCSV =(event, context, callback) => {
    let res = Papa.parse(event.file,{header: true});
    let users =  res.data;
    let errors = [];
    let results = [];
    let index = 0;
    for (let user of users) {
        dal.updateUserDetails(
            user.ID && user.ID.trim(), 
            null,
            user.firstName && user.firstName.trim(),
            user.lastName && user.lastName.trim(),
            user.email && user.email.trim(),
            user.phone && user.phone.trim(),
            user.tel && user.tel.trim(),
            user.award && user.award.trim()).then(evt=> {
                if (evt.error){
                    errors.push(evt.err);
                }
                index++;
                if (index === users.length) {
                    if (errors.length) {
                        callback('There are some errors\n' + errors.join('\n'));
                    } else {
                        callback(null,{message:'Success'});
                    }
                }
            })
            .catch(callback);
    }
};
const confirmUserDetails = (event, context, callback)=>{
    dal.updateUserDetails(event.ID,
        null,
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.email  && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim())
    .then(evt=>{
        if (evt.err){
            callback(evt.err);
        } else {
            dal.deleteConfirmDetails(event.ID)
            .then(evt=>{
                if (event.email) {
                    sender.sendMail([event.email],'פרטיך באתר סקר סופרים עודכנו בהצלחה!', 'היכנס לאתר כדי לבדוק את זכאותך לתשלומי סופרים.')
                    .then(evt=>{
                        callback(evt.err,{isSaved:true,ID:event.ID});
                    });
                } else if (event.phone){
                    sender.sendSMS('פרטיך באתר סקר סופרים עודכנו בהצלחה!',event.phone)
                    .then(evt=>{
                        callback(evt.err,{isSaved:true,ID:event.ID});
                    });
                }
            })            
            .catch(callback);
        }
    })
    .catch(callback);
};
exports.uploadUsersCSV = uploadUsersCSV;
exports.getUsersCSV = getUsersCSV;
exports.getUserDetailsConfirms = getUserDetailsConfirms;
exports.confirmUserDetails = confirmUserDetails;
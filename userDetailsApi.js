'use strict';
const dal = require('./dal');
const awsProvider = require('./awsProvider');
const updateUserDetails = (event, context, callback) => {
    let body = event.body;

    dal.updateUserDetails(body.ID,
        body.password && body.password.trim(),
        body.firstName && body.firstName.trim(),
        body.lastName && body.lastName.trim(),
        body.email  && body.email.trim(),
        body.cellphoneNumber && body.cellphoneNumber.trim(),
        body.phoneNumber && body.phoneNumber.trim()).then(evt=>{
            callback(evt.err,evt.data)
        });
};

exports.updateUserDetails = awsProvider.authorize(updateUserDetails);
'use strict';
const dal = require('./dal');
const updateUserDetails = (event, context, callback) => {
    dal.updateUserDetails(event.ID,
        event.password && event.password.trim(),
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.email  && event.email.trim(),
        event.cellphoneNumber && event.cellphoneNumber.trim(),
        event.phoneNumber && event.phoneNumber.trim()).then(evt=>{
            console.log(evt);
            callback(evt.err,evt.data)
        })
        .catch(callback);
};

exports.updateUserDetails = updateUserDetails;
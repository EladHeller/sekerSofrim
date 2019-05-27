const bcrypt = require('bcrypt');
const {hashPassword} = require('./loginManager');
const dal = require('./dal');

const updateUserDetails = (event, context, callback) => {
    dal.updateUserDetails(event.ID,
        event.password && hashPassword(event.password.trim()),
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.pseudonym && event.pseudonym.trim(),
        event.email  && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim()).then(evt=>{
            console.log(evt);
            callback(evt.err,evt.data)
        })
        .catch(callback);
};

module.exports = {
    updateUserDetails
};
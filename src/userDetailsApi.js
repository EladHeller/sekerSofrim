const {hashPassword} = require('./loginManager');
const dal = require('./dal');

// minimum 6 characters, contains at least one english letter, not starts or ends with white space
const passwordRegex = /(?=.{6,})(?=.*[a-zA-Z]+.*)(?=^(?:(?!^\s|\s$).)*$)/;

const updateUserDetails = (event, context, callback) => {
    dal.updateUserDetails(event.ID,
        event.password && event.password.match(passwordRegex) && hashPassword(event.password),
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.pseudonym && event.pseudonym.trim(),
        event.email  && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim()).then(data => {
            callback(null, data)
        })
        .catch(callback);
};

module.exports = {
    updateUserDetails
};
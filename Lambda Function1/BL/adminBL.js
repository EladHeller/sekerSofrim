const dal = require('../dal');

function isUserToUpdate(usr, existUsers){
    let isToUpdate = false;

    const existUser = existUsers.find(user=> user.ID === usr.ID);
    if (!existUser){
        isToUpdate = true;
    } else {
        for (let key in usr){
            let isSameKey = (usr[key] === existUser[key]) || 
                ((usr[key] === '') && !(key in existUser));
            if (!isSameKey) {
                isToUpdate = true;
                break;
            }
        }
    }

    return isToUpdate;
}

async function updateUsers(users){
    const data = await dal.scanTable('Users')
    users.forEach(prepareUserToUpdate);
    const usersToUpdate = users.filter(usr=> isUserToUpdate(usr, data));

    console.log('user to update', usersToUpdate);
    if (!usersToUpdate.length) {
       return {message: 'Success'};
    } else {
        return dal.batchWriteUsers(usersToUpdate);
    }
}

function prepareUserToUpdate(user) {
    for (let key in user) {
        user[key] = ((user[key] !== null) && (user[key] !== undefined)) ? user[key].toString().trim() : '';
    }
    while (user.ID.length < 9) {
        user.ID = '0' + user.ID;
    }
    if (user.phone && !(user.phone.startsWith('0') || user.phone.startsWith('+'))) {
        user.phone = '0' + user.phone;
    }

    if (user.tel && !(user.tel.startsWith('0') || user.tel.startsWith('+'))) {
        user.tel = '0' + user.tel;
    }
}

module.exports = {
    updateUsers,
};

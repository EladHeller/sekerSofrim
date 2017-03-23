'use strict';

const dal = require('../dal');

exports.updateUsers = updateUsers;


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

function updateUsers(users){
    const promise = new Promise((resolve,reject)=>{
        dal.scanTable('Users').then(evt=>{
            if (evt.err){
                resolve({err:evt.err});
            } else {
                let userToUpdate = [];
                users.forEach(prepareUserToUpdate);
                let usersToUpdate = users.filter(usr=> isUserToUpdate(usr, evt.data));

                let errors = [];
                let results = [];
                let index = 0;
                console.log('user to update ' + usersToUpdate);
                if (!usersToUpdate.length) {
                    resolve({ data: {message: 'Success'} });
                } else {
                    for (let user of usersToUpdate) {
                    dal.updateUserDetails(
                        user.ID,
                        null,
                        user.firstName,
                        user.lastName,
                        user.email,
                        user.phone,
                        user.tel,
                        user.award).then(evt => {
                            if (evt.error) {
                                errors.push(evt.err);
                            }
                            index++;
                            if (index === usersToUpdate.length) {
                                if (errors.length) {
                                    resolve('There are some errors\n' + errors.join('\n'));
                                } else {
                                    resolve({ data :{message: 'Success'} });
                                }
                            }
                        })
                        .catch(resolve);
                }
                }
            }
        })
        .catch(callback);

    });

    return promise;
}

function prepareUserToUpdate(user) {
    for (let key in user) {
        user[key] = user[key] ? user[key].toString().trim() : '';
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
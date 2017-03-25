'use strict';

const dal = require('../dal');
const MAX_USERS_UPDATE_COUNT = 4;
const USERS_WRITE_CAPACITY = 15;
const USERS_READ_CAPACITY = 15;
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
                users.forEach(prepareUserToUpdate);
                const usersToUpdate = users.filter(usr=> isUserToUpdate(usr, evt.data));

                console.log('user to update', usersToUpdate);
                if (!usersToUpdate.length) {
                    resolve({ data: {message: 'Success'} });
                } else if (usersToUpdate.length <= MAX_USERS_UPDATE_COUNT) {
                    updateUsersDetails(usersToUpdate)
                        .then(resolve)
                        .catch((err)=>resolve({err}));
                } else {
                    dal.updateTableCapacity('Users', USERS_READ_CAPACITY, usersToUpdate.length).then(({err,data})=>{
                        if (err) {
                            resolve({err});
                        } else {
                            updateUsersDetails(usersToUpdate).then(({err,data})=>{
                                if (err){
                                    resolve({err});
                                } else {
                                    dal.updateTableCapacity('Users', USERS_READ_CAPACITY, USERS_WRITE_CAPACITY).then(({err})=>{
                                        err && console.log('dal.updateTableCapacity', err);
                                        resolve(data);
                                    });
                                }
                            });
                        }
                    })
                }
            }
        })
        .catch((err)=>resolve({err}));
    });

    return promise;
}

function updateUsersDetails(usersToUpdate){
    const errors = [];
    let index = 0;
    const promise = new Promise((resolve,reject)=>{
        dal.batchWriteUseres(usersToUpdate)
            .then(resolve)
            .catch((err)=>resolve({err}));
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
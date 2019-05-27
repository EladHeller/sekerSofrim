const dal = require('./dal');
const {hashPassword} = require('./loginManager');

function updateUsers(event, context, callback) {
  dal.scanTable('Users').then(data => {
    return dal.batchWriteUsers(data.map(({password, ...data}) => ({
      ...data,
      password: hashPassword(password),
    })));
  })
  .then(() => callback(null, {message: 'success'}))
  .catch(err => callback({err}));
  
}
module.exports = {
  updateUsers,
}

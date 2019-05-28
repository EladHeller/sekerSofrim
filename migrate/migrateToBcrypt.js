const dal = require('./dal');
const bcrypt = require('bcrypt');

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

async function updateUsers() {
  const data = await dal.scanTable('Users');
  const users = data.filter(({password}) => password);
  await dal.batchWriteUsers(users.map(({password, ...data}) => ({
    ...data,
    password: hashPassword(password),
  })));
  return 'success'
  
}
module.exports = {
  updateUsers,
}
